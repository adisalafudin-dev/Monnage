<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    /** A wallet that can be selected for new transactions and transfers. */
    public const STATUS_ACTIVE = true;

    /** A historical wallet; its records remain visible but new activity is blocked. */
    public const STATUS_ARCHIVED = false;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'balance',
        'currency',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'status' => 'boolean',
        ];
    }

    /**
     * Limit a wallet query to wallets available for new financial activity.
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function transfersFrom()
    {
        return $this->hasMany(WalletTransfer::class, 'from_wallet_id');
    }

    public function transfersTo()
    {
        return $this->hasMany(WalletTransfer::class, 'to_wallet_id');
    }

    public function recurringTransactions()
    {
        return $this->hasMany(RecurringTransaction::class);
    }
}
