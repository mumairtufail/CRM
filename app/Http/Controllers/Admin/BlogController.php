<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $blogs = Blog::with('author:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(fn ($blog) => [
                'id'           => $blog->id,
                'title'        => $blog->title,
                'slug'         => $blog->slug,
                'subtitle'     => $blog->subtitle,
                'tags'         => $blog->tags ?? [],
                'image_url'    => $blog->image_path ? asset($blog->image_path) : null,
                'is_published' => $blog->is_published,
                'published_at' => $blog->published_at?->toDateTimeString(),
                'author_name'  => $blog->author?->name ?? 'System',
                'created_at'   => $blog->created_at->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Blogs/Index', [
            'blogs' => $blogs,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Blogs/Form', [
            'blog' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'subtitle'     => 'nullable|string|max:255',
            'description'  => 'nullable|string|max:500', // SEO Description
            'body'         => 'required|string',
            'tags'         => 'nullable|array',
            'tags.*'       => 'string',
            'image'        => 'nullable|image|max:3072', // 3MB max
            'is_published' => 'required|boolean',
        ]);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $i = 1;
        while (Blog::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . (++$i);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blogs', 'public');
            $imagePath = '/storage/' . $path;
        }

        Blog::create([
            'title'        => $validated['title'],
            'slug'         => $slug,
            'subtitle'     => $validated['subtitle'],
            'description'  => $validated['description'],
            'body'         => $validated['body'],
            'tags'         => $validated['tags'] ?? [],
            'image_path'   => $imagePath,
            'is_published' => $validated['is_published'],
            'published_at' => $validated['is_published'] ? now() : null,
            'created_by'   => $request->user('admin')->id,
        ]);

        return redirect()->route('admin.blogs.index')->with('success', 'Blog post created successfully.');
    }

    public function edit(Blog $blog): Response
    {
        return Inertia::render('Admin/Blogs/Form', [
            'blog' => [
                'id'           => $blog->id,
                'title'        => $blog->title,
                'subtitle'     => $blog->subtitle,
                'description'  => $blog->description,
                'body'         => $blog->body,
                'tags'         => $blog->tags ?? [],
                'image_url'    => $blog->image_path ? asset($blog->image_path) : null,
                'is_published' => $blog->is_published,
            ],
        ]);
    }

    public function update(Request $request, Blog $blog): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'subtitle'     => 'nullable|string|max:255',
            'description'  => 'nullable|string|max:500',
            'body'         => 'required|string',
            'tags'         => 'nullable|array',
            'tags.*'       => 'string',
            'image'        => 'nullable|image|max:3072',
            'is_published' => 'required|boolean',
        ]);

        // Keep or update slug if title changed significantly
        if ($blog->title !== $validated['title']) {
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $i = 1;
            while (Blog::where('slug', $slug)->where('id', '!=', $blog->id)->exists()) {
                $slug = $originalSlug . '-' . (++$i);
            }
            $blog->slug = $slug;
        }

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($blog->image_path) {
                $oldPath = str_replace('/storage/', '', $blog->image_path);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('blogs', 'public');
            $blog->image_path = '/storage/' . $path;
        }

        $wasPublished = $blog->is_published;
        
        $blog->title = $validated['title'];
        $blog->subtitle = $validated['subtitle'];
        $blog->description = $validated['description'];
        $blog->body = $validated['body'];
        $blog->tags = $validated['tags'] ?? [];
        $blog->is_published = $validated['is_published'];
        
        if ($validated['is_published'] && !$wasPublished) {
            $blog->published_at = now();
        } elseif (!$validated['is_published']) {
            $blog->published_at = null;
        }

        $blog->save();

        return redirect()->route('admin.blogs.index')->with('success', 'Blog post updated successfully.');
    }

    public function togglePublish(Blog $blog): RedirectResponse
    {
        $blog->is_published = !$blog->is_published;
        $blog->published_at = $blog->is_published ? now() : null;
        $blog->save();

        $status = $blog->is_published ? 'published' : 'unpublished';
        return back()->with('success', "Blog post successfully {$status}.");
    }

    public function destroy(Blog $blog): RedirectResponse
    {
        if ($blog->image_path) {
            $oldPath = str_replace('/storage/', '', $blog->image_path);
            Storage::disk('public')->delete($oldPath);
        }

        $blog->delete();

        return back()->with('success', 'Blog post deleted successfully.');
    }
}
