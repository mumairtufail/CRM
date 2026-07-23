<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::withoutGlobalScopes()
            ->with(['causer:id,name', 'organization:id,name'])
            ->orderByDesc('created_at');

        if ($orgId = $request->input('organization_id')) {
            $query->where('organization_id', $orgId);
        }

        if ($user = $request->input('user')) {
            $query->where(function ($q) use ($user) {
                $q->where('causer_name', 'like', "%{$user}%")
                  ->orWhereHas('causer', fn ($cq) => $cq->where('name', 'like', "%{$user}%"));
            });
        }

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        if ($ip = $request->input('ip')) {
            $query->where('ip_address', 'like', "%{$ip}%");
        }

        if ($from = $request->input('from')) {
            $query->where('created_at', '>=', $from . ' 00:00:00');
        }

        if ($to = $request->input('to')) {
            $query->where('created_at', '<=', $to . ' 23:59:59');
        }

        $logs = $query->paginate(25)->withQueryString();

        $logs->getCollection()->transform(fn (ActivityLog $log) => [
            'id'          => $log->id,
            'action'      => $log->action,
            'description' => $log->description,
            'causer_name' => $log->causer?->name ?? $log->causer_name ?? 'System',
            'organization'=> $log->organization?->name ?? '—',
            'ip_address'  => $log->ip_address,
            'created_at'  => $log->created_at->format('n/j/Y, g:i A'),
        ]);

        return Inertia::render('Admin/ActivityLog/Index', [
            'logs'          => $logs,
            'filters'       => $request->only(['organization_id', 'user', 'action', 'ip', 'from', 'to']),
            'organizations' => Organization::orderBy('name')->get(['id', 'name']),
            'actions'       => ActivityLog::withoutGlobalScopes()->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
