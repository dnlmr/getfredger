<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;

Route::middleware('auth', 'verified')->group(function () {

    Route::patch('/teams/{team}/current', [TeamController::class, 'setCurrent'])
        ->name('team.current');

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

});
