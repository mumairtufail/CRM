<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\EmailSend;
use App\Models\Lead;
use App\Models\User;
use App\Models\WhatsappSend;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date',
        ]);

        [$range, $from, $to] = $this->resolveRange($request);

        $users = User::where('organization_id', $request->user()->organization_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $speedMap = collect($this->speedToFirstContact($from, $to))->keyBy('user_id');

        $agentRows = $users->map(function (User $user) use ($from, $to, $speedMap) {
            $row = $this->agentRow($user, $from, $to);
            $row['avg_hours_to_contact'] = $speedMap->get($user->id)['avg_hours'] ?? null;
            $row['contact_sample_size']  = $speedMap->get($user->id)['sample_size'] ?? 0;

            return $row;
        })->values();

        $channelBreakdown = $this->channelBreakdown($from, $to);

        $activities = Activity::with(['lead:id,first_name,last_name,company', 'user:id,name'])
            ->whereBetween('created_at', [$from, $to])
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->input('user_id')))
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->input('type')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Reports/Index', [
            'range'            => ['key' => $range, 'from' => $from->toDateString(), 'to' => $to->toDateString()],
            'agentRows'        => $agentRows,
            'channelBreakdown' => $channelBreakdown,
            'funnel'           => $this->funnel($from, $to),
            'geo'              => $this->geoBreakdown($from, $to),
            'engagement'       => $this->engagementRates($from, $to),
            'leadsTrend'       => $this->leadsTrend($from, $to),
            'activities'       => $activities,
            'filters'          => $request->only(['user_id', 'type', 'range', 'from', 'to']),
            'filterOptions'    => [
                'users' => $users->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]),
                'types' => ['import', 'status_change', 'call', 'note', 'reassignment', 'deletion', 'whatsapp'],
            ],
        ]);
    }

    /**
     * @return array{0: string, 1: Carbon, 2: Carbon}
     */
    private function resolveRange(Request $request): array
    {
        $range = $request->input('range', '30d');

        try {
            [$from, $to] = match ($range) {
                'today'      => [now()->startOfDay(), now()->endOfDay()],
                '7d'         => [now()->subDays(7), now()],
                '30d'        => [now()->subDays(30), now()],
                '90d'        => [now()->subDays(90), now()],
                'this_month' => [now()->startOfMonth(), now()->endOfDay()],
                'last_month' => [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()],
                'custom'     => [
                    $request->filled('from') ? Carbon::parse($request->input('from'))->startOfDay() : now()->subDays(30),
                    $request->filled('to') ? Carbon::parse($request->input('to'))->endOfDay() : now(),
                ],
                default      => [now()->subDays(30), now()],
            };
        } catch (\Throwable) {
            $range = '30d';
            [$from, $to] = [now()->subDays(30), now()];
        }

        return [$range, $from, $to];
    }

    private function agentRow(User $user, Carbon $from, Carbon $to): array
    {
        $leadsCreated = Lead::where('created_by', $user->id)
            ->whereBetween('created_at', [$from, $to])->count();

        // Current snapshot, not date-ranged — matches DashboardController::agentView()'s
        // existing "leads_assigned" convention (how many leads this agent has right now).
        $leadsAssigned = Lead::where('assigned_to', $user->id)->count();

        $leadsContacted = Lead::where('assigned_to', $user->id)
            ->whereNotNull('last_contacted_at')
            ->whereBetween('last_contacted_at', [$from, $to])->count();

        $wonCount = Lead::where('assigned_to', $user->id)->where('status', 'won')
            ->whereBetween('updated_at', [$from, $to])->count();
        $closedCount = Lead::where('assigned_to', $user->id)->whereIn('status', ['won', 'lost'])
            ->whereBetween('updated_at', [$from, $to])->count();

        $emailsSent = EmailSend::whereHas('lead', fn ($q) => $q->where('assigned_to', $user->id))
            ->where('status', 'sent')->whereBetween('sent_at', [$from, $to])->count();

        $whatsappSent = WhatsappSend::whereHas('lead', fn ($q) => $q->where('assigned_to', $user->id))
            ->where('status', 'sent')->whereBetween('sent_at', [$from, $to])->count();

        $channelCounts = Activity::where('user_id', $user->id)
            ->whereNotNull('meta->channel')
            ->where(function ($q) {
                $q->whereNull('meta->contacted')->orWhere('meta->contacted', true);
            })
            ->whereBetween('created_at', [$from, $to])
            ->get(['meta'])
            ->countBy(fn ($a) => $a->meta['channel'] ?? 'unknown');

        return [
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'leads_created'   => $leadsCreated,
            'leads_assigned'  => $leadsAssigned,
            'leads_contacted' => $leadsContacted,
            'won_count'       => $wonCount,
            'conversion_rate' => $closedCount > 0 ? round($wonCount / $closedCount * 100) : 0,
            'emails_sent'     => $emailsSent,
            'whatsapp_sent'   => $whatsappSent,
            'channel_counts'  => $channelCounts,
        ];
    }

    private function channelBreakdown(Carbon $from, Carbon $to): array
    {
        $fromContactChannels = Lead::whereBetween('created_at', [$from, $to])
            ->get(['contact_channels'])
            ->flatMap(fn ($lead) => array_keys($lead->contact_channels ?? []))
            ->countBy();

        $emailCount    = EmailSend::where('status', 'sent')->whereBetween('sent_at', [$from, $to])->count();
        $whatsappCount = WhatsappSend::where('status', 'sent')->whereBetween('sent_at', [$from, $to])->count();

        return collect(LeadController::CONTACT_CHANNELS)
            ->mapWithKeys(fn ($ch) => [$ch => $fromContactChannels->get($ch, 0)])
            ->merge(['email_sends' => $emailCount, 'whatsapp_sends' => $whatsappCount])
            ->map(fn ($count, $name) => ['name' => $name, 'value' => $count])
            ->values()
            ->all();
    }

    /**
     * Creation-cohort funnel: leads *created* in range and how far they got.
     * This is intentionally a different lens than agentRow()'s won_count/conversion_rate,
     * which is an update-cohort view (leads that *closed* in range, regardless of when
     * they were created). Both are valid questions — don't merge them.
     */
    private function funnel(Carbon $from, Carbon $to): array
    {
        $total     = Lead::whereBetween('created_at', [$from, $to])->count();
        $contacted = Lead::whereBetween('created_at', [$from, $to])
            ->whereNotNull('last_contacted_at')->count();
        $won  = Lead::whereBetween('created_at', [$from, $to])->where('status', 'won')->count();
        $lost = Lead::whereBetween('created_at', [$from, $to])->where('status', 'lost')->count();
        $closed = $won + $lost;

        return [
            'total'                 => $total,
            'contacted'             => $contacted,
            'won'                   => $won,
            'lost'                  => $lost,
            'contact_rate'          => $total > 0 ? round($contacted / $total * 100) : 0,
            'win_rate_of_contacted' => $contacted > 0 ? round($won / $contacted * 100) : 0,
            'win_rate_of_closed'    => $closed > 0 ? round($won / $closed * 100) : 0,
        ];
    }

    /**
     * Per-agent average hours from Lead.created_at to the lead's first contact-type
     * Activity. Uses the activity log rather than last_contacted_at because that column
     * is overwritten on every subsequent contact and only reflects the most recent one.
     *
     * The initial activity scan isn't bounded by $from because a lead's true first
     * contact may predate the window — we need it to correctly decide whether that
     * first contact falls inside [$from, $to]. This means one full pass over
     * contact-type activities per report load; acceptable at this app's scale. If it
     * ever becomes slow, add an index on activities(lead_id, type, created_at) (today
     * there's only (lead_id, created_at)) or bound the lookback window.
     */
    private function speedToFirstContact(Carbon $from, Carbon $to): array
    {
        $firstContacts = Activity::query()
            ->whereIn('type', ['call', 'whatsapp', 'email_sent'])
            ->selectRaw('lead_id, user_id, MIN(created_at) as first_contact_at')
            ->groupBy('lead_id', 'user_id')
            ->get()
            ->groupBy('lead_id')
            ->map(fn ($rows) => $rows->sortBy('first_contact_at')->first());

        $leadIds = $firstContacts->keys();
        if ($leadIds->isEmpty()) {
            return [];
        }

        $leads = Lead::whereIn('id', $leadIds)->get(['id', 'created_at', 'assigned_to']);

        $perAgent = [];
        foreach ($leads as $lead) {
            $fc = $firstContacts->get($lead->id);
            if (!$fc || !$fc->first_contact_at) {
                continue;
            }

            $firstContactAt = Carbon::parse($fc->first_contact_at);
            if ($firstContactAt->lt($from) || $firstContactAt->gt($to)) {
                continue;
            }

            $agentId = $fc->user_id ?? $lead->assigned_to;
            if (!$agentId) {
                continue;
            }

            $hours = $lead->created_at->diffInHours($firstContactAt, false);
            if ($hours < 0) {
                continue;
            }

            $perAgent[$agentId]['sum_hours'] = ($perAgent[$agentId]['sum_hours'] ?? 0) + $hours;
            $perAgent[$agentId]['count']     = ($perAgent[$agentId]['count'] ?? 0) + 1;
        }

        return collect($perAgent)->map(fn ($v, $agentId) => [
            'user_id'     => (int) $agentId,
            'avg_hours'   => $v['count'] > 0 ? round($v['sum_hours'] / $v['count'], 1) : null,
            'sample_size' => $v['count'],
        ])->values()->all();
    }

    /**
     * Top countries/cities for leads created in range, plus a lightweight
     * top-3-countries-per-agent breakdown (not a full agent x country matrix,
     * which would be mostly noise for a small-agency dashboard).
     */
    private function geoBreakdown(Carbon $from, Carbon $to, int $topN = 10): array
    {
        $byCountry = Lead::selectRaw('country as name, COUNT(*) as value')
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('country')->where('country', '!=', '')
            ->groupBy('country')->orderByDesc('value')->limit($topN)->get();

        $byCity = Lead::selectRaw('city as name, COUNT(*) as value')
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('city')->where('city', '!=', '')
            ->groupBy('city')->orderByDesc('value')->limit($topN)->get();

        $perAgent = Lead::selectRaw('assigned_to, country, COUNT(*) as value')
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('assigned_to')
            ->whereNotNull('country')->where('country', '!=', '')
            ->groupBy('assigned_to', 'country')
            ->orderByDesc('value')
            ->get()
            ->groupBy('assigned_to')
            ->map(fn ($rows) => $rows->take(3)->map(fn ($r) => ['country' => $r->country, 'count' => $r->value])->values());

        return [
            'by_country'             => $byCountry,
            'by_city'                => $byCity,
            'top_countries_by_agent' => $perAgent,
        ];
    }

    /**
     * Email/WhatsApp funnel rates, anchored on sent_at in range (same convention as
     * channelBreakdown()). Deliberately not re-filtering opened_at/clicked_at by range
     * separately — that would create a mismatched denominator.
     */
    private function engagementRates(Carbon $from, Carbon $to): array
    {
        $emailSent    = EmailSend::whereBetween('sent_at', [$from, $to])->whereIn('status', ['sent', 'opened', 'clicked'])->count();
        $emailOpened  = EmailSend::whereBetween('sent_at', [$from, $to])->whereNotNull('opened_at')->count();
        $emailClicked = EmailSend::whereBetween('sent_at', [$from, $to])->whereNotNull('clicked_at')->count();

        $waSent      = WhatsappSend::whereBetween('sent_at', [$from, $to])->whereIn('status', ['sent', 'delivered', 'read'])->count();
        $waDelivered = WhatsappSend::whereBetween('sent_at', [$from, $to])->whereNotNull('delivered_at')->count();
        $waRead      = WhatsappSend::whereBetween('sent_at', [$from, $to])->whereNotNull('read_at')->count();

        return [
            'email' => [
                'sent' => $emailSent, 'opened' => $emailOpened, 'clicked' => $emailClicked,
                'open_rate'  => $emailSent > 0 ? round($emailOpened / $emailSent * 100) : 0,
                'click_rate' => $emailSent > 0 ? round($emailClicked / $emailSent * 100) : 0,
            ],
            'whatsapp' => [
                'sent' => $waSent, 'delivered' => $waDelivered, 'read' => $waRead,
                'delivery_rate' => $waSent > 0 ? round($waDelivered / $waSent * 100) : 0,
                'read_rate'     => $waSent > 0 ? round($waRead / $waSent * 100) : 0,
            ],
        ];
    }

    /**
     * Daily created-lead counts, mirroring DashboardController::ownerView()'s leadsOverTime.
     */
    private function leadsTrend(Carbon $from, Carbon $to)
    {
        return Lead::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }
}
