<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::latest()->paginate(20)
            ->through(fn ($n) => [
                'id'         => $n->id,
                'type'       => $n->type,
                'title'      => $n->title,
                'body'       => $n->body,
                'link'       => $n->link,
                'read_at'    => $n->read_at,
                'created_at' => $n->created_at->toIso8601String(),
            ]);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unread'        => Notification::unread()->count(),
        ]);
    }

    public function markRead(Notification $notification): RedirectResponse
    {
        $notification->markRead();

        return back();
    }

    public function markAllRead(): RedirectResponse
    {
        Notification::unread()->update(['read_at' => now()]);

        return back();
    }

    /**
     * Delete a single notification — works whether read or unread.
     */
    public function destroy(Notification $notification): RedirectResponse
    {
        $id = $notification->id;
        $notification->delete();

        Log::channel('notifications')->info('Notification deleted', ['id' => $id]);

        return back();
    }

    /**
     * Clear every notification for the current workspace (read and unread).
     */
    public function destroyAll(): RedirectResponse
    {
        $count = Notification::query()->delete();

        Log::channel('notifications')->info('All notifications cleared', ['count' => $count]);

        return back();
    }
}
