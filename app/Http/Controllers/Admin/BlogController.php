<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
                'image_url'    => $blog->imageUrl(),
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
            'title'          => 'required|string|max:255',
            'subtitle'       => 'nullable|string|max:255',
            'description'    => 'nullable|string|max:500', // SEO Description
            'body'           => 'required|string',
            'tags'           => 'nullable|array',
            'tags.*'         => 'string',
            'image'          => 'nullable|image|max:3072', // 3MB max
            'image_url_link' => 'nullable|url|max:1000',
            'is_published'   => 'required|boolean',
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
        } elseif ($request->filled('image_url_link')) {
            $imagePath = $validated['image_url_link'];
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

        Cache::forget('latest_5_blogs');

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
                'image_url'    => $blog->imageUrl(),
                'image_path'   => $blog->image_path,
                'is_published' => $blog->is_published,
            ],
        ]);
    }

    public function update(Request $request, Blog $blog): RedirectResponse
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'subtitle'       => 'nullable|string|max:255',
            'description'    => 'nullable|string|max:500',
            'body'           => 'required|string',
            'tags'           => 'nullable|array',
            'tags.*'         => 'string',
            'image'          => 'nullable|image|max:3072',
            'image_url_link' => 'nullable|url|max:1000',
            'image_cleared'  => 'nullable|boolean',
            'is_published'   => 'required|boolean',
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
            // Delete old image if it exists and is local
            if ($blog->image_path && !filter_var($blog->image_path, FILTER_VALIDATE_URL)) {
                $oldPath = str_replace('/storage/', '', $blog->image_path);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('blogs', 'public');
            $blog->image_path = '/storage/' . $path;
        } elseif ($request->filled('image_url_link')) {
            // Delete old image if it exists and is local
            if ($blog->image_path && !filter_var($blog->image_path, FILTER_VALIDATE_URL)) {
                $oldPath = str_replace('/storage/', '', $blog->image_path);
                Storage::disk('public')->delete($oldPath);
            }
            $blog->image_path = $request->input('image_url_link');
        } elseif ($request->boolean('image_cleared')) {
            // Explicitly cleared
            if ($blog->image_path && !filter_var($blog->image_path, FILTER_VALIDATE_URL)) {
                $oldPath = str_replace('/storage/', '', $blog->image_path);
                Storage::disk('public')->delete($oldPath);
            }
            $blog->image_path = null;
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

        Cache::forget('latest_5_blogs');

        return redirect()->route('admin.blogs.index')->with('success', 'Blog post updated successfully.');
    }

    public function togglePublish(Blog $blog): RedirectResponse
    {
        $blog->is_published = !$blog->is_published;
        $blog->published_at = $blog->is_published ? now() : null;
        $blog->save();

        Cache::forget('latest_5_blogs');

        $status = $blog->is_published ? 'published' : 'unpublished';
        return back()->with('success', "Blog post successfully {$status}.");
    }

    public function destroy(Blog $blog): RedirectResponse
    {
        if ($blog->image_path && !filter_var($blog->image_path, FILTER_VALIDATE_URL)) {
            $oldPath = str_replace('/storage/', '', $blog->image_path);
            Storage::disk('public')->delete($oldPath);
        }

        $blog->delete();

        Cache::forget('latest_5_blogs');

        return back()->with('success', 'Blog post deleted successfully.');
    }

    public function generateSeoSuggest(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body'  => 'required|string',
        ]);

        $service = \App\Services\AiService::forAdmin();

        if (!$service) {
            return response()->json([
                'message' => 'Admin AI configuration is not set or inactive. Please configure an active AI provider in Admin Settings first.'
            ], 422);
        }

        $systemPrompt = "You are a professional SEO expert and blog copywriter. Analyze the post title and content, and provide optimized SEO metadata in strict JSON format. Do not wrap the JSON in markdown blocks (e.g. ```json), do not write any greetings or explanations. Respond with ONLY the raw JSON.";
        
        $bodyExcerpt = mb_substr(strip_tags($request->body), 0, 1200);
        $userPrompt = <<<PROMPT
Please generate an optimized SEO Title, Meta Description, and a list of tags for the following blog post:

Title: {$request->title}
Content: {$bodyExcerpt}

Expected JSON response format:
{
  "title": "Optimized title (under 60 characters)",
  "description": "Engaging search description (under 155 characters)",
  "tags": ["tag1", "tag2", "tag3"]
}
PROMPT;

        $reply = $service->chat($systemPrompt, $userPrompt, 400);

        if (!$reply) {
            return response()->json([
                'message' => 'AI Provider failed to respond. Please check your AI API key and connection settings.'
            ], 500);
        }

        $jsonText = trim($reply);
        // Clean markdown code blocks if the LLM wrapped it anyway
        if (preg_match('/^```(?:json)?(.*)```$/s', $jsonText, $matches)) {
            $jsonText = trim($matches[1]);
        }

        $data = json_decode($jsonText, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            \Illuminate\Support\Facades\Log::warning('LLM SEO suggestion returned invalid JSON', ['response' => $reply]);
            return response()->json([
                'message' => 'AI returned an invalid JSON response structure. Please try again.'
            ], 422);
        }

        return response()->json($data);
    }

    public function aiGenerate(Request $request): \Illuminate\Http\JsonResponse
    {
        $service = \App\Services\AiService::forAdmin();

        if (!$service) {
            return response()->json([
                'message' => 'Admin AI configuration is not set or inactive. Please configure an active AI provider in Admin Settings first.'
            ], 422);
        }

        // Fetch recent blog titles to avoid writing about similar/same topics
        $recentBlogs = Blog::orderBy('created_at', 'desc')->limit(10)->get(['title']);
        $recentTitles = $recentBlogs->pluck('title')->implode("\n");

        $systemPrompt = "You are a world-class SEO content writer, blog copywriter, and tech/real-estate/business analyst. Generate an engaging, SEO-optimized blog post in strict JSON format. The blog should be written in clean HTML (containing headings, paragraphs, bullet points, strong tags, etc.) for the body. Ensure the topic is trendy, modern, and related to technology (AI, software, CRM, productivity), real estate (smart homes, property market, financing, modern architecture), or a mix of these.";

        $userPrompt = <<<PROMPT
Generate a completely new, unique, and engaging blog post. 
Here are the titles of some recent blog posts to avoid (do not write about these topics or use these titles):
{$recentTitles}

Format the response as a raw JSON object (do not wrap in markdown ```json blocks).

Expected JSON Structure:
{
  "title": "A catchy, SEO-optimized title under 60 characters",
  "subtitle": "An interesting subtitle under 120 characters",
  "description": "An engaging SEO meta description under 155 characters",
  "tags": ["tag1", "tag2", "tag3"],
  "image_url": "A valid Unsplash image URL matching the topic. Choose from the following or generate a similar high-quality Unsplash image URL:
  - Tech/AI: https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80
  - Real Estate: https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80
  - Office/Workspace: https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80
  - Modern Building: https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80
  - Business: https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  "body": "The blog post body content in clean, rich HTML. Use <h2> and <h3> tags for sections, <p> for paragraphs, <ul>/<li> for lists, and <strong> for key points. Do NOT include <html> or <body> tags. The post should be informative, around 600-1000 words, SEO-friendly with natural keyword placement."
}
PROMPT;

        $reply = $service->chat($systemPrompt, $userPrompt, 2500);

        if (!$reply) {
            return response()->json([
                'message' => 'AI Provider failed to respond. Please check your AI API key and connection settings.'
            ], 500);
        }

        $jsonText = trim($reply);
        if (preg_match('/^```(?:json)?(.*)```$/s', $jsonText, $matches)) {
            $jsonText = trim($matches[1]);
        }

        $data = json_decode($jsonText, true);

        if (json_last_error() !== JSON_ERROR_NONE || empty($data['title']) || empty($data['body'])) {
            \Illuminate\Support\Facades\Log::warning('LLM Blog generation returned invalid JSON or incomplete post', ['response' => $reply]);
            return response()->json([
                'message' => 'AI returned an invalid response structure. Please try again.'
            ], 422);
        }

        $slug = Str::slug($data['title']);
        $originalSlug = $slug;
        $i = 1;
        while (Blog::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . (++$i);
        }

        $adminId = $request->user('admin')?->id;

        Blog::create([
            'title'        => $data['title'],
            'slug'         => $slug,
            'subtitle'     => $data['subtitle'] ?? null,
            'description'  => $data['description'] ?? null,
            'body'         => $data['body'],
            'tags'         => $data['tags'] ?? [],
            'image_path'   => $data['image_url'] ?? null,
            'is_published' => false, // Start as pending / unpublished
            'published_at' => null,
            'created_by'   => $adminId,
        ]);

        Cache::forget('latest_5_blogs');

        return response()->json([
            'message' => 'AI Blog post generated successfully as a pending draft.'
        ]);
    }
}
