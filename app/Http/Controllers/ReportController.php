<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\EmailSend;
use App\Models\Lead;
use App\Models\User;
use App\Models\WhatsappSend;
use App\Support\ComputesFirstContactSpeed;
use App\Support\ResolvesDateRange;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    use ResolvesDateRange;
    use ComputesFirstContactSpeed;

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

        $contactSpeedRows = $this->firstContactRows($from, $to);
        $speedMap         = collect($contactSpeedRows)->keyBy('user_id');

        $agentRows = $users->map(function (User $user) use ($from, $to, $speedMap) {
            $row = $this->agentRow($user, $from, $to);
            $row['avg_hours_to_contact'] = $speedMap->get($user->id)['avg_hours'] ?? null;
            $row['contact_sample_size']  = $speedMap->get($user->id)['sample_size'] ?? 0;

            return $row;
        })->values();

        $channelBreakdown = $this->channelBreakdown($from, $to);
        $funnel           = $this->funnel($from, $to);
        $engagement       = $this->engagementRates($from, $to);

        $totalContactHours = array_sum(array_column($contactSpeedRows, 'sum_hours'));
        $totalContactCount = array_sum(array_column($contactSpeedRows, 'count'));

        $summary = [
            'leads_created'          => $funnel['total'],
            'contact_rate'           => $funnel['contact_rate'],
            'win_rate'               => $funnel['win_rate_of_closed'],
            'emails_sent'            => $engagement['email']['sent'],
            'whatsapp_sent'          => $engagement['whatsapp']['sent'],
            'active_agents'          => Activity::whereBetween('created_at', [$from, $to])->distinct('user_id')->count('user_id'),
            'org_avg_hours_to_contact' => $totalContactCount > 0 ? round($totalContactHours / $totalContactCount, 1) : null,
        ];

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
            'funnel'           => $funnel,
            'geo'              => $this->geoBreakdown($from, $to),
            'engagement'       => $engagement,
            'summary'          => $summary,
            'leadsTrend'       => $this->leadsTrend($from, $to),
            'activities'       => $activities,
            'filters'          => $request->only(['user_id', 'type', 'range', 'from', 'to']),
            'filterOptions'    => [
                'users' => $users->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]),
                'types' => ['import', 'status_change', 'call', 'note', 'reassignment', 'deletion', 'whatsapp'],
            ],
        ]);
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
