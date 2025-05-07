<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    /** @use HasFactory<\Database\Factories\TeamFactory> */
    use HasFactory;

    protected $guarded = [];

    public function members()
    {
        return $this->belongsToMany(User::class);
    }

    public function invites()
    {
        return $this->hasMany(TeamInvite::class);
    }

    /**
     * Get the invoices associated with the team.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
