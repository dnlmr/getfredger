<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\TeamMemberDestroyRequest;

class TeamMemberController extends Controller
{
    public function destroy(TeamMemberDestroyRequest $request, Team $team, User $user)
    {
        $team->members()->detach($user);

        $user->currentTeam()->associate($user->fresh()->teams->first())->save();

        return redirect()->route('team.members')->with('status', 'member-removed');
    }

    public function update(Request $request, Team $team, User $user)
    {
        if($request->has('role')) {
            tap($team->members->find($user), function (User $member) use ($request) {
                $member->roles()->detach();
                $member->assignRole($request->role);
            });
        }

        return redirect()->route('team.members')->with('status', 'role-updated');
    }
}
