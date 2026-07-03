<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\EmailSend;
use App\Models\Lead;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->isOwner() || $user->hasPermission('dashboard.view_all')) {
            return $this->ownerView();
        }

        return $this->agentView($user);
    }

    /**
     * Organization-wide KPIs — owners, and any role granted dashboard.view_all.
     */
    private function ownerView()
    {
        $now = now();

        $totalClosed    = Lead::whereIn('status', ['won', 'lost'])->count();
        $wonTotal       = Lead::byStatus('won')->count();

        $stats = [
            'total_leads'     => Lead::count(),
            'leads_change'    => $this->pctChange(
                Lead::whereMonth('created_at', $now->month)->count(),
                Lead::whereMonth('created_at', $now->copy()->subMonth()->month)->count()
            ),
            'won_count'       => Lead::byStatus('won')->whereMonth('updated_at', $now->month)->count(),
            'won_change'      => null,
            'emails_sent'     => EmailSend::whereMonth('created_at', $now->month)->where('status', 'sent')->count(),
            'pipeline_value'  => (float) Lead::whereNotIn('status', ['won', 'lost'])->sum('deal_value'),
            'conversion_rate' => $totalClosed > 0 ? round($wonTotal / $totalClosed * 100) : 0,
            'open_deals'      => Lead::whereNotIn('status', ['won', 'lost'])->where('deal_value', '>', 0)->count(),
        ];

        $leadsOverTime = Lead::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $statusBreakdown = Lead::selectRaw('status as name, COUNT(*) as value')
            ->groupBy('status')
            ->orderByDesc('value')
            ->get();

        $sourceBreakdown = Lead::selectRaw('source as name, COUNT(*) as value')
            ->groupBy('source')
            ->orderByDesc('value')
            ->limit(6)
            ->get();

        $recentLeads = Lead::with(['emails', 'tags'])
            ->latest()
            ->limit(6)
            ->get();

        $topDeals = Lead::whereNotNull('deal_value')
            ->where('deal_value', '>', 0)
            ->whereNotIn('status', ['lost'])
            ->orderByDesc('deal_value')
            ->limit(6)
            ->get()
            ->map(fn ($l) => [
                'id'         => $l->id,
                'full_name'  => $l->full_name,
                'company'    => $l->company,
                'deal_value' => (float) $l->deal_value,
                'currency'   => $l->currency,
                'status'     => $l->status,
            ]);

        $upcomingFollowUps = Lead::whereNotNull('follow_up_at')
            ->where('follow_up_at', '>=', now())
            ->where('follow_up_at', '<=', now()->addDays(7))
            ->orderBy('follow_up_at')
            ->limit(5)
            ->get()
            ->map(fn ($lead) => array_merge($lead->toArray(), [
                'follow_up_at_human' => $lead->follow_up_at->diffForHumans(),
            ]));

        $recentActivities = Activity::with('lead')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($a) => [
                'id'          => $a->id,
                'type'        => $a->type,
                'description' => $a->description,
                'created_at'  => $a->created_at->diffForHumans(),
                'lead_id'     => $a->lead_id,
                'lead_name'   => $a->lead?->full_name,
            ]);

        return Inertia::render('Dashboard', compact(
            'stats', 'leadsOverTime', 'statusBreakdown', 'sourceBreakdown',
            'recentLeads', 'topDeals', 'upcomingFollowUps', 'recentActivities'
        ) + ['viewType' => 'owner']);
    }

    /**
     * Own-performance KPIs for a team member (agent) without dashboard.view_all —
     * scoped to leads assigned to them and activities they personally logged.
     */
    private function agentView($user)
    {
        $now = now();

        $agentStats = [
            'leads_assigned'  => Lead::where('assigned_to', $user->id)->count(),
            'leads_contacted' => Lead::where('assigned_to', $user->id)->whereNotNull('last_contacted_at')->count(),
            'emails_sent'     => EmailSend::whereHas('lead', fn ($q) => $q->where('assigned_to', $user->id))
                ->where('status', 'sent')
                ->whereMonth('created_at', $now->month)
                ->count(),
            'calls_made'      => Activity::where('user_id', $user->id)
                ->where('type', 'call')
                ->whereMonth('created_at', $now->month)
                ->count(),
            'follow_ups_due'  => Lead::where('assigned_to', $user->id)
                ->whereNotNull('follow_up_at')
                ->where('follow_up_at', '<=', $now)
                ->count(),
        ];

        $myLeads = Lead::with(['emails', 'tags'])
            ->where('assigned_to', $user->id)
            ->latest()
            ->limit(6)
            ->get();

        $upcomingFollowUps = Lead::where('assigned_to', $user->id)
            ->whereNotNull('follow_up_at')
            ->where('follow_up_at', '>=', $now)
            ->where('follow_up_at', '<=', $now->copy()->addDays(7))
            ->orderBy('follow_up_at')
            ->limit(5)
            ->get()
            ->map(fn ($lead) => array_merge($lead->toArray(), [
                'follow_up_at_human' => $lead->follow_up_at->diffForHumans(),
            ]));

        $recentActivities = Activity::with('lead')
            ->where('user_id', $user->id)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($a) => [
                'id'          => $a->id,
                'type'        => $a->type,
                'description' => $a->description,
                'created_at'  => $a->created_at->diffForHumans(),
                'lead_id'     => $a->lead_id,
                'lead_name'   => $a->lead?->full_name,
            ]);

        return Inertia::render('Dashboard', [
            'viewType'          => 'agent',
            'agentStats'        => $agentStats,
            'myLeads'           => $myLeads,
            'upcomingFollowUps' => $upcomingFollowUps,
            'recentActivities'  => $recentActivities,
        ]);
    }

    private function pctChange(int $current, int $previous): ?int
    {
        if ($previous === 0) return null;
        return (int) round((($current - $previous) / $previous) * 100);
    }
}
