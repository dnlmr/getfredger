<?php

namespace App\Observers;

use App\Models\Team;
use App\Models\User;

class UserObserver
{
    public function created(User $user)
    {
        $team = Team::create([
            'user_id' => $user->id,
            'name' => $user->name."'s team",
            'personal_team' => true,
        ]);

        $user->teams()->attach($team);
        $user->currentTeam()->associate($team);
        $user->save();

        setPermissionsTeamId($team->id);
        $user->assignRole('team admin');
    }

    public function deleting(User $user)
    {
        $user->teams()->detach();
    }
}
