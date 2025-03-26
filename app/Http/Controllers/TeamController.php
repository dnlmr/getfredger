<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetCurrentTeamRequest;
use App\Http\Requests\TeamLeaveRequest;
use App\Http\Requests\TeamStoreRequest;
use App\Http\Requests\TeamUpdateRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function setCurrent(SetCurrentTeamRequest $request, Team $team)
    {
        $request->user()->currentTeam()->associate($team)->save();

        return to_route('dashboard');
    }

    public function edit(Request $request)
    {
        return Inertia::render('team/name', [
            'team' => $request->user()->currentTeam,
        ]);
    }

    public function store(TeamStoreRequest $request)
    {
        $user = auth()->user();

        $team = Team::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'personal_team' => false,
        ]);

        $user->teams()->attach($team);
        $user->currentTeam()->associate($team)->save();

        setPermissionsTeamId($team->id);
        $user->assignRole('team admin');

        return redirect()->route('team.edit', $team)->withStatus('team-created');
    }

    public function update(TeamUpdateRequest $request, Team $team): RedirectResponse
    {
        $team->update($request->only('name'));

        return redirect()->route('team.edit')->withStatus('team-updated');
    }

    public function leave(TeamLeaveRequest $request, Team $team): RedirectResponse
    {
        // Prevent leaving a personal team
        if ($team->personal_team) {
            return abort(403);
        }

        $user = $request->user();

        $user->teams()->detach($team);

        $user->currentTeam()->associate($user->fresh()->teams->first())->save();

        return to_route('dashboard');
    }

    public function members(Request $request)
    {
        // Show an Inertia page with a list of team members
        return Inertia::render('team/members', [
            'members' => $request->user()->currentTeam->members()->with('roles:name')->get(),
            'invites' => $request->user()->currentTeam->invites,
        ]);
    }
}
