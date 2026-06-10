<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectDocumentController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $request->validate([
            'name'  => 'required|string|max:200',
            'notes' => 'nullable|string',
            'file'  => 'required|file|max:51200',
        ]);

        $file = $request->file('file');
        $path = $file->store("project-documents/{$project->id}", 'public');

        $doc = $project->documents()->create([
            'organization_id' => $project->organization_id,
            'name'            => $request->input('name'),
            'notes'           => $request->input('notes'),
            'file_path'       => $path,
            'original_name'   => $file->getClientOriginalName(),
            'mime_type'       => $file->getMimeType(),
            'size'            => $file->getSize(),
        ]);

        return response()->json(['ok' => true, 'doc' => [
            'id'             => $doc->id,
            'name'           => $doc->name,
            'original_name'  => $doc->original_name,
            'mime_type'      => $doc->mime_type,
            'size'           => $doc->size,
            'formatted_size' => $doc->formatted_size,
            'notes'          => $doc->notes,
            'url'            => $doc->url,
            'created_at'     => $doc->created_at->toISOString(),
        ]]);
    }

    public function destroy(Project $project, ProjectDocument $document)
    {
        abort_if($document->project_id !== $project->id, 403);

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['ok' => true]);
    }
}
