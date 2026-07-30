import { Head, usePage } from '@inertiajs/react';

// Single source of truth for per-page <head> tags: title, description,
// canonical, Open Graph, Twitter Card, and optional JSON-LD structured
// data. `path` is the page's route path (e.g. `/blog/my-post`) — every
// page knows its own path statically, so it's passed rather than derived.
export default function SeoHead({ title, description, keywords, path = '', image, type = 'website', jsonLd }) {
    const { appUrl } = usePage().props;
    const url = `https://${appUrl}${path}`;
    const jsonLdBlocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

    return (
        <Head>
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={url} />

            <meta property="og:title" content={title} />
            {description && <meta property="og:description" content={description} />}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            {image && <meta property="og:image" content={image} />}

            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            {description && <meta name="twitter:description" content={description} />}
            {image && <meta name="twitter:image" content={image} />}

            {jsonLdBlocks.map((block, i) => (
                <script key={i} type="application/ld+json">{JSON.stringify(block)}</script>
            ))}
        </Head>
    );
}
