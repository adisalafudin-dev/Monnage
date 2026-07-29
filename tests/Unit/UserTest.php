<?php

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;

test('users have a passkeys relationship', function () {
    $user = new User();

    $relation = $user->passkeys();

    expect($relation)->toBeInstanceOf(HasMany::class)
        ->and($relation->getRelated()->getTable())->toBe('passkeys');
});
