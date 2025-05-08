<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $user = Auth::user();
        $currentTeam = $user->currentTeam;
        $invoices = $currentTeam ? $currentTeam->invoices()->latest()->get() : collect();

        return Inertia::render('dashboard', [
            'invoices' => $invoices,
        ]);
    }
}
