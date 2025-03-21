<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamInvite;
use App\Mail\TeamInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Http\Requests\TeamInvitesStoreRequest;
use App\Http\Requests\TeamInvitesDestroyRequest;

class TeamInviteController extends Controller
{
    public function store(TeamInvitesStoreRequest $request, Team $team)
    {
        $invite = $team->invites()->create([
            'email' => $request->email,
            'token' => str()->random(30),
        ]);

        Mail::to($request->email)->send(new TeamInvitation($invite));

        return redirect()->route('team.members')->withStatus('invite-sent');
    }

    public function destroy(TeamInvitesDestroyRequest $request, Team $team, TeamInvite $teamInvite)
    {
        $teamInvite->delete();

        return redirect()->route('team.members')->withStatus('invite-revoked');
    }

    public function accept(Request $request)
    {
        $invite = TeamInvite::where('token', $request->token)->firstOrFail();

        $request->user()->teams()->attach($invite->team);

        setPermissionsTeamId($invite->team->id);

        $request->user()->assignRole('team member');

        $request->user()->currentTeam()->associate($invite->team)->save();

        $invite->delete();


        return redirect()->route('dashboard')->withStatus('invite-accepted');
    }
}
