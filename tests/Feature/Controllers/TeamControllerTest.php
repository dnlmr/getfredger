<?php

use App\Http\Middleware\TeamsPermission;
use App\Models\Team;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('switches the current team for the user', function () {
    $user = User::factory()->create();

    $user->teams()->attach(
        $team = Team::factory()->create()
    );

    actingAs($user)
        ->patch(route('team.current', $team))
        ->assertRedirect();

    expect($user->currentTeam->id)->toBe($team->id);
});

it('can not switch to a team that the user does not belong to', function() {
    $user = User::factory()->create();

    $anotherTeam = Team::factory()->create();

    actingAs($user)
        ->patch(route('team.current', $anotherTeam))
        ->assertForbidden();

    expect($user->currentTeam->id)->not->toBe($anotherTeam->id);
});

it('can update team', function() {
    $user = User::factory()->create();

    actingAs($user)
        ->patch(route('team.update', $user->currentTeam), [
            'name' => $name = 'New Team Name'
        ])
        ->assertRedirect();

    expect($user->fresh()->currentTeam->name)->toBe($name);
});

it('can not update if not in team', function() {
    $user = User::factory()->create();
    $anotherUser = User::factory()->create();

    actingAs($user)
        ->patch(route('team.update', $anotherUser->currentTeam), [
            'name' => 'New Team Name'
        ])
        ->assertForbidden();
});

it('can not update a team without permission', function() {
    $user = User::factory()->create();

    $user->teams()->attach(
        $anotherTeam  = Team::factory()->create()
    );

    setPermissionsTeamId($anotherTeam->id);

    actingAs($user)
        ->withoutMiddleware(TeamsPermission::class)
        ->patch(route('team.update', $anotherTeam), [
            'name' => 'New Team Name'
        ])
        ->assertForbidden();
});


it('can leave team', function() {
    $user = User::factory()
        ->has(Team::factory())
        ->create();

    $teamToLeave = $user->currentTeam;

    actingAs($user)
        ->post(route('team.leave', $teamToLeave))
        ->assertRedirect('dashboard');

    expect($user->fresh()->teams->contains($teamToLeave))->toBeFalse()
        ->and($user->fresh()->currentTeam->id)->not->toEqual($teamToLeave->id);
});

it('can not leave the team if we have only one remaining', function() {
    $user = User::factory()->create();

    actingAs($user)
        ->post(route('team.leave', $user->currentTeam))
        ->assertForbidden();

    expect($user->fresh()->teams->count())->toBe(1);
});

it('can not leave a team that we do not belong to', function() {
    $user = User::factory()->create();
    $anotherUser = User::factory()->create();

    actingAs($user)
        ->post(route('team.leave', $anotherUser->currentTeam))
        ->assertForbidden();
});

it('should show a list of team members', function() {
    $user = User::factory()->create();

    $user->currentTeam->members()->attach(
        $members = User::factory()->times(2)->create()
    );

    actingAs($user)
        ->get(route('team.members', $user->currentTeam))
        ->assertSeeText($members->first()->name)
        ->assertSeeText($members->last()->name);

        // ->assertInertia('team/members', [
        //     'team' => $user->currentTeam,
        //     'members' => $members
        // ]);

})->todo('Refactor test when page is implemented');
