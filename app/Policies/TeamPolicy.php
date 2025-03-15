<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function setCurrent(User $user, Team $team)
    {
        return $user->teams->contains($team);
    }
}
