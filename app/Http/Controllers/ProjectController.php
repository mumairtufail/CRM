<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Project;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with('client')->withCount(['tasks', 'documents']);

        if ($status = $request->input('status')) {
            $query->byStatus($status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($clientId = $request->input('client_id')) {
            $query->where('client_id', $clientId);
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(24)->withQueryString();

        $counts = [
            'all'       => Project::count(),
            'planning'  => Project::byStatus('planning')->count(),
            'active'    => Project::byStatus('active')->count(),
            'on_hold'   => Project::byStatus('on_hold')->count(),
            'completed' => Project::byStatus('completed')->count(),
            'cancelled' => Project::byStatus('cancelled')->count(),
        ];

        $clients = Client::orderBy('name')->get(['id', 'name', 'company']);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'counts'   => $counts,
            'clients'  => $clients,
            'filters'  => $request->only(['status', 'search', 'client_id']),
        ]);
    }

    public function create()
    {
        $clients = Client::orderBy('name')->get(['id', 'name', 'company']);

        return Inertia::render('Projects/Create', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:200',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:planning,active,on_hold,completed,cancelled',
            'client_id'   => 'nullable|exists:clients,id',
            'start_date'  => 'nullable|date',
            'due_date'    => 'nullable|date',
            'budget'      => 'nullable|numeric|min:0',
            'currency'    => 'nullable|string|max:10',
        ]);

        $project = Project::create(array_filter($validated, fn ($v) => $v !== null) + [
            'status' => $validated['status'] ?? 'planning',
        ]);

        ActivityLogger::log('project.created', $project, description: "Created project {$project->name}");

        return redirect()->route('projects.show', $project)->with('success', 'Project created.');
    }

    public function show(Project $project)
    {
        $project->load(['client', 'tasks', 'documents']);

        return Inertia::render('Projects/Show', [
            'project' => array_merge($project->toArray(), [
                'tasks' => $project->tasks->map(fn ($t) => [
                    'id'          => $t->id,
                    'title'       => $t->title,
                    'description' => $t->description,
                    'status'      => $t->status,
                    'priority'    => $t->priority,
                    'due_date'    => $t->due_date?->toDateString(),
                    'sort_order'  => $t->sort_order,
                    'created_at'  => $t->created_at->toISOString(),
                ]),
                'documents' => $project->documents->map(fn ($d) => [
                    'id'             => $d->id,
                    'name'           => $d->name,
                    'original_name'  => $d->original_name,
                    'mime_type'      => $d->mime_type,
                    'size'           => $d->size,
                    'formatted_size' => $d->formatted_size,
                    'notes'          => $d->notes,
                    'url'            => $d->url,
                    'created_at'     => $d->created_at->toISOString(),
                ]),
                'client' => $project->client ? [
                    'id'      => $project->client->id,
                    'name'    => $project->client->name,
                    'company' => $project->client->company,
                    'email'   => $project->client->email,
                ] : null,
            ]),
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name'        => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:planning,active,on_hold,completed,cancelled',
            'client_id'   => 'nullable|exists:clients,id',
            'start_date'  => 'nullable|date',
            'due_date'    => 'nullable|date',
            'budget'      => 'nullable|numeric|min:0',
            'currency'    => 'nullable|string|max:10',
        ]);

        $project->update(array_filter($validated, fn ($v) => $v !== null));

        ActivityLogger::log('project.updated', $project, description: "Updated project {$project->name}");

        return response()->json(['ok' => true]);
    }

    public function destroy(Project $project)
    {
        ActivityLogger::log('project.deleted', description: "Deleted project {$project->name}", properties: ['project_id' => $project->id, 'project_name' => $project->name]);

        foreach ($project->documents as $doc) {
            \Storage::disk('public')->delete($doc->file_path);
        }
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted.');
    }
}
