<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::with('lead')->withCount('documents');

        if ($status = $request->input('status')) {
            $query->byStatus($status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        $clients = $query->orderBy('converted_at', 'desc')->paginate(24)->withQueryString();

        $counts = [
            'all'        => Client::count(),
            'onboarding' => Client::byStatus('onboarding')->count(),
            'active'     => Client::byStatus('active')->count(),
            'inactive'   => Client::byStatus('inactive')->count(),
            'churned'    => Client::byStatus('churned')->count(),
        ];

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'counts'  => $counts,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(Client $client)
    {
        $client->load(['lead', 'documents']);

        return Inertia::render('Clients/Show', [
            'client' => array_merge($client->toArray(), [
                'documents' => $client->documents->map(fn ($d) => [
                    'id'            => $d->id,
                    'name'          => $d->name,
                    'original_name' => $d->original_name,
                    'mime_type'     => $d->mime_type,
                    'size'          => $d->size,
                    'formatted_size'=> $d->formatted_size,
                    'notes'         => $d->notes,
                    'url'           => $d->url,
                    'created_at'    => $d->created_at->toISOString(),
                ]),
            ]),
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:onboarding,active,inactive,churned',
            'notes'  => 'nullable|string',
            'name'   => 'nullable|string|max:200',
            'email'  => 'nullable|email|max:200',
            'phone'  => 'nullable|string|max:50',
            'company'=> 'nullable|string|max:200',
        ]);

        $client->update(array_filter($validated, fn ($v) => $v !== null));

        return response()->json(['ok' => true]);
    }

    public function destroy(Client $client)
    {
        // Delete associated document files
        foreach ($client->documents as $doc) {
            \Storage::disk('public')->delete($doc->file_path);
        }
        $client->delete();

        return redirect()->route('clients.index')->with('success', 'Client removed.');
    }
}
