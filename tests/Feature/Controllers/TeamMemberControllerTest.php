<?php

use App\Http\Middleware\TeamsPermission;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('can remove a member from the team', function () {
    $user = User::factory()->create();

    $user->currentTeam->members()->attach(
        $member = User::factory()->create()
    );

    $member->currentTeam()->associate($user->currentTeam)->save();

    actingAs($user)
        ->delete(route('team.members.destroy', [$user->currentTeam, $member]))
        ->assertRedirect();

    expect($user->fresh()->currentTeam->members->contains($member))->toBeFalse()
        ->and($member->fresh()->currentTeam->id)->not->toEqual($user->currentTeam->id);
});

it('can not remove a member from the team without permission', function() {
    $user = User::factory()->create();

    $anotherUser = User::factory()->create();

    $user->currentTeam->members()->attach(
        $member = User::factory()->create()
    );

    setPermissionsTeamId($user->currentTeam->id);

    actingAs($anotherUser)
        ->withoutMiddleware(TeamsPermission::class)
        ->delete(route('team.members.destroy', [$user->currentTeam, $member]))
        ->assertForbidden();


    expect($user->fresh()->currentTeam->members->contains($member))->toBeTrue();
});

it('can not remove self from the team', function() {
    $user = User::factory()->create();

    actingAs($user)
        ->delete(route('team.members.destroy', [$user->currentTeam, $user]))
        ->assertForbidden();

    expect($user->fresh()->currentTeam->members->contains($user))->toBeTrue();
});
