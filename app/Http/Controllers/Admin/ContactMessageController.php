<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status']);

        $messages = ContactMessage::query()
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name',    'like', "%{$search}%")
                      ->orWhere('email',   'like', "%{$search}%")
                      ->orWhere('subject', 'like', "%{$search}%")
                      ->orWhere('company', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($m) => [
                'id'         => $m->id,
                'name'       => $m->name,
                'email'      => $m->email,
                'company'    => $m->company,
                'phone'      => $m->phone,
                'subject'    => $m->subject,
                'message'    => $m->message,
                'status'     => $m->status,
                'admin_notes'=> $m->admin_notes,
                'read_at'    => $m->read_at?->diffForHumans(),
                'replied_at' => $m->replied_at?->diffForHumans(),
                'created_at' => $m->created_at->diffForHumans(),
                'created_at_full' => $m->created_at->format('d M Y, h:i A'),
            ]);

        $stats = [
            'total'   => ContactMessage::count(),
            'new'     => ContactMessage::where('status', 'new')->count(),
            'read'    => ContactMessage::where('status', 'read')->count(),
            'replied' => ContactMessage::where('status', 'replied')->count(),
        ];

        return Inertia::render('Admin/ContactMessages', [
            'messages' => $messages,
            'filters'  => $filters,
            'stats'    => $stats,
        ]);
    }

    public function update(Request $request, ContactMessage $contactMessage): RedirectResponse
    {
        $validated = $request->validate([
            'status'      => 'required|in:new,read,replied',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $data = ['status' => $validated['status'], 'admin_notes' => $validated['admin_notes'] ?? null];

        if ($validated['status'] === 'read' && ! $contactMessage->read_at) {
            $data['read_at'] = now();
        }

        if ($validated['status'] === 'replied' && ! $contactMessage->replied_at) {
            $data['replied_at'] = now();
            if (! $contactMessage->read_at) {
                $data['read_at'] = now();
            }
        }

        $contactMessage->update($data);

        return back();
    }

    public function destroy(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->delete();

        return back();
    }
}
