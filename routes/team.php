<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeamController;

Route::middleware('auth', 'verified')->group(function () {

    Route::patch('/teams/{team}/current', [TeamController::class, 'setCurrent'])
        ->name('team.current');

    // Settings
    Route::get('/team', [TeamController::class, 'edit'])
        ->name('team.edit');
    Route::patch('/team/{team}', [TeamController::class, 'update'])
        ->name('team.update');

    // Leave team
    Route::post('/team/{team}/leave', [TeamController::class, 'leave'])
        ->name('team.leave');
});
