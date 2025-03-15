<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UploadController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('/invoices/upload', UploadController::class)
        ->name('invoices.upload');

    Route::patch('/teams/{team}/current', [TeamController::class, 'setCurrent'])
        ->name('teams.current');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
