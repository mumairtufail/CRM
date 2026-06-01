<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::with(['emails', 'phones', 'tags'])
            ->withCount('activities');

        if ($search = $request->input('search')) {
            $query->search($search);
        }

        if ($status = $request->input('status')) {
            $query->byStatus($status);
        }

        if ($source = $request->input('source')) {
            $query->where('source', $source);
        }

        $sort  = $request->input('sort', 'created_at');
        $dir   = $request->input('dir', 'desc');
        $query->orderBy($sort, $dir);

        $leads = $query->paginate(20)->withQueryString();

        return Inertia::render('Leads/Index', [
            'leads'   => $leads,
            'filters' => $request->only(['search', 'status', 'source', 'sort', 'dir']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Leads/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'   => 'required|string|max:100',
            'last_name'    => 'nullable|string|max:100',
            'company'      => 'nullable|string|max:150',
            'job_title'    => 'nullable|string|max:150',
            'website'      => 'nullable|string|max:255',
            'linkedin_url' => 'nullable|string|max:255',
            'notes'        => 'nullable|string',
            'source'       => 'nullable|string|max:50',
            'status'       => 'nullable|string|max:50',
            'priority'     => 'nullable|string|max:20',
            'deal_value'   => 'nullable|numeric|min:0',
            'currency'     => 'nullable|string|max:3',
            'country'      => 'nullable|string|max:100',
            'city'         => 'nullable|string|max:100',
            'industry'     => 'nullable|string|max:100',
            'emails'              => 'nullable|array',
            'emails.*.email'      => 'required_with:emails|email|max:200',
            'emails.*.type'       => 'nullable|string',
            'phones'              => 'nullable|array',
            'phones.*.phone'      => 'required_with:phones|string|max:50',
            'phones.*.type'       => 'nullable|string',
            'social_handles'          => 'nullable|array',
            'social_handles.*.platform' => 'nullable|string|max:50',
            'social_handles.*.url'      => 'nullable|string|max:255',
        ], [
            'emails.*.email.required_with' => 'Email address is required.',
            'emails.*.email.email'         => 'Must be a valid email address.',
            'phones.*.phone.required_with' => 'Phone number is required.',
        ]);

        $lead = Lead::create(array_merge(
            $validated,
            ['social_handles' => $validated['social_handles'] ?? null]
        ));

        if (!empty($validated['emails'])) {
            foreach ($validated['emails'] as $i => $em) {
                $lead->emails()->create([
                    'email'      => $em['email'],
                    'type'       => $em['type'] ?? 'work',
                    'is_primary' => $i === 0,
                ]);
            }
        }

        if (!empty($validated['phones'])) {
            foreach ($validated['phones'] as $i => $ph) {
                $lead->phones()->create([
                    'phone'      => $ph['phone'],
                    'type'       => $ph['type'] ?? 'mobile',
                    'is_primary' => $i === 0,
                ]);
            }
        }

        Activity::create([
            'lead_id'     => $lead->id,
            'type'        => 'import',
            'description' => "Lead created via {$lead->source}",
        ]);

        return redirect()->route('leads.show', $lead)->with('success', 'Lead created.');
    }

    public function show(Lead $lead)
    {
        $lead->load(['emails', 'phones', 'tags']);
        $activities = $lead->activities()->limit(30)->get();

        $leadStats = [
            'emails_sent'       => $lead->emailSends()->where('status', 'sent')->count(),
            'activities_total'  => $activities->count(),
            'days_known'        => (int) $lead->created_at->diffInDays(now()),
        ];

        return Inertia::render('Leads/Show', [
            'lead'       => $lead,
            'activities' => $activities,
            'leadStats'  => $leadStats,
        ]);
    }

    public function edit(Lead $lead)
    {
        $lead->load(['emails', 'phones', 'tags']);

        return Inertia::render('Leads/Edit', [
            'lead' => $lead,
        ]);
    }

    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'first_name'   => 'required|string|max:100',
            'last_name'    => 'nullable|string|max:100',
            'company'      => 'nullable|string|max:150',
            'job_title'    => 'nullable|string|max:150',
            'website'      => 'nullable|string|max:255',
            'linkedin_url' => 'nullable|string|max:255',
            'notes'        => 'nullable|string',
            'status'       => 'nullable|string|max:50',
            'priority'     => 'nullable|string|max:20',
            'deal_value'   => 'nullable|numeric|min:0',
            'currency'     => 'nullable|string|max:3',
            'country'      => 'nullable|string|max:100',
            'city'         => 'nullable|string|max:100',
            'industry'     => 'nullable|string|max:100',
            'social_handles'          => 'nullable|array',
            'social_handles.*.platform' => 'nullable|string|max:50',
            'social_handles.*.url'      => 'nullable|string|max:255',
        ]);

        $oldStatus = $lead->status;
        $lead->update(array_merge($validated, [
            'currency' => $validated['currency'] ?? 'USD',
            'status'   => $validated['status']   ?? $lead->status,
            'priority' => $validated['priority'] ?? $lead->priority,
        ]));

        if ($oldStatus !== $lead->status) {
            Activity::create([
                'lead_id'     => $lead->id,
                'type'        => 'status_change',
                'description' => "Status changed from {$oldStatus} to {$lead->status}",
                'meta'        => ['old_status' => $oldStatus, 'new_status' => $lead->status],
            ]);
        }

        return redirect()->route('leads.show', $lead)->with('success', 'Lead updated.');
    }

    public function updateStatus(Request $request, Lead $lead)
    {
        $request->validate(['status' => 'required|string']);
        $old = $lead->status;
        $lead->update(['status' => $request->status]);

        Activity::create([
            'lead_id'     => $lead->id,
            'type'        => 'status_change',
            'description' => "Status changed from {$old} to {$lead->status}",
            'meta'        => ['old_status' => $old, 'new_status' => $lead->status],
        ]);

        return back();
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

        return redirect()->route('leads.index')->with('success', 'Lead deleted.');
    }
}
