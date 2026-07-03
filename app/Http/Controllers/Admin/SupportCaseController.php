<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SupportCase;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SupportCaseController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status']);

        $cases = SupportCase::with('organization:id,name')
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhereHas('organization', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->latest('last_message_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (SupportCase $case) => [
                'id'                => $case->id,
                'subject'           => $case->subject,
                'status'            => $case->status,
                'organization_name' => $case->organization?->name,
                'last_message_at'   => $case->last_message_at?->diffForHumans(),
                'created_at'        => $case->created_at->diffForHumans(),
            ]);

        $stats = [
            'total'   => SupportCase::count(),
            'open'    => SupportCase::where('status', 'open')->count(),
            'pending' => SupportCase::where('status', 'pending')->count(),
            'closed'  => SupportCase::where('status', 'closed')->count(),
        ];

        return Inertia::render('Admin/SupportCases', [
            'cases'   => $cases,
            'filters' => $filters,
            'stats'   => $stats,
        ]);
    }

    public function show(SupportCase $supportCase)
    {
        $supportCase->load('organization:id,name');

        $messages = $supportCase->messages()
            ->with(['user:id,name', 'admin:id,name'])
            ->get()
            ->map(fn ($m) => [
                'id'          => $m->id,
                'sender_type' => $m->sender_type,
                'sender_name' => $m->sender_name,
                'body'        => $m->body,
                'created_at'  => $m->created_at->toIso8601String(),
            ]);

        return response()->json([
            'case'     => [
                'id'                => $supportCase->id,
                'subject'           => $supportCase->subject,
                'status'            => $supportCase->status,
                'organization_name' => $supportCase->organization?->name,
            ],
            'messages' => $messages,
        ]);
    }

    public function reply(Request $request, SupportCase $supportCase)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $message = $supportCase->messages()->create([
            'sender_type' => 'admin',
            'admin_id'    => $request->user()->id,
            'body'        => $validated['body'],
        ]);

        $supportCase->status = 'pending';
        $supportCase->last_message_at = now();
        $supportCase->save();

        Notification::record([
            'organization_id' => $supportCase->organization_id,
            'type'            => 'support.replied',
            'title'           => 'Support replied to your case',
            'body'            => Str::limit($supportCase->subject, 100),
            'link'            => "/support/{$supportCase->id}",
            'data'            => ['support_case_id' => $supportCase->id],
        ]);

        return response()->json(['success' => true, 'message' => $message]);
    }

    public function updateStatus(Request $request, SupportCase $supportCase)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,pending,closed',
        ]);

        $supportCase->update(['status' => $validated['status']]);

        return back();
    }
}
