<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientDocument;
use Illuminate\Http\Request;

class ClientDocumentController extends Controller
{
    public function store(Request $request, Client $client)
    {
        $request->validate([
            'name'  => 'required|string|max:200',
            'file'  => 'required|file|max:20480', // 20 MB
            'notes' => 'nullable|string|max:1000',
        ]);

        $file = $request->file('file');
        $path = $file->store("client-docs/{$client->organization_id}/{$client->id}", 'public');

        $doc = ClientDocument::create([
            'organization_id' => $client->organization_id,
            'client_id'       => $client->id,
            'name'            => $request->input('name'),
            'file_path'       => $path,
            'original_name'   => $file->getClientOriginalName(),
            'mime_type'       => $file->getMimeType(),
            'size'            => $file->getSize(),
            'notes'           => $request->input('notes'),
        ]);

        return response()->json([
            'ok'  => true,
            'doc' => [
                'id'            => $doc->id,
                'name'          => $doc->name,
                'original_name' => $doc->original_name,
                'mime_type'     => $doc->mime_type,
                'size'          => $doc->size,
                'formatted_size'=> $doc->formatted_size,
                'notes'         => $doc->notes,
                'url'           => $doc->url,
                'created_at'    => $doc->created_at->toISOString(),
            ],
        ]);
    }

    public function destroy(Client $client, ClientDocument $document)
    {
        \Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['ok' => true]);
    }
}
