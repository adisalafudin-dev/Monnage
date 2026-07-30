<?php

namespace App\Support;

class Currency
{
    /**
     * code => [name, symbol, decimals]
     */
    public const LIST = [
        'IDR' => ['name' => 'Rupiah Indonesia', 'symbol' => 'Rp', 'decimals' => 0],
        'USD' => ['name' => 'US Dollar', 'symbol' => '$', 'decimals' => 2],
        'EUR' => ['name' => 'Euro', 'symbol' => '€', 'decimals' => 2],
        'SGD' => ['name' => 'Singapore Dollar', 'symbol' => 'S$', 'decimals' => 2],
        'MYR' => ['name' => 'Ringgit Malaysia', 'symbol' => 'RM', 'decimals' => 2],
        'JPY' => ['name' => 'Yen Jepang', 'symbol' => '¥', 'decimals' => 0],
        'GBP' => ['name' => 'Pound Sterling', 'symbol' => '£', 'decimals' => 2],
        'AUD' => ['name' => 'Dolar Australia', 'symbol' => 'A$', 'decimals' => 2],
        'CNY' => ['name' => 'Yuan Tiongkok', 'symbol' => '¥', 'decimals' => 2],
    ];

    public static function codes(): array
    {
        return array_keys(self::LIST);
    }

    public static function isValid(string $code): bool
    {
        return array_key_exists(strtoupper($code), self::LIST);
    }
}