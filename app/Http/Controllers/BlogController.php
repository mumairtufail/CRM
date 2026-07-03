<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $blogs = Blog::with('author:id,name')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->paginate(9)
            ->through(fn ($blog) => [
                'id'           => $blog->id,
                'title'        => $blog->title,
                'slug'         => $blog->slug,
                'subtitle'     => $blog->subtitle,
                'description'  => $blog->description,
                'image_url'    => $blog->imageUrl(),
                'tags'         => $blog->tags ?? [],
                'published_at' => $blog->published_at?->diffForHumans() ?? $blog->created_at->diffForHumans(),
                'author_name'  => $blog->author?->name ?? 'System',
                'read_time'    => $this->calculateReadTime($blog->body),
            ]);

        return Inertia::render('Blog/Index', [
            'blogs' => $blogs,
        ]);
    }

    public function show(string $slug): Response
    {
        $blog = Blog::with('author:id,name')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return Inertia::render('Blog/Show', [
            'blog' => [
                'title'        => $blog->title,
                'subtitle'     => $blog->subtitle,
                'description'  => $blog->description,
                'body'         => $blog->body,
                'image_url'    => $blog->imageUrl(),
                'tags'         => $blog->tags ?? [],
                'published_at' => $blog->published_at?->format('F j, Y') ?? $blog->created_at->format('F j, Y'),
                'author_name'  => $blog->author?->name ?? 'System',
                'read_time'    => $this->calculateReadTime($blog->body),
            ],
        ]);
    }

    private function calculateReadTime(string $content): string
    {
        $wordCount = str_word_count(strip_tags($content));
        $minutes = ceil($wordCount / 200); // 200 words per minute average reading speed
        return $minutes . ' min read';
    }
}
