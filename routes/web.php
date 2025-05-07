<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Route::post('/invoices/upload', UploadController::class)
    //     ->name('invoices.upload');

    Route::post('/invoices/upload', [InvoiceController::class, 'upload'])
        ->name('invoices.upload');

    // Subscription routes
    Route::get('/subscription', function () {
        return Inertia::render('subscription', [
            'plans' => config('subscriptions.plans'),
        ]);
    })->name('subscription.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/team.php';
