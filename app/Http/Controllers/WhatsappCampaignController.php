<?php

namespace App\Http\Controllers;

use App\Jobs\SendWhatsappBatch;
use App\Models\Lead;
use App\Models\LeadGroup;
use App\Models\Tag;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappCredential;
use App\Models\WhatsappSend;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappCampaignController extends Controller
{
    public function index()
    {
        $campaigns = WhatsappCampaign::latest()->get()->map(fn ($c) => [
            'id'                => $c->id,
            'name'              => $c->name,
            'status'            => $c->status,
            'recipient_mode'    => $c->recipient_mode,
            'total_recipients'  => $c->total_recipients,
            'sent_count'        => $c->sent_count,
            'delivered_count'   => $c->delivered_count,
            'read_count'        => $c->read_count,
            'failed_count'      => $c->failed_count,
            'followup_enabled'  => (bool) $c->followup_enabled,
            'sent_at'           => $c->sent_at?->diffForHumans(),
            'created_at'        => $c->created_at->diffForHumans(),
        ]);

        return Inertia::render('WhatsApp/Campaigns/Index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create(Request $request)
    {
        $statuses  = Lead::distinct()->pluck('status')->filter()->values();
        $leadCount = Lead::count();
        $groups    = LeadGroup::withCount('leads')->orderBy('name')->get()->map(fn ($g) => [
            'id'          => $g->id,
            'name'        => $g->name,
            'color'       => $g->color,
            'leads_count' => $g->leads_count,
        ]);
        $tags = Tag::withCount('leads')->orderBy('name')->get()->map(fn ($t) => [
            'id'    => $t->id,
            'name'  => $t->name,
            'color' => $t->color,
        ]);

        $credential = WhatsappCredential::where('organization_id', $request->user()->organization_id)
            ->where('is_active', true)
            ->first();

        return Inertia::render('WhatsApp/Campaigns/Create', [
            'statuses'      => $statuses,
            'leadCount'     => $leadCount,
            'groups'        => $groups,
            'tags'          => $tags,
            'hasCredential' => (bool) $credential,
            'fromNumber'    => $credential?->from_number,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                 => 'required|string|max:200',
            'message_body'         => 'required|string|max:4096',
            'recipient_mode'       => 'required|in:all,filter,group',
            'group_id'             => 'nullable|integer|exists:lead_groups,id',
            'filters'              => 'nullable|array',
            'followup_enabled'     => 'boolean',
            'followup_body'        => 'required_if:followup_enabled,true|nullable|string|max:4096',
            'followup_delay_hours' => 'nullable|integer|in:24,48,72,168',
        ]);

        $count = $this->countRecipients(
            $validated['filters'] ?? [],
            $validated['group_id'] ?? null,
            $validated['recipient_mode']
        );

        $campaign = WhatsappCampaign::create([
            ...$validated,
            'total_recipients'   => $count,
            'status'             => 'draft',
            'followup_enabled'   => $validated['followup_enabled'] ?? false,
            'followup_delay_hours' => $validated['followup_delay_hours'] ?? 48,
        ]);

        return redirect()->route('whatsapp.campaigns.show', $campaign)
            ->with('success', 'Campaign created.');
    }

    public function show(WhatsappCampaign $campaign)
    {
        $sends = WhatsappSend::where('whatsapp_campaign_id', $campaign->id)
            ->with('lead:id,first_name,last_name')
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn ($s) => [
                'id'          => $s->id,
                'lead_name'   => $s->lead?->full_name,
                'to_number'   => $s->to_number,
                'status'      => $s->status,
                'is_followup' => $s->is_followup,
                'sent_at'     => $s->sent_at?->toIso8601String(),
                'delivered_at' => $s->delivered_at?->toIso8601String(),
                'read_at'     => $s->read_at?->toIso8601String(),
                'error_message' => $s->error_message,
            ]);

        return Inertia::render('WhatsApp/Campaigns/Show', [
            'campaign' => [
                'id'               => $campaign->id,
                'name'             => $campaign->name,
                'message_body'     => $campaign->message_body,
                'status'           => $campaign->status,
                'recipient_mode'   => $campaign->recipient_mode,
                'total_recipients' => $campaign->total_recipients,
                'sent_count'       => $campaign->sent_count,
                'delivered_count'  => $campaign->delivered_count,
                'read_count'       => $campaign->read_count,
                'failed_count'     => $campaign->failed_count,
                'followup_enabled' => (bool) $campaign->followup_enabled,
                'followup_body'    => $campaign->followup_body,
                'followup_delay_hours' => $campaign->followup_delay_hours,
                'sent_at'          => $campaign->sent_at?->diffForHumans(),
                'created_at'       => $campaign->created_at->diffForHumans(),
            ],
            'sends'    => $sends,
        ]);
    }

    public function edit(WhatsappCampaign $campaign)
    {
        abort_unless($campaign->status === 'draft', 403, 'Only draft campaigns can be edited.');

        return Inertia::render('WhatsApp/Campaigns/Create', [
            'campaign'      => $campaign,
            'statuses'      => Lead::distinct()->pluck('status')->filter()->values(),
            'leadCount'     => Lead::count(),
            'groups'        => LeadGroup::withCount('leads')->orderBy('name')->get(),
            'tags'          => Tag::withCount('leads')->orderBy('name')->get(),
            'hasCredential' => true,
        ]);
    }

    public function update(Request $request, WhatsappCampaign $campaign)
    {
        abort_unless($campaign->status === 'draft', 403, 'Only draft campaigns can be edited.');

        $validated = $request->validate([
            'name'                 => 'required|string|max:200',
            'message_body'         => 'required|string|max:4096',
            'recipient_mode'       => 'required|in:all,filter,group',
            'group_id'             => 'nullable|integer|exists:lead_groups,id',
            'filters'              => 'nullable|array',
            'followup_enabled'     => 'boolean',
            'followup_body'        => 'required_if:followup_enabled,true|nullable|string|max:4096',
            'followup_delay_hours' => 'nullable|integer|in:24,48,72,168',
        ]);

        $count = $this->countRecipients(
            $validated['filters'] ?? [],
            $validated['group_id'] ?? null,
            $validated['recipient_mode']
        );

        $campaign->update([...$validated, 'total_recipients' => $count]);

        return redirect()->route('whatsapp.campaigns.show', $campaign)
            ->with('success', 'Campaign updated.');
    }

    public function send(Request $request, WhatsappCampaign $campaign)
    {
        if ($campaign->status === 'sending') {
            return back()->withErrors(['send' => 'Campaign is already running.']);
        }

        $credential = WhatsappCredential::where('organization_id', $request->user()->organization_id)
            ->where('is_active', true)
            ->first();

        if (!$credential) {
            return back()->withErrors(['send' => 'No active WhatsApp account. Configure one in Settings → WhatsApp.']);
        }

        $leadIds = $this->resolveRecipients($campaign);

        if (empty($leadIds)) {
            return back()->withErrors(['send' => 'No leads with WhatsApp numbers found for this campaign.']);
        }

        $campaign->update([
            'status'           => 'sending',
            'total_recipients' => count($leadIds),
            'sent_count'       => 0,
            'failed_count'     => 0,
        ]);

        $batchSize = 50;
        $chunks    = array_chunk($leadIds, $batchSize);
        $delay     = 0;

        foreach ($chunks as $i => $chunk) {
            $isFinal = ($i === count($chunks) - 1);
            SendWhatsappBatch::dispatch($campaign->id, $chunk, $isFinal)
                ->delay(now()->addSeconds($delay));
            $delay += 60; // 1-min gap between batches
        }

        return back()->with('success', 'Campaign is sending.');
    }

    public function stop(WhatsappCampaign $campaign)
    {
        if ($campaign->status === 'sending') {
            $campaign->update(['status' => 'paused']);
            return back()->with('success', 'Campaign paused.');
        }

        if ($campaign->status === 'sent') {
            $campaign->update(['followup_enabled' => false]);
            return back()->with('success', 'Follow-ups stopped.');
        }

        return back();
    }

    public function resume(WhatsappCampaign $campaign)
    {
        if ($campaign->status === 'paused') {
            $campaign->update(['status' => 'draft']);
            return redirect()->route('whatsapp.campaigns.send', $campaign);
        }

        if ($campaign->status === 'sent' && $campaign->followup_body) {
            $campaign->update(['followup_enabled' => true]);
            return back()->with('success', 'Follow-ups re-enabled.');
        }

        return back();
    }

    public function clone(WhatsappCampaign $campaign)
    {
        $clone = $campaign->replicate();
        $clone->name             = $campaign->name . ' (Copy)';
        $clone->status           = 'draft';
        $clone->sent_count       = 0;
        $clone->delivered_count  = 0;
        $clone->read_count       = 0;
        $clone->failed_count     = 0;
        $clone->sent_at          = null;
        $clone->save();

        return redirect()->route('whatsapp.campaigns.show', $clone)
            ->with('success', 'Campaign cloned as draft.');
    }

    public function destroy(WhatsappCampaign $campaign)
    {
        $campaign->delete();
        return redirect()->route('whatsapp.campaigns.index')
            ->with('success', 'Campaign deleted.');
    }

    public function log(WhatsappCampaign $campaign)
    {
        $sends   = WhatsappSend::where('whatsapp_campaign_id', $campaign->id)->get();
        $campaign->refresh();

        return response()->json([
            'status'           => $campaign->status,
            'total_recipients' => $campaign->total_recipients,
            'sent_count'       => $sends->whereNotIn('status', ['pending', 'failed', 'undelivered'])->count(),
            'delivered_count'  => $sends->whereIn('status', ['delivered', 'read'])->count(),
            'read_count'       => $sends->where('status', 'read')->count(),
            'failed_count'     => $sends->whereIn('status', ['failed', 'undelivered'])->count(),
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function resolveRecipients(WhatsappCampaign $campaign): array
    {
        $query = Lead::whereNotNull('whatsapp_number')->where('whatsapp_number', '!=', '');

        if ($campaign->recipient_mode === 'group' && $campaign->group_id) {
            $group = LeadGroup::find($campaign->group_id);
            $query->whereIn('id', $group?->leads()->pluck('leads.id') ?? []);
        } elseif ($campaign->recipient_mode === 'filter' && !empty($campaign->filters)) {
            $filters = $campaign->filters;
            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }
            if (!empty($filters['tags'])) {
                $query->whereHas('tags', fn ($q) => $q->whereIn('tags.id', $filters['tags']));
            }
        }

        return $query->pluck('id')->toArray();
    }

    private function countRecipients(array $filters, ?int $groupId, string $mode): int
    {
        $query = Lead::whereNotNull('whatsapp_number')->where('whatsapp_number', '!=', '');

        if ($mode === 'group' && $groupId) {
            $group = LeadGroup::find($groupId);
            return $group ? $group->leads()->whereNotNull('leads.whatsapp_number')->count() : 0;
        }

        if ($mode === 'filter' && !empty($filters)) {
            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }
            if (!empty($filters['tags'])) {
                $query->whereHas('tags', fn ($q) => $q->whereIn('tags.id', $filters['tags']));
            }
        }

        return $query->count();
    }
}
