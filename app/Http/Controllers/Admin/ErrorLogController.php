<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ErrorLog;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ErrorLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ErrorLog::with('organization:id,name')->orderByDesc('created_at');

        if ($source = $request->input('source')) {
            $query->where('source', $source);
        }

        if ($orgId = $request->input('organization_id')) {
            $query->where('organization_id', $orgId);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                  ->orWhere('file', 'like', "%{$search}%");
            });
        }

        if ($from = $request->input('from')) {
            $query->where('created_at', '>=', $from . ' 00:00:00');
        }

        if ($to = $request->input('to')) {
            $query->where('created_at', '<=', $to . ' 23:59:59');
        }

        $errors = $query->paginate(25)->withQueryString();

        $errors->getCollection()->transform(fn (ErrorLog $log) => [
            'id'              => $log->id,
            'source'          => $log->source,
            'message'         => $log->message,
            'exception_class' => $log->exception_class,
            'file'            => $log->file,
            'line'            => $log->line,
            'trace'           => $log->trace,
            'url'             => $log->url,
            'organization'    => $log->organization?->name ?? '—',
            'causer_name'     => $log->causer_name ?? '—',
            'ip_address'      => $log->ip_address,
            'created_at'      => $log->created_at->format('n/j/Y, g:i A'),
        ]);

        return Inertia::render('Admin/ErrorLog/Index', [
            'errors'        => $errors,
            'filters'       => $request->only(['source', 'organization_id', 'search', 'from', 'to']),
            'organizations' => Organization::orderBy('name')->get(['id', 'name']),
        ]);
    }
}
