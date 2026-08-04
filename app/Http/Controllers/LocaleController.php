<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', Rule::in(SetLocale::SUPPORTED)],
        ]);

        if ($request->user()) {
            $request->user()->update(['locale' => $validated['locale']]);
        }

        return back()->cookie('locale', $validated['locale'], 60 * 24 * 365);
    }
}