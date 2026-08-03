<?php

namespace App\Console\Commands;

use App\Models\RecurringTransaction;
use App\Models\Wallet;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProcessRecurringTransactions extends Command
{
    protected $signature = 'recurring-transactions:process';

    protected $description = 'Generate due transactions from active recurring transaction rules, catching up on any missed occurrences.';

    /** Hard cap on how many occurrences a single rule can catch up on in one run. */
    private const MAX_CATCH_UP = 366;

    public function handle(): int
    {
        $dueRuleIds = RecurringTransaction::query()->due()->pluck('id');

        $rulesProcessed = 0;
        $transactionsCreated = 0;
        $rulesPaused = 0;

        foreach ($dueRuleIds as $ruleId) {
            DB::transaction(function () use ($ruleId, &$transactionsCreated, &$rulesPaused) {
                $rule = RecurringTransaction::query()->lockForUpdate()->find($ruleId);

                // Rule could have been deleted/deactivated between the pluck above and now.
                if (! $rule || ! $rule->is_active) {
                    return;
                }

                $wallet = Wallet::query()->lockForUpdate()->find($rule->wallet_id);

                if (! $wallet || ! $wallet->status) {
                    // Wallet archived (or gone) since the rule was created — pause
                    // rather than repeatedly failing to post against it.
                    $rule->update(['is_active' => false]);
                    $rulesPaused++;

                    return;
                }

                $category = $rule->category;
                $iterations = 0;

                while (
                    $rule->next_due_date->lte(today())
                    && $iterations < self::MAX_CATCH_UP
                ) {
                    $occurrenceDate = $rule->next_due_date->copy();

                    $wallet->transactions()->create([
                        'category_id' => $rule->category_id,
                        'amount' => $rule->amount,
                        'description' => $rule->description,
                        'transacted_at' => $occurrenceDate,
                    ]);

                    $sign = $category->type === 'income' ? 1 : -1;
                    $wallet->increment('balance', $sign * $rule->amount);

                    $transactionsCreated++;
                    $iterations++;

                    $nextDue = $rule->computeNextDueDate($occurrenceDate);

                    if ($rule->end_date && $nextDue->gt($rule->end_date)) {
                        $rule->next_due_date = $nextDue;
                        $rule->is_active = false;
                        break;
                    }

                    $rule->next_due_date = $nextDue;
                }

                $rule->last_generated_at = now();
                $rule->save();
            });

            $rulesProcessed++;
        }

        $this->info("Processed {$rulesProcessed} due rule(s): {$transactionsCreated} transaction(s) created, {$rulesPaused} rule(s) paused (archived wallet).");

        return self::SUCCESS;
    }
}