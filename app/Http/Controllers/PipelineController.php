<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Inertia\Inertia;

class PipelineController extends Controller
{
    const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'unqualified'];

    public function index()
    {
        $columns = [];
        foreach (self::STATUSES as $status) {
            $columns[$status] = Lead::with(['emails'])
                ->where('status', $status)
                ->latest()
                ->limit(100)
                ->get()
                ->map(fn ($l) => [
                    'id'                => $l->id,
                    'full_name'         => $l->full_name,
                    'company'           => $l->company,
                    'job_title'         => $l->job_title,
                    'deal_value'        => $l->deal_value,
                    'currency'          => $l->currency ?? 'USD',
                    'priority'          => $l->priority,
                    'status'            => $l->status,
                    'source'            => $l->source,
                    'avatar_url'        => $l->avatar_url,
                    'follow_up_at'      => $l->follow_up_at?->toISOString(),
                    'last_contacted_at' => $l->last_contacted_at?->toISOString(),
                    'primary_email'     => $l->emails->firstWhere('is_primary', true)?->email
                                          ?? $l->emails->first()?->email,
                ]);
        }

        $totals = Lead::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Pipeline', [
            'columns' => $columns,
            'totals'  => $totals,
        ]);
    }
}
