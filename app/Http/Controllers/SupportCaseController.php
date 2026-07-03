<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\SupportCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SupportCaseController extends Controller
{
    public function index()
    {
        $cases = SupportCase::with(['creator:id,name', 'latestMessage'])
            ->latest('last_message_at')
            ->get()
            ->map(fn (SupportCase $case) => [
                'id'              => $case->id,
                'subject'         => $case->subject,
                'status'          => $case->status,
                'last_message_at' => $case->last_message_at?->diffForHumans(),
                'creator_name'    => $case->creator?->name,
                'last_message'    => $case->latestMessage?->only(['body', 'sender_type']),
            ]);

        return Inertia::render('Support/Index', [
            'cases' => $cases,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body'    => 'required|string|max:5000',
        ]);

        $case = DB::transaction(function () use ($validated, $request) {
            $case = SupportCase::create([
                'subject'         => $validated['subject'],
                'status'          => 'open',
                'created_by'      => $request->user()->id,
                'last_message_at' => now(),
            ]);

            $case->messages()->create([
                'sender_type' => 'user',
                'user_id'     => $request->user()->id,
                'body'        => $validated['body'],
            ]);

            return $case;
        });

        return redirect()->route('support.index')->with('success', 'Case created.');
    }

    public function show(SupportCase $supportCase)
    {
        Notification::where('link', "/support/{$supportCase->id}")
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

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
                'id'      => $supportCase->id,
                'subject' => $supportCase->subject,
                'status'  => $supportCase->status,
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
            'sender_type' => 'user',
            'user_id'     => $request->user()->id,
            'body'        => $validated['body'],
        ]);

        if ($supportCase->status !== 'open') {
            $supportCase->status = 'open';
        }
        $supportCase->last_message_at = now();
        $supportCase->save();

        return response()->json(['success' => true, 'message' => $message]);
    }
}
