<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\SetCurrentTeamRequest;
use App\Http\Requests\TeamUpdateRequest;
use Illuminate\Support\Facades\Validator;

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
            'team' => $request->user()->currentTeam
        ]);
    }

    public function update(TeamUpdateRequest $request, Team $team): RedirectResponse
    {
        $team->update($request->only('name'));

        return to_route('team.edit')->with('status', 'team-updated');
    }
}
