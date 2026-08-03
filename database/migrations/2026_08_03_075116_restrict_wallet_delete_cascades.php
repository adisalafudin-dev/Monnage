<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['wallet_id']);
            $table->foreign('wallet_id')->references('id')->on('wallets')->restrictOnDelete();
        });

        Schema::table('wallet_transfers', function (Blueprint $table) {
            $table->dropForeign(['from_wallet_id']);
            $table->dropForeign(['to_wallet_id']);
            $table->foreign('from_wallet_id')->references('id')->on('wallets')->restrictOnDelete();
            $table->foreign('to_wallet_id')->references('id')->on('wallets')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['wallet_id']);
            $table->foreign('wallet_id')->references('id')->on('wallets')->cascadeOnDelete();
        });

        Schema::table('wallet_transfers', function (Blueprint $table) {
            $table->dropForeign(['from_wallet_id']);
            $table->dropForeign(['to_wallet_id']);
            $table->foreign('from_wallet_id')->references('id')->on('wallets')->cascadeOnDelete();
            $table->foreign('to_wallet_id')->references('id')->on('wallets')->cascadeOnDelete();
        });
    }
};