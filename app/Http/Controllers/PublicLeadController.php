<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadEmail;
use App\Models\LeadPhone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicLeadController extends Controller
{
    public function show()
    {
        return Inertia::render('Public/LeadForm');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'nullable|string|max:100',
            'company'    => 'nullable|string|max:150',
            'job_title'  => 'nullable|string|max:150',
            'email'      => 'required|email|max:255',
            'phone'      => 'nullable|string|max:50',
            'website'    => 'nullable|string|max:255',
            'industry'   => 'nullable|string|max:100',
            'notes'      => 'nullable|string|max:2000',
        ]);

        $lead = Lead::create([
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'] ?? null,
            'company'    => $validated['company'] ?? null,
            'job_title'  => $validated['job_title'] ?? null,
            'website'    => $validated['website'] ?? null,
            'industry'   => $validated['industry'] ?? null,
            'notes'      => $validated['notes'] ?? null,
            'source'     => 'intake_form',
            'status'     => 'new',
        ]);

        $lead->emails()->create([
            'email'      => $validated['email'],
            'type'       => 'work',
            'is_primary' => true,
        ]);

        if (!empty($validated['phone'])) {
            $lead->phones()->create([
                'phone'      => $validated['phone'],
                'type'       => 'mobile',
                'is_primary' => true,
            ]);
        }

        return back()->with('submitted', true);
    }
}
