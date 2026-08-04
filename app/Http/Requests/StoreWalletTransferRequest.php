<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWalletTransferRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'from_wallet_id' => [
                'required',
                'different:to_wallet_id',
                Rule::exists('wallets', 'id')
                    ->where('user_id', $this->user()->id)
                    ->where('status', true),
            ],
            'to_wallet_id' => [
                'required',
                Rule::exists('wallets', 'id')
                    ->where('user_id', $this->user()->id)
                    ->where('status', true),
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'exchange_rate' => ['required', 'numeric', 'min:0.000001'],
            'description' => ['nullable', 'string', 'max:5000'],
            'transferred_at' => ['required', 'date'],
        ];
    }
}
