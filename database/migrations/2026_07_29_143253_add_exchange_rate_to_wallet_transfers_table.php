<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wallet_transfers', function (Blueprint $table) {
            // Rate to convert 1 unit of the source wallet's currency into the
            // destination wallet's currency. 1 for same-currency transfers.
            $table->decimal('exchange_rate', 18, 6)->default(1)->after('amount');

            // Amount actually credited to the destination wallet, in its own
            // currency (amount * exchange_rate, rounded to 2dp). Equal to
            // `amount` for same-currency transfers.
            $table->decimal('converted_amount', 15, 2)->after('exchange_rate');
        });
    }

    public function down(): void
    {
        Schema::table('wallet_transfers', function (Blueprint $table) {
            $table->dropColumn(['exchange_rate', 'converted_amount']);
        });
    }
};