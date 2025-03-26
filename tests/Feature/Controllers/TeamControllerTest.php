<?php

use App\Http\Middleware\TeamsPermission;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

it('switches the current team for the user', function () {
    $user = User::factory()->create();

    $user->teams()->attach(
        $team = Team::factory()->create([
            'user_id' => $user->id,
            'personal_team' => false,
        ])
    );

    actingAs($user)
        ->patch(route('team.current', $team))
        ->assertRedirect();

    expect($user->currentTeam->id)->toBe($team->id)
        ->and($user->teams)->toHaveCount(2);
});

it('can not switch to a team that the user does not belong to', function () {
    $user = User::factory()->create();
    $anotherUser = User::factory()->create();

    $anotherTeam = Team::factory()->create([
        'user_id' => $anotherUser->id,
    ]);

    $anotherUser->teams()->attach($anotherTeam);

    actingAs($user)
        ->patch(route('team.current', $anotherTeam))
        ->assertForbidden();

    expect($user->currentTeam->id)->not->toBe($anotherTeam->id)
        ->and($user->teams)->toHaveCount(1)
        ->and($anotherUser->teams)->toHaveCount(2);
});

it('can update team', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->patch(route('team.update', $user->currentTeam), [
            'name' => $name = 'New Team Name',
        ])
        ->assertRedirect();

    expect($user->fresh()->currentTeam->name)->toBe($name);
});

it('can not update if not in team', function () {
    $user = User::factory()->create();
    $anotherUser = User::factory()->create();

    actingAs($user)
        ->patch(route('team.update', $anotherUser->currentTeam), [
            'name' => 'New Team Name',
        ])
        ->assertForbidden();
});

it('can not update a team without permission', function () {
    $user = User::factory()->create();
    $anotherUser = User::factory()->create();

    $user->teams()->attach(
        $anotherTeam = Team::factory()->create([
            'user_id' => $anotherUser->id,
            'personal_team' => false,
        ])
    );

    setPermissionsTeamId($anotherTeam->id);

    actingAs($user)
        ->withoutMiddleware(TeamsPermission::class)
        ->patch(route('team.update', $anotherTeam), [
            'name' => 'New Team Name',
        ])
        ->assertForbidden();
});

it('can leave a team', function () {
    $user = User::factory()->create();

    // Create a non-personal team that the user belongs to
    $teamToLeave = Team::factory()->create([
        'user_id' => $user->id,
        'personal_team' => false,
    ]);

    // Ensure user has multiple teams (current personal team + new non-personal team)
    $user->teams()->attach($teamToLeave);

    actingAs($user)
        ->post(route('team.leave', $teamToLeave))
        ->assertRedirect('dashboard');

    expect($user->fresh()->teams->contains($teamToLeave))->toBeFalse()
        ->and($user->fresh()->currentTeam->id)->not->toEqual($teamToLeave->id);
});

it('can not leave the team if we have only one remaining', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post(route('team.leave', $user->currentTeam))
        ->assertForbidden();

    expect($user->fresh()->teams->count())->toBe(1);
});

it('can not leave a team that we do not belong to', function () {
    $user = User::factory()->create();
    $anotherUser = User::factory()->create();

    actingAs($user)
        ->post(route('team.leave', $anotherUser->currentTeam))
        ->assertForbidden();
});

it('should show a list of team members', function () {
    $user = User::factory()->create();

    $user->currentTeam->members()->attach(
        $members = User::factory()->times(2)->create()
    );

    actingAs($user)
        ->get(route('team.members', $user->currentTeam))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('team/members')
            ->has('members', 3)
        );
});

it('can create a team', function () {
    $user = User::factory()->create();
    $originalTeam = $user->currentTeam;

    actingAs($user)
        ->post(route('team.store'), [
            'name' => $teamName = 'New Team',
        ])
        ->assertRedirect();

    $user->refresh();
    $newTeam = $user->currentTeam;

    expect($user->teams)->toHaveCount(2)
        ->and($newTeam->name)->toBe($teamName)
        ->and($newTeam->user_id)->toBe($user->id)
        ->and($newTeam->personal_team)->toBe(0)
        ->and($newTeam->id)->not->toBe($originalTeam->id);
});

it('cannot leave personal team', function () {

    $user = User::factory()->create();
    $personalTeam = Team::factory()->withPersonalTeam()->create([
        'user_id' => $user->id,
    ]);

    $user->teams()->attach($personalTeam);

    actingAs($user)
        ->post(route('team.leave', $personalTeam))
        ->assertForbidden();

    expect($user->fresh()->teams->contains($personalTeam))->toBeTrue();
});
