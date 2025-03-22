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

    public function update(User $user, Team $team)
    {
        if (!$user->teams->contains($team)) {
            return false;
        }

        return $user->can('update team');
    }

    public function leave(User $user, Team $team)
    {
        if(!$user->teams->contains($team)) {
            return false;
        }

        return $user->teams->count() > 1;
    }

    public function removeTeamMember(User $user, Team $team, User $member)
    {
        if ($user->id === $member->id) {
            return false;
        }

        if($team->members->doesntContain($member)) {
            return false;
        }

        return $user->can('remove team members');
    }

    public function inviteToTeam(User $user, Team $team)
    {
        if($user->teams->doesntContain($team)) {
            return false;
        }

        return $user->can('invite team members');
    }

    public function revokeInvite(User $user, Team $team)
    {
        if($user->teams->doesntContain($team)) {
            return false;
        }

        return $user->can('revoke team invites');
    }

    public function changeMemberRole(User $user, Team $team, User $member)
    {
        // if($user->teams->doesntContain($team)) {
        //     return false;
        // }

        // if($team->members->doesntContain($member)) {
        //     return false;
        // }

        return $user->can('change member role');
    }
}
