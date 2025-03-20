<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeamInvitesDestroyRequest;
use App\Http\Requests\TeamInvitesStoreRequest;
use App\Models\Team;
use App\Models\TeamInvite;
use Illuminate\Http\Request;

class TeamInviteController extends Controller
{
    public function store(TeamInvitesStoreRequest $request, Team $team)
    {
        $invite = $team->invites()->create([
            'email' => $request->email,
            'token' => str()->random(30),
        ]);

        return redirect()->route('team.members')->withStatus('invite-sent');
    }

    public function destroy(TeamInvitesDestroyRequest $request, Team $team, TeamInvite $teamInvite)
    {
        $teamInvite->delete();

        return redirect()->route('team.members')->withStatus('invite-revoked');
    }
}
