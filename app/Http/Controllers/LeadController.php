<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Client;
use App\Models\Lead;
use App\Models\LeadGroup;
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

        // Location / categorical filters.
        foreach (['country', 'city', 'industry', 'priority'] as $field) {
            if (($value = $request->input($field)) !== null && $value !== '') {
                $query->where($field, $value);
            }
        }

        // Contact status: have they been reached out to yet?
        $contacted = $request->input('contacted');
        if ($contacted === 'yes') {
            $query->whereNotNull('last_contacted_at');
        } elseif ($contacted === 'no') {
            $query->whereNull('last_contacted_at');
        }

        // "Reached on" channels — leads contacted on ANY of the selected channels.
        $reached = array_values(array_filter(
            (array) $request->input('reached', []),
            fn ($ch) => in_array($ch, self::CONTACT_CHANNELS, true)
        ));
        if (!empty($reached)) {
            $query->where(function ($q) use ($reached) {
                foreach ($reached as $channel) {
                    $q->orWhereNotNull("contact_channels->{$channel}");
                }
            });
        }

        $sort  = $request->input('sort', 'created_at');
        $dir   = $request->input('dir', 'desc');
        $query->orderBy($sort, $dir);

        $leads = $query->paginate(20)->withQueryString();

        return Inertia::render('Leads/Index', [
            'leads'   => $leads,
            'filters' => $request->only([
                'search', 'status', 'source', 'sort', 'dir',
                'country', 'city', 'industry', 'priority', 'contacted', 'reached',
            ]),
            'filterOptions' => [
                'countries'  => $this->distinctValues('country'),
                'cities'     => $this->distinctValues('city'),
                'industries' => $this->distinctValues('industry'),
                'sources'    => $this->distinctValues('source'),
            ],
        ]);
    }

    /**
     * Distinct non-empty values of a column for the current tenant, for filter dropdowns.
     */
    private function distinctValues(string $column)
    {
        return Lead::query()
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->distinct()
            ->orderBy($column)
            ->pluck($column)
            ->values();
    }

    public function search(Request $request)
    {
        $q = trim($request->input('q', ''));

        $leads = Lead::with('emails')
            ->when($q !== '', fn ($query) => $query->search($q))
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn ($lead) => [
                'id'            => $lead->id,
                'full_name'     => $lead->full_name,
                'company'       => $lead->company,
                'primary_email' => $lead->primary_email,
            ]);

        return response()->json($leads);
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
        $lead->load(['emails', 'phones', 'tags', 'client']);
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
            'emails'              => 'nullable|array',
            'emails.*.email'      => 'required_with:emails|email|max:200',
            'emails.*.type'       => 'nullable|string|max:20',
            'emails.*.is_primary' => 'nullable|boolean',
            'phones'              => 'nullable|array',
            'phones.*.phone'      => 'required_with:phones|string|max:50',
            'phones.*.type'       => 'nullable|string|max:20',
            'phones.*.is_primary' => 'nullable|boolean',
        ], [
            'emails.*.email.required_with' => 'Email address is required.',
            'emails.*.email.email'         => 'Must be a valid email address.',
            'phones.*.phone.required_with' => 'Phone number is required.',
        ]);

        $oldStatus = $lead->status;
        $lead->update(array_merge($validated, [
            'currency' => $validated['currency'] ?? 'USD',
            'status'   => $validated['status']   ?? $lead->status,
            'priority' => $validated['priority'] ?? $lead->priority,
        ]));

        // Sync emails — replace all existing with the submitted list
        if (array_key_exists('emails', $validated)) {
            $lead->emails()->delete();
            foreach ($validated['emails'] ?? [] as $i => $em) {
                $lead->emails()->create([
                    'email'      => $em['email'],
                    'type'       => $em['type'] ?? 'work',
                    'is_primary' => !empty($em['is_primary']) || $i === 0,
                ]);
            }
        }

        // Sync phones — replace all existing with the submitted list
        if (array_key_exists('phones', $validated)) {
            $lead->phones()->delete();
            foreach ($validated['phones'] ?? [] as $i => $ph) {
                $lead->phones()->create([
                    'phone'      => $ph['phone'],
                    'type'       => $ph['type'] ?? 'mobile',
                    'is_primary' => !empty($ph['is_primary']) || $i === 0,
                ]);
            }
        }

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

    /**
     * Channels a lead can be marked as contacted on. Keep in sync with the
     * CONTACT_CHANNELS list in resources/js/Components/Common/OutreachChannels.jsx.
     */
    public const CONTACT_CHANNELS = ['mail', 'linkedin', 'instagram', 'facebook', 'whatsapp', 'reddit', 'social'];

    public function updateChannels(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'channel' => 'required|string|in:' . implode(',', self::CONTACT_CHANNELS),
            'value'   => 'required|boolean',
        ]);

        $channels = $lead->contact_channels ?? [];

        if ($validated['value']) {
            $channels[$validated['channel']] = now()->toIso8601String();
        } else {
            unset($channels[$validated['channel']]);
        }

        $attributes = ['contact_channels' => $channels];

        // Mark the lead as contacted when any channel is checked.
        if ($validated['value']) {
            $attributes['last_contacted_at'] = now();
        }

        $lead->update($attributes);

        Activity::create([
            'lead_id'     => $lead->id,
            'type'        => 'note',
            'description' => ($validated['value'] ? 'Marked contacted on ' : 'Unmarked contacted on ')
                . ucfirst($validated['channel'] === 'mail' ? 'email' : $validated['channel']),
        ]);

        return response()->json(['ok' => true, 'contact_channels' => $channels]);
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

        return redirect()->route('leads.index')->with('success', 'Lead deleted.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:leads,id',
        ]);

        Lead::whereIn('id', $request->ids)->delete();

        return redirect()->route('leads.index')->with('success', count($request->ids) . ' leads deleted.');
    }

    public function convert(Request $request, Lead $lead)
    {
        $request->validate([
            'client_status' => 'nullable|string|in:onboarding,active,inactive,churned',
        ]);

        // Prevent double-conversion
        if ($lead->status === 'client' && $lead->client()->exists()) {
            return response()->json(['ok' => false, 'error' => 'Lead is already a client.'], 422);
        }

        $lead->load(['emails', 'phones']);
        $primaryEmail = $lead->emails->firstWhere('is_primary', true)?->email ?? $lead->emails->first()?->email;
        $primaryPhone = $lead->phones->firstWhere('is_primary', true)?->phone ?? $lead->phones->first()?->phone;

        $client = Client::create([
            'organization_id' => $lead->organization_id,
            'lead_id'         => $lead->id,
            'name'            => $lead->full_name,
            'email'           => $primaryEmail,
            'phone'           => $primaryPhone,
            'company'         => $lead->company,
            'job_title'       => $lead->job_title,
            'status'          => $request->input('client_status', 'onboarding'),
            'deal_value'      => $lead->deal_value,
            'currency'        => $lead->currency,
            'notes'           => $lead->notes,
            'converted_at'    => now(),
        ]);

        $lead->update(['status' => 'client']);

        Activity::create([
            'lead_id'     => $lead->id,
            'type'        => 'status_change',
            'description' => "Lead converted to client",
            'meta'        => ['client_id' => $client->id],
        ]);

        return response()->json(['ok' => true, 'client_id' => $client->id]);
    }

    public function bulkAddToGroup(Request $request)
    {
        $request->validate([
            'lead_ids'   => 'required|array|min:1',
            'lead_ids.*' => 'integer|exists:leads,id',
            'group_id'   => 'nullable|integer|exists:lead_groups,id',
            'group_name' => 'nullable|string|max:100',
        ]);

        if (!$request->group_id && !$request->group_name) {
            return response()->json(['ok' => false, 'error' => 'Provide a group or a new group name.'], 422);
        }

        if ($request->group_id) {
            $group = LeadGroup::findOrFail($request->group_id);
        } else {
            $group = LeadGroup::create([
                'name'  => trim($request->group_name),
                'color' => '#6366f1',
            ]);
        }

        $group->leads()->syncWithoutDetaching($request->lead_ids);
        $count = count($request->lead_ids);

        return response()->json([
            'ok'    => true,
            'group' => ['id' => $group->id, 'name' => $group->name, 'color' => $group->color],
            'count' => $count,
        ]);
    }
}
