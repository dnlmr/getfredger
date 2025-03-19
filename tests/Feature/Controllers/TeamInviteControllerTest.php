<?php

use App\Models\User;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

afterEach(function () {
    Str::createRandomStringsNormally();
});

it('creates an invite', function () {
    $user = User::factory()->create();

    Str::createRandomStringsUsing(fn () => 'abc');

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => $email = 'invite@example.com'
        ])
        ->assertRedirect();

    assertDatabaseHas('team_invites', [
        'team_id' => $user->currentTeam->id,
        'email' => $email,
        'token' => 'abc'
    ]);
});

it('requires an email address', function() {
    $user = User::factory()->create();

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => ''
        ])
        ->assertSessionHasErrors('email');
});
