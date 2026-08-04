<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoogleSheetConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'spreadsheet_id',
        'spreadsheet_url',
        'last_synced_at',
    ];

    protected function casts(): array
    {
        return [
            // Laravel encrypts/decrypts these transparently using APP_KEY —
            // tokens are never stored in plaintext.
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'token_expires_at' => 'datetime',
            'last_synced_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isTokenExpired(): bool
    {
        return ! $this->token_expires_at
            || now()->greaterThanOrEqualTo($this->token_expires_at->subMinute());
    }

    public function hasSpreadsheet(): bool
    {
        return ! is_null($this->spreadsheet_id);
    }
}