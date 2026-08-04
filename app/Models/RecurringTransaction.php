<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecurringTransaction extends Model
{
    use HasFactory;

    public const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'amount',
        'description',
        'frequency',
        'interval',
        'start_date',
        'end_date',
        'next_due_date',
        'last_generated_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'interval' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'next_due_date' => 'date',
            'last_generated_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeDue($query, ?CarbonInterface $asOf = null)
    {
        return $query->where('is_active', true)
            ->where('next_due_date', '<=', ($asOf ?? now())->toDateString());
    }

    /**
     * The next occurrence after a given date, respecting frequency + interval.
     * Uses addMonthsNoOverflow so a rule starting on Jan 31 clamps to Feb 28/29
     * instead of rolling over into March.
     */
    public function computeNextDueDate(CarbonInterface $from): CarbonInterface
    {
        return match ($this->frequency) {
            'daily' => $from->copy()->addDays($this->interval),
            'weekly' => $from->copy()->addWeeks($this->interval),
            'monthly' => $from->copy()->addMonthsNoOverflow($this->interval),
            'yearly' => $from->copy()->addYears($this->interval),
            default => throw new \InvalidArgumentException("Unknown frequency: {$this->frequency}"),
        };
    }
}