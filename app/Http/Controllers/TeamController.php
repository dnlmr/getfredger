<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetCurrentTeamRequest;
use App\Models\Team;

class TeamController extends Controller
{
    public function setCurrent(SetCurrentTeamRequest $request, Team $team)
    {
        $request->user()->currentTeam()->associate($team)->save();

        return redirect()->back();
    }
}
