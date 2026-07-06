<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadGroup;
use App\Support\LeadsCache;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadGroupController extends Controller
{
    public function index()
    {
        $groups = LeadGroup::withCount('leads')
            ->latest()
            ->get()
            ->map(fn ($g) => [
                'id'          => $g->id,
                'name'        => $g->name,
                'description' => $g->description,
                'color'       => $g->color,
                'leads_count' => $g->leads_count,
                'created_at'  => $g->created_at->diffForHumans(),
            ]);

        return Inertia::render('Groups/Index', [
            'groups' => $groups,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'color'       => 'nullable|string|max:20',
        ]);

        $group = LeadGroup::create($validated);

        return redirect()->route('groups.show', $group)
            ->with('success', "Group \"{$group->name}\" created.");
    }

    public function show(LeadGroup $group)
    {
        $members = $group->leads()
            ->with('emails')
            ->paginate(25)
            ->through(fn ($lead) => [
                'id'            => $lead->id,
                'full_name'     => $lead->full_name,
                'company'       => $lead->company,
                'status'        => $lead->status,
                'primary_email' => $lead->primary_email,
                'added_at'      => $lead->pivot->added_at,
            ]);

        return Inertia::render('Groups/Show', [
            'group'   => [
                'id'          => $group->id,
                'name'        => $group->name,
                'description' => $group->description,
                'color'       => $group->color,
                'leads_count' => $group->leads()->count(),
            ],
            'members' => $members,
        ]);
    }

    public function update(Request $request, LeadGroup $group)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'color'       => 'nullable|string|max:20',
        ]);

        $group->update($validated);

        return back()->with('success', 'Group updated.');
    }

    public function destroy(LeadGroup $group)
    {
        $group->delete();

        return redirect()->route('groups.index')
            ->with('success', "Group \"{$group->name}\" deleted.");
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:lead_groups,id',
        ]);

        $count = LeadGroup::whereIn('id', $validated['ids'])->delete();

        return redirect()->route('groups.index')
            ->with('success', "{$count} group" . ($count !== 1 ? 's' : '') . ' deleted.');
    }

    public function addLeads(Request $request, LeadGroup $group)
    {
        $validated = $request->validate([
            'lead_ids'   => 'required|array|min:1',
            'lead_ids.*' => 'integer|exists:leads,id',
        ]);

        $group->leads()->syncWithoutDetaching($validated['lead_ids']);
        LeadsCache::bust($group->organization_id);
        $count = count($validated['lead_ids']);

        return back()->with('success', "{$count} lead" . ($count !== 1 ? 's' : '') . " added to group.");
    }

    public function removeLeads(Request $request, LeadGroup $group)
    {
        $validated = $request->validate([
            'lead_ids'   => 'required|array|min:1',
            'lead_ids.*' => 'integer',
        ]);

        $group->leads()->detach($validated['lead_ids']);
        LeadsCache::bust($group->organization_id);

        return back()->with('success', 'Leads removed from group.');
    }

    /**
     * Return a lightweight list of groups for AJAX calls (e.g. from Leads page "Add to group").
     */
    public function listForSelect()
    {
        $groups = LeadGroup::withCount('leads')
            ->orderBy('name')
            ->get(['id', 'name', 'color'])
            ->map(fn ($g) => [
                'id'          => $g->id,
                'name'        => $g->name,
                'color'       => $g->color,
                'leads_count' => $g->leads_count,
            ]);

        return response()->json($groups);
    }
}
