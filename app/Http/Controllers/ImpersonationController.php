<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    /**
     * Stop impersonating and return to the original super admin account.
     */
    public function leave(): RedirectResponse
    {
        $impersonatorId = session('impersonator_id');

        if (! $impersonatorId) {
            return redirect('/');
        }

        Auth::loginUsingId($impersonatorId);
        session()->forget('impersonator_id');

        return redirect()->route('admin.users.index')->with('success', 'Returned to your admin account.');
    }
}
