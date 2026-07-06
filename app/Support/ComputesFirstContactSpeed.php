<?php

namespace App\Support;

use App\Models\Activity;
use App\Models\Lead;
use Carbon\Carbon;

trait ComputesFirstContactSpeed
{
    /**
     * Per-agent average hours from Lead.created_at to the lead's first contact-type
     * Activity, within [$from, $to]. Uses the activity log rather than last_contacted_at
     * because that column is overwritten on every subsequent contact and only reflects
     * the most recent one.
     *
     * The initial activity scan isn't bounded by $from because a lead's true first
     * contact may predate the window — we need it to correctly decide whether that
     * first contact falls inside [$from, $to]. This means one full pass over
     * contact-type activities per report load; acceptable at this app's scale. If it
     * ever becomes slow, add an index on activities(lead_id, type, created_at) (today
     * there's only (lead_id, created_at)) or bound the lookback window.
     *
     * Returns raw sum_hours/count alongside the rounded avg so callers can combine
     * multiple agents into an exact org-wide weighted average without re-averaging
     * already-rounded numbers.
     */
    private function firstContactRows(Carbon $from, Carbon $to): array
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
            'sum_hours'   => $v['sum_hours'],
            'count'       => $v['count'],
            'avg_hours'   => $v['count'] > 0 ? round($v['sum_hours'] / $v['count'], 1) : null,
            'sample_size' => $v['count'],
        ])->values()->all();
    }
}
