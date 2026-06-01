<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::withCount('leads')->orderBy('name')->get();

        return Inertia::render('Tags/Index', ['tags' => $tags]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:50|unique:tags',
            'color' => 'nullable|string|max:7',
        ]);

        Tag::create($validated);

        return back()->with('success', 'Tag created.');
    }

    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:50|unique:tags,name,' . $tag->id,
            'color' => 'nullable|string|max:7',
        ]);

        $tag->update($validated);

        return back()->with('success', 'Tag updated.');
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();

        return back()->with('success', 'Tag deleted.');
    }
}
