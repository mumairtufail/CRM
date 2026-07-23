<?php

namespace App\Http\Controllers;

use App\Services\ErrorLogger;
use Illuminate\Http\Request;

class ErrorReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'file'    => 'nullable|string|max:255',
            'line'    => 'nullable|integer',
            'stack'   => 'nullable|string|max:20000',
            'url'     => 'nullable|string|max:255',
            'context' => 'nullable|array',
        ]);

        ErrorLogger::reportFrontend($validated);

        return response()->json(['ok' => true]);
    }
}
