<?php

use App\Http\Middleware\TeamsPermission;
use App\Mail\TeamInvitation;
use App\Models\Team;
use App\Models\TeamInvite;
use App\Models\User;
use Illuminate\Routing\Middleware\ValidateSignature;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

afterEach(function () {
    Str::createRandomStringsNormally();
});

it('creates an invite', function () {
    Mail::fake();

    $user = User::factory()->create();

    // Ensure team is not personal
    $user->currentTeam->forceFill([
        'personal_team' => false,
    ])->save();

    Str::createRandomStringsUsing(fn () => 'abc');

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => $email = 'invite@example.com',
        ])
        ->assertRedirect();

    Mail::assertSent(TeamInvitation::class, function (TeamInvitation $mail) use ($email) {
        return $mail->hasTo($email) &&
                $mail->teamInvite->token === 'abc';
    });

    assertDatabaseHas('team_invites', [
        'team_id' => $user->currentTeam->id,
        'email' => $email,
        'token' => 'abc',
    ]);
});

it('requires a valid email address', function () {
    $user = User::factory()->create();

    // Ensure team is not personal
    $user->currentTeam->forceFill([
        'personal_team' => false,
    ])->save();

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => 'abc',
        ])
        ->assertSessionHasErrors('email');
});

it('fails to create an invite if email is already used on team', function () {
    $user = User::factory()->create();

    // Ensure team is not personal
    $user->currentTeam->forceFill([
        'personal_team' => false,
    ])->save();

    TeamInvite::factory()->create([
        'team_id' => $user->currentTeam->id,
        'email' => $email = 'invite@example.com',
    ]);

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => $email,
        ])
        ->assertInvalid();
});

it('creates invite if email already invited to another team', function () {
    $user = User::factory()->create();

    TeamInvite::factory()
        ->for(Team::factory())
        ->create([
            'email' => $email = 'invite@example.com',
        ]);

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => $email,
        ])
        ->assertValid();
});

it('fails to send invite without permission', function () {
    $user = User::factory()->create();

    $user->teams()->attach(
        $anotherTeam = Team::factory()->create()
    );

    setPermissionsTeamId($anotherTeam->id);

    actingAs($user)
        ->withoutMiddleware(TeamsPermission::class)
        ->post(route('team.invites.store', $anotherTeam), [
            'email' => 'invite@example.com',
        ])
        ->assertForbidden();
});

it('can revoke an invite', function () {
    $user = User::factory()->create();

    $invite = TeamInvite::factory()
        ->for($user->currentTeam)
        ->create();

    actingAs($user)
        ->delete(route('team.invites.destroy', [$user->currentTeam, $invite]))
        ->assertRedirect(route('team.members'));

    $this->assertDatabaseMissing('team_invites', [
        'id' => $invite->id,
        'team_id' => $user->currentTeam->id,
        'email' => $invite->email,
    ]);
});

it('can not revoke an invite without permission', function () {
    $user = User::factory()->create();

    // Create another non-personal team
    $user->teams()->attach(
        $anotherTeam = Team::factory()->nonPersonalTeam()->create()
    );

    $invite = TeamInvite::factory()
        ->for($user->currentTeam)
        ->create();

    setPermissionsTeamId($anotherTeam->id);

    actingAs($user)
        ->withoutMiddleware(TeamsPermission::class)
        ->delete(route('team.invites.destroy', [$anotherTeam, $invite]))
        ->assertForbidden();
});

it('fails to accept if route is not signed', function () {
    $invite = TeamInvite::factory()
        ->for(Team::factory()->create())
        ->create();

    $acceptingUser = User::factory()->create();

    actingAs($acceptingUser)
        ->get('/team/invites/accept?token='.$invite->token)
        ->assertForbidden();
});

it('can accept an invite', function () {
    $invite = TeamInvite::factory()
        ->for(Team::factory()->create())
        ->create();

    $acceptingUser = User::factory()->create();

    assertDatabaseHas('team_invites', [
        'id' => $invite->id,
        'team_id' => $invite->team_id,
        'token' => $invite->token,
        'email' => $invite->email,
    ]);

    actingAs($acceptingUser)
        ->withoutMiddleware(ValidateSignature::class)
        ->get('/team/invites/accept?token='.$invite->token)
        ->assertRedirect(route('dashboard'));

    // Refresh the user model to get the updated relationships
    $acceptingUser->refresh();

    expect($acceptingUser->teams->contains($invite->team))->toBeTrue()
        ->and($acceptingUser->hasRole('team member'))->toBeTrue()
        ->and($acceptingUser->currentTeam->is($invite->team))->toBeTrue();

    assertDatabaseMissing('team_invites', [
        'id' => $invite->id,
        'team_id' => $invite->team_id,
        'token' => $invite->token,
        'email' => $invite->email,
    ]);
});

it('cannot send invite for personal team', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => 'invite@example.com',
        ])
        ->assertForbidden();

    assertDatabaseMissing('team_invites', [
        'team_id' => $user->currentTeam->id,
        'email' => 'invite@example.com',
    ]);
});
