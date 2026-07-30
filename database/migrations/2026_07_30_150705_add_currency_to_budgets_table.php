<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->char('currency', 3)->default('IDR')->after('amount');
        });

        Schema::table('budgets', function (Blueprint $table) {
            // A category can now have one budget per currency it's actually
            // spent in, instead of one ambiguous cross-currency budget.
            $table->dropUnique(['category_id', 'month', 'year']);
            $table->unique(['category_id', 'month', 'year', 'currency']);
        });
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropUnique(['category_id', 'month', 'year', 'currency']);
            $table->dropColumn('currency');
            $table->unique(['category_id', 'month', 'year']);
        });
    }
};