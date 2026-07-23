<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Client;
use App\Models\Lead;
use App\Models\LeadForm;
use App\Models\LeadGroup;
use App\Models\Tag;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Support\LeadsCache;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $orgId   = auth()->user()->organization_id;
        $perPage = in_array((int) $request->input('per_page'), [25, 50, 100, 200])
            ? (int) $request->input('per_page')
            : 25;

        $version = Cache::get("leads_v:{$orgId}", 1);

        // Filter dropdown options change far less often than list pages do, so they
        // get their own cache entry instead of being rebuilt on every new
        // filter/page combination (each combo is its own cache key below).
        $filterOptions = Cache::remember("leads:filters:{$orgId}:v{$version}", 1800, fn () => [
            'countries'  => $this->distinctValues('country')->toArray(),
            'cities'     => $this->distinctValues('city')->toArray(),
            'industries' => $this->distinctValues('industry')->toArray(),
            'sources'    => $this->sourceFilterOptions()->toArray(),
            'groups'     => LeadGroup::orderBy('name')->get(['id', 'name', 'color'])->values()->toArray(),
            'users'      => User::where('organization_id', $orgId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->toArray(),
        ]);

        $cacheKey = "leads:idx2:{$orgId}:v{$version}:" . md5(serialize($request->all()));

        $leadsPayload = Cache::remember($cacheKey, 1800, function () use ($request, $perPage) {
            $query = Lead::with(['emails', 'phones', 'groups', 'leadForm:id,name']);

            if ($search = $request->input('search')) {
                $query->search($search);
            }

            if ($status = $request->input('status')) {
                $query->byStatus($status);
            } else {
                // Converted leads live on the Clients page, not the Leads list.
                $query->where('status', '!=', 'client');
            }

            if ($source = $request->input('source')) {
                $query->where('source', $source);
            }

            // Assigned agent filter — used by both the Leads page's own filter UI and
            // Reports' agent drill-down links (?assigned_to=<id>).
            if ($assignedTo = $request->input('assigned_to')) {
                $query->where('assigned_to', $assignedTo);
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

            // Group filter.
            if ($groupId = $request->input('group')) {
                $query->whereHas('groups', fn ($q) => $q->where('lead_groups.id', (int) $groupId));
            }

            $sortable = ['created_at', 'first_name', 'company', 'status', 'priority', 'deal_value', 'last_contacted_at'];
            $sort     = in_array($request->input('sort'), $sortable, true) ? $request->input('sort') : 'created_at';
            $dir      = strtolower($request->input('dir', 'desc')) === 'asc' ? 'asc' : 'desc';
            $query->orderBy($sort, $dir);

            $leads = $query->paginate($perPage)->withQueryString();

            // Only the fields the index table actually renders — full models (notes,
            // custom_fields, tags, every email/phone row…) made both the cached
            // payload and the JSON shipped to the browser several times larger.
            $leads->through(fn (Lead $lead) => [
                'id'               => $lead->id,
                'full_name'        => $lead->full_name,
                'primary_email'    => $lead->primary_email,
                'company'          => $lead->company,
                'source'           => $lead->source,
                'status'           => $lead->status,
                'priority'         => $lead->priority,
                'deal_value'       => $lead->deal_value,
                'primary_phone'    => $lead->primary_phone,
                'linkedin_url'     => $lead->linkedin_url,
                'social_handles'   => $lead->social_handles,
                'contact_channels' => $lead->contact_channels,
                'lead_form'        => $lead->leadForm?->only(['id', 'name']),
                'groups'           => $lead->groups->map(fn ($g) => [
                    'id' => $g->id, 'name' => $g->name, 'color' => $g->color,
                ])->all(),
            ]);

            // Cache stores (e.g. database) reject unserializing objects, so only
            // plain arrays go into the cached payload — never Eloquent models/collections.
            return $leads->toArray();
        });

        return Inertia::render('Leads/Index', [
            'leads'         => $leadsPayload,
            'filters'       => $request->only([
                'search', 'status', 'source', 'sort', 'dir',
                'country', 'city', 'industry', 'priority', 'contacted', 'reached', 'group', 'per_page',
                'assigned_to',
            ]),
            'filterOptions' => $filterOptions,
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

    /**
     * Distinct source values for the current tenant, with a human-readable label —
     * "form:{slug}" resolves to the form's actual name (falling back to the slug
     * if that form's since been deleted), everything else gets a light humanization.
     */
    private function sourceFilterOptions()
    {
        $rawSources = $this->distinctValues('source');

        $formSlugs = $rawSources
            ->filter(fn ($s) => str_starts_with($s, 'form:'))
            ->map(fn ($s) => substr($s, 5));

        $formNames = LeadForm::whereIn('slug', $formSlugs)->pluck('name', 'slug');

        return $rawSources->map(function ($source) use ($formNames) {
            if (str_starts_with($source, 'form:')) {
                $slug = substr($source, 5);

                return ['value' => $source, 'label' => 'Form: ' . ($formNames[$slug] ?? $slug)];
            }

            return ['value' => $source, 'label' => match ($source) {
                'csv'          => 'CSV import',
                'google_sheet' => 'Google Sheet',
                'manual'       => 'Manual',
                default        => $source,
            }];
        })->values();
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
        return Inertia::render('Leads/Create', [
            'tags' => Tag::orderBy('name')->get(['id', 'name', 'color']),
        ]);
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
            'assigned_to'  => 'nullable|exists:users,id',
            'tag_ids'      => 'nullable|array',
            'tag_ids.*'    => 'integer|exists:tags,id',
        ], [
            'emails.*.email.required_with' => 'Email address is required.',
            'emails.*.email.email'         => 'Must be a valid email address.',
            'phones.*.phone.required_with' => 'Phone number is required.',
        ]);

        $lead = Lead::create(array_merge(
            Arr::except($validated, ['tag_ids']),
            [
                'social_handles' => $validated['social_handles'] ?? null,
                'assigned_to'    => $validated['assigned_to'] ?? auth()->id(),
                'created_by'     => auth()->id(),
            ]
        ));

        if (!empty($validated['tag_ids'])) {
            $lead->tags()->sync($validated['tag_ids']);
        }

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
            'user_id'     => auth()->id(),
            'type'        => 'import',
            'description' => "Lead created via {$lead->source}",
        ]);

        ActivityLogger::log('lead.created', $lead, description: "Created lead {$lead->full_name}");

        return redirect()->route('leads.show', $lead)->with('success', 'Lead created.');
    }

    public function show(Lead $lead)
    {
        $lead->load(['emails', 'phones', 'tags', 'client', 'assignee:id,name', 'creator:id,name', 'leadForm:id,name,slug']);
        $activities = $lead->activities()->with('user:id,name')->limit(30)->get();

        $emailSends = $lead->emailSends()
            ->whereNotIn('status', ['skipped'])
            ->with('campaign:id,name,subject,body_text,body_html,from_name,from_email,followup_subject,followup_steps')
            ->orderBy('sent_at')
            ->get(['id', 'email_campaign_id', 'lead_id', 'email_used', 'status', 'sent_at', 'opened_at', 'clicked_at', 'is_followup', 'parent_send_id', 'followup_step']);

        $leadStats = [
            'emails_sent'      => $emailSends->whereIn('status', ['sent', 'opened', 'clicked'])->count(),
            'activities_total' => $activities->count(),
            'days_known'       => (int) $lead->created_at->diffInDays(now()),
        ];

        // Matches sessions already linked to this lead (via submission), plus any
        // abandoned/lead-less sessions whose captured email matches one of this
        // lead's own emails — so a form they started but never finished still surfaces here.
        $formSessions = \App\Models\FormSession::where(fn ($q) => $q
                ->where('lead_id', $lead->id)
                ->orWhere(fn ($q2) => $q2
                    ->whereIn('identifying_email', $lead->emails->pluck('email'))
                    ->whereNull('lead_id')))
            ->with('leadForm:id,name,fields')
            ->orderByDesc('last_active_at')
            ->get();

        return Inertia::render('Leads/Show', [
            'lead'            => $lead,
            'activities'      => $activities,
            'leadStats'       => $leadStats,
            'emailSends'      => $emailSends,
            'formSessions'    => $formSessions,
            'assignableUsers' => \App\Models\User::where('organization_id', $lead->organization_id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function edit(Lead $lead)
    {
        $lead->load(['emails', 'phones', 'tags']);

        return Inertia::render('Leads/Edit', [
            'lead' => $lead,
            'tags' => Tag::orderBy('name')->get(['id', 'name', 'color']),
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
            'assigned_to'         => 'nullable|exists:users,id',
            'tag_ids'             => 'nullable|array',
            'tag_ids.*'           => 'integer|exists:tags,id',
        ], [
            'emails.*.email.required_with' => 'Email address is required.',
            'emails.*.email.email'         => 'Must be a valid email address.',
            'phones.*.phone.required_with' => 'Phone number is required.',
        ]);

        $oldStatus = $lead->status;
        $lead->update(array_merge(Arr::except($validated, ['tag_ids']), [
            'currency' => $validated['currency'] ?? 'USD',
            'status'   => $validated['status']   ?? $lead->status,
            'priority' => $validated['priority'] ?? $lead->priority,
        ]));

        if (array_key_exists('tag_ids', $validated)) {
            $lead->tags()->sync($validated['tag_ids'] ?? []);
        }

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
                'user_id'     => auth()->id(),
                'type'        => 'status_change',
                'description' => "Status changed from {$oldStatus} to {$lead->status}",
                'meta'        => ['old_status' => $oldStatus, 'new_status' => $lead->status],
            ]);
        }

        ActivityLogger::log('lead.updated', $lead, description: "Updated lead {$lead->full_name}");

        return redirect()->route('leads.show', $lead)->with('success', 'Lead updated.');
    }

    public function updateStatus(Request $request, Lead $lead)
    {
        $request->validate(['status' => 'required|string']);
        $old = $lead->status;
        $lead->update(['status' => $request->status]);

        Activity::create([
            'lead_id'     => $lead->id,
            'user_id'     => auth()->id(),
            'type'        => 'status_change',
            'description' => "Status changed from {$old} to {$lead->status}",
            'meta'        => ['old_status' => $old, 'new_status' => $lead->status],
        ]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'status' => $lead->status]);
        }

        return back();
    }

    /**
     * Reassign a lead to another team member. A blank assigned_to unassigns.
     */
    public function assign(Request $request, Lead $lead)
    {
        $validated = $request->validate(['assigned_to' => 'nullable|exists:users,id']);

        $oldAssignedTo = $lead->assigned_to;
        $newAssignedTo = $validated['assigned_to'] ?? null;

        $lead->update(['assigned_to' => $newAssignedTo]);

        Activity::create([
            'lead_id'     => $lead->id,
            'user_id'     => auth()->id(),
            'type'        => 'reassignment',
            'description' => $this->describeReassignment($oldAssignedTo, $newAssignedTo),
            'meta'        => ['old_assigned_to' => $oldAssignedTo, 'new_assigned_to' => $newAssignedTo],
        ]);

        return back()->with('success', 'Lead reassigned.');
    }

    private function describeReassignment(?int $oldId, ?int $newId): string
    {
        $oldName = $oldId ? (User::find($oldId)?->name ?? 'a former team member') : null;
        $newName = $newId ? (User::find($newId)?->name ?? 'a team member') : null;

        return match (true) {
            $newName && $oldName => "Reassigned from {$oldName} to {$newName}",
            (bool) $newName      => "Assigned to {$newName}",
            default              => 'Unassigned',
        };
    }

    /**
     * Channels a lead can be marked as contacted on. Keep in sync with the
     * CONTACT_CHANNELS list in resources/js/Components/Common/OutreachChannels.jsx.
     */
    public const CONTACT_CHANNELS = ['mail', 'call', 'linkedin', 'instagram', 'facebook', 'whatsapp', 'reddit', 'social'];

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
            'user_id'     => auth()->id(),
            'type'        => $validated['channel'] === 'call' ? 'call' : 'note',
            'description' => ($validated['value'] ? 'Marked contacted on ' : 'Unmarked contacted on ')
                . ucfirst($validated['channel'] === 'mail' ? 'email' : $validated['channel']),
            'meta'        => ['channel' => $validated['channel'], 'contacted' => $validated['value']],
        ]);

        return response()->json(['ok' => true, 'contact_channels' => $channels]);
    }

    public function destroy(Lead $lead)
    {
        Activity::create([
            'lead_id'     => $lead->id,
            'user_id'     => auth()->id(),
            'type'        => 'deletion',
            'description' => 'Lead deleted: ' . $lead->full_name,
            'meta'        => ['lead_name' => $lead->full_name, 'company' => $lead->company],
        ]);

        ActivityLogger::log('lead.deleted', description: "Deleted lead {$lead->full_name}", properties: ['lead_id' => $lead->id, 'lead_name' => $lead->full_name]);

        $lead->delete();

        return redirect()->route('leads.index')->with('success', 'Lead deleted.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:leads,id',
        ]);

        $leads = Lead::whereIn('id', $request->ids)->get(['id', 'first_name', 'last_name', 'company']);

        foreach ($leads as $lead) {
            Activity::create([
                'lead_id'     => $lead->id,
                'user_id'     => auth()->id(),
                'type'        => 'deletion',
                'description' => 'Lead deleted (bulk): ' . $lead->full_name,
                'meta'        => ['lead_name' => $lead->full_name, 'company' => $lead->company, 'bulk' => true],
            ]);
        }

        Lead::whereIn('id', $request->ids)->delete();

        ActivityLogger::log('lead.deleted', description: count($request->ids) . ' leads deleted (bulk)', properties: ['lead_ids' => $request->ids]);

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
            'user_id'     => auth()->id(),
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
        LeadsCache::bust($group->organization_id);
        $count = count($request->lead_ids);

        return response()->json([
            'ok'    => true,
            'group' => ['id' => $group->id, 'name' => $group->name, 'color' => $group->color],
            'count' => $count,
        ]);
    }
}
