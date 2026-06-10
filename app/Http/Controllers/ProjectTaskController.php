<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectTask;
use Illuminate\Http\Request;

class ProjectTaskController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:500',
            'description' => 'nullable|string',
            'priority'    => 'nullable|string|in:low,medium,high',
            'due_date'    => 'nullable|date',
        ]);

        $task = $project->tasks()->create(array_filter($validated, fn ($v) => $v !== null) + [
            'organization_id' => $project->organization_id,
            'status'          => 'todo',
            'priority'        => $validated['priority'] ?? 'medium',
        ]);

        return response()->json(['ok' => true, 'task' => [
            'id'          => $task->id,
            'title'       => $task->title,
            'description' => $task->description,
            'status'      => $task->status,
            'priority'    => $task->priority,
            'due_date'    => $task->due_date?->toDateString(),
            'sort_order'  => $task->sort_order,
            'created_at'  => $task->created_at->toISOString(),
        ]]);
    }

    public function update(Request $request, Project $project, ProjectTask $task)
    {
        $this->authorize_task($task, $project);

        $validated = $request->validate([
            'title'       => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:todo,in_progress,done',
            'priority'    => 'nullable|string|in:low,medium,high',
            'due_date'    => 'nullable|date',
        ]);

        $task->update(array_filter($validated, fn ($v) => $v !== null));

        return response()->json(['ok' => true, 'task' => [
            'id'          => $task->id,
            'title'       => $task->title,
            'description' => $task->description,
            'status'      => $task->status,
            'priority'    => $task->priority,
            'due_date'    => $task->due_date?->toDateString(),
            'sort_order'  => $task->sort_order,
            'created_at'  => $task->created_at->toISOString(),
        ]]);
    }

    public function destroy(Project $project, ProjectTask $task)
    {
        $this->authorize_task($task, $project);
        $task->delete();

        return response()->json(['ok' => true]);
    }

    private function authorize_task(ProjectTask $task, Project $project): void
    {
        abort_if($task->project_id !== $project->id, 403);
    }
}
