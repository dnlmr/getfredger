<?php

use App\Models\Team;
use App\Models\User;
use App\Models\TeamInvite;
use function Pest\Laravel\actingAs;
use App\Http\Middleware\TeamsPermission;
use App\Mail\TeamInvitation;

use function Pest\Laravel\assertDatabaseHas;

afterEach(function () {
    Str::createRandomStringsNormally();
});

it('creates an invite', function () {
    Mail::fake();

    $user = User::factory()->create();

    Str::createRandomStringsUsing(fn () => 'abc');

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => $email = 'invite@example.com'
        ])
        ->assertRedirect();

    Mail::assertSent(TeamInvitation::class, function (TeamInvitation $mail) use ($email) {
        return  $mail->hasTo($email) &&
                $mail->teamInvite->token === 'abc';
    });

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

it('fails to create an invite if email is already used on team', function() {
    $user = User::factory()->create();

    TeamInvite::factory()->create([
        'team_id' => $user->currentTeam->id,
        'email' => $email = 'invite@example.com'
    ]);

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => $email
        ])
        ->assertInvalid();
});


it('creates invite if email already invited to another team', function () {
    $user = User::factory()->create();

    TeamInvite::factory()
        ->for(Team::factory())
        ->create([
            'email' => $email = 'invite@example.com'
        ]);

    actingAs($user)
        ->post(route('team.invites.store', $user->currentTeam), [
            'email' => $email
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
            'email' => 'invite@example.com'
        ])
        ->assertForbidden();
});

it('can revoke an invite', function() {
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

it('can not revoke an invite without permission', function() {
    $user = User::factory()->create();

    $user->teams()->attach(
        $anotherTeam = Team::factory()->create()
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
