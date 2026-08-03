<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyBudget extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'amount', 'currency', 'month', 'year'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}