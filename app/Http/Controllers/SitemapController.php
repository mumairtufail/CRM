<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $appUrl = rtrim(config('app.url'), '/');
        $now = now()->toAtomString();

        $blogs = Blog::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->get(['slug', 'updated_at', 'published_at']);

        $xml = [];
        $xml[] = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Homepage
        $xml[] = '  <url>';
        $xml[] = "    <loc>{$appUrl}/</loc>";
        $xml[] = "    <lastmod>{$now}</lastmod>";
        $xml[] = '    <changefreq>daily</changefreq>';
        $xml[] = '    <priority>1.0</priority>';
        $xml[] = '  </url>';

        // Blog Index Page
        $xml[] = '  <url>';
        $xml[] = "    <loc>{$appUrl}/blog</loc>";
        $xml[] = "    <lastmod>{$now}</lastmod>";
        $xml[] = '    <changefreq>daily</changefreq>';
        $xml[] = '    <priority>0.8</priority>';
        $xml[] = '  </url>';

        // Individual Blog Posts
        foreach ($blogs as $blog) {
            $lastmod = ($blog->published_at ?? $blog->updated_at)->toAtomString();
            $xml[] = '  <url>';
            $xml[] = "    <loc>{$appUrl}/blog/{$blog->slug}</loc>";
            $xml[] = "    <lastmod>{$lastmod}</lastmod>";
            $xml[] = '    <changefreq>weekly</changefreq>';
            $xml[] = '    <priority>0.6</priority>';
            $xml[] = '  </url>';
        }

        $xml[] = '</urlset>';

        return response(implode("\n", $xml), 200)
            ->header('Content-Type', 'text/xml');
    }
}
