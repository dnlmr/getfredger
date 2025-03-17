<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\SetCurrentTeamRequest;

class TeamController extends Controller
{
    public function setCurrent(SetCurrentTeamRequest $request, Team $team)
    {
        $request->user()->currentTeam()->associate($team)->save();

        return redirect()->back();
    }

    public function edit(Request $request)
    {
        return Inertia::render('Team/Edit', [
            'team' => $request->user()->currentTeam
        ]);
    }

    public function update(Request $request, Team $team): RedirectResponse
    {
        $team->update( $request->only('name') );

        return to_route('team.edit');
    }
}
