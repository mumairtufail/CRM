<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => [
                'required', 'string', 'max:50',
                // Tag names are unique per-workspace, not globally — two
                // different organizations may each have their own "VIP" tag.
                Rule::unique('tags', 'name')->where('organization_id', $request->user()->organization_id),
            ],
            'color' => 'nullable|string|max:7',
        ]);

        Tag::create($validated);

        return back()->with('success', 'Tag created.');
    }

    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name'  => [
                'required', 'string', 'max:50',
                Rule::unique('tags', 'name')->where('organization_id', $request->user()->organization_id)->ignore($tag->id),
            ],
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
