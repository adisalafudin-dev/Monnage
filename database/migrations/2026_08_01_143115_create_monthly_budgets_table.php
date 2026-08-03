<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('monthly_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->char('currency', 3)->default('IDR');
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->timestamps();

            // One overall cap per user, per period, per currency — separate
            // from per-category budgets, which stay independently trackable.
            $table->unique(['user_id', 'month', 'year', 'currency']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_budgets');
    }
};
