<?php

use App\Models\Team;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('switches the current team for the user', function () {
    $user = User::factory()->create();

    $user->teams()->attach(
        $team = Team::factory()->create()
    );

    actingAs($user)
        ->patch(route('teams.current', $team))
        ->assertRedirect();

    expect($user->currentTeam->id)->toBe($team->id);
});

it('can not switch to a team that the user does not belong to', function() {
    $user = User::factory()->create();

    $anotherTeam = Team::factory()->create();

    actingAs($user)
        ->patch(route('teams.current', $anotherTeam))
        ->assertForbidden();

    expect($user->currentTeam->id)->not->toBe($anotherTeam->id);
});
