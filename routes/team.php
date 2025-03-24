<?php

use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamInviteController;
use App\Http\Controllers\TeamMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth', 'verified')->group(function () {

    Route::patch('/team/{team}/current', [TeamController::class, 'setCurrent'])
        ->name('team.current');

    // Team creation
    Route::get('/team/create', [TeamController::class, 'create'])
        ->name('team.create');
    Route::post('/team', [TeamController::class, 'store'])
        ->name('team.store');

    // Team name
    Route::get('/team/name', [TeamController::class, 'edit'])
        ->name('team.edit');
    Route::patch('/team/{team}', [TeamController::class, 'update'])
        ->name('team.update');
    Route::post('/team/{team}/leave', [TeamController::class, 'leave'])
        ->name('team.leave');

    // Team members
    Route::get('/team/members', [TeamController::class, 'members'])
        ->name('team.members');
    Route::delete('/team/{team}/members/{user}', [TeamMemberController::class, 'destroy'])
        ->name('team.members.destroy');

    // Team invitations
    Route::post('/team/{team}/invites', [TeamInviteController::class, 'store'])
        ->name('team.invites.store');
    Route::delete('/team/{team}/invites/{teamInvite}', [TeamInviteController::class, 'destroy'])
        ->name('team.invites.destroy');
    Route::get('/team/invites/accept', [TeamInviteController::class, 'accept'])
        ->name('team.invites.accept')
        ->middleware('signed');

    // Team roles
    Route::patch('/team/{team}/members/{user}', [TeamMemberController::class, 'update'])
        ->name('team.members.update');
});
