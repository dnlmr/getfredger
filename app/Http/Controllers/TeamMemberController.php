<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeamMemberDestroyRequest;
use App\Models\Team;
use App\Models\User;

class TeamMemberController extends Controller
{
    public function destroy(TeamMemberDestroyRequest $request, Team $team, User $user)
    {
        $team->members()->detach($user);

        $user->currentTeam()->associate($user->fresh()->teams->first())->save();

        return redirect()->route('team.members')->with('status', 'member-removed');
    }
}
