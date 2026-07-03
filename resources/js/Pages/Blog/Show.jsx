import { Head, Link } from '@inertiajs/react'
import { Calendar, Clock, ArrowLeft, User, Tag as TagIcon, Sparkles } from 'lucide-react'
import Logo from '@/Components/Common/Logo'

export default function Show({ blog }) {
  return (
    <>
      <Head>
        <title>{`${blog.title} · LumeniaCRM`}</title>
        <meta name="description" content={blog.description || blog.subtitle} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.description || blog.subtitle} />
        {blog.image_url && <meta property="og:image" content={blog.image_url} />}
        <meta property="og:type" content="article" />
      </Head>

      <div className="min-h-screen bg-[#F4F2FF] font-sans antialiased text-slate-800">
        {/* Simple Navbar */}
        <header className="sticky top-0 z-50 bg-[#F4F2FF]/85 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={32} showText={true} text="LumeniaCRM" textClassName="text-[17px] font-extrabold" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-slate-600">
              <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
              <Link href="/blog" className="text-violet-600">Blog</Link>
              <Link href="/login" className="hover:text-violet-600 transition-colors">Sign in</Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-violet-500/10 transition-all"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* Back Link Wrapper */}
        <div className="max-w-3xl mx-auto px-6 pt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back to articles
          </Link>
        </div>

        {/* Post Container */}
        <main className="max-w-3xl mx-auto px-6 py-8">
          <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 md:p-10">
            {/* Meta and Header */}
            <header className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-wider border border-violet-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {blog.title}
              </h1>

              {blog.subtitle && (
                <p className="text-base text-slate-400 font-normal leading-relaxed">
                  {blog.subtitle}
                </p>
              )}

              {/* Author & Footer Details */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 text-[12.5px] text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <User size={13} className="text-slate-500" />
                  </div>
                  <span className="font-semibold text-slate-700">{blog.author_name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {blog.published_at}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {blog.read_time}
                  </span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {blog.image_url && (
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-250 mb-8 bg-slate-50">
                <img src={blog.image_url} className="w-full h-full object-cover" alt="" />
              </div>
            )}

            {/* Content Body */}
            <div
              dangerouslySetInnerHTML={{ __html: blog.body }}
              className="blog-content"
            />
          </article>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo size={28} showText={true} text="LumeniaCRM" textClassName="text-white text-[15px]" />
            </div>
            <p className="text-[12px] text-slate-500">
              &copy; {new Date().getFullYear()} LumeniaCRM. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        /* Premium custom typography for Blog Content HTML */
        .blog-content {
          font-size: 15px;
          line-height: 1.75;
          color: #334155; /* Slate 700 */
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .blog-content p {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-weight: 400;
        }

        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4 {
          color: #0f172a; /* Slate 900 */
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.3;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content h2 {
          font-size: 21px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.5rem;
        }

        .blog-content h3 {
          font-size: 17px;
        }

        .blog-content ul,
        .blog-content ol {
          margin-top: 0;
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        .blog-content ul {
          list-style-type: disc;
        }

        .blog-content ol {
          list-style-type: decimal;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
        }

        .blog-content a {
          color: #7c3aed; /* Violet 600 */
          text-decoration: underline;
          font-weight: 500;
        }

        .blog-content a:hover {
          color: #6d28d9;
        }

        .blog-content blockquote {
          font-style: italic;
          border-left: 4px solid #7c3aed;
          padding-left: 1.25rem;
          color: #475569;
          margin: 1.5rem 0;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
          border: 1px solid #e2e8f0;
        }

        .blog-content pre,
        .blog-content code {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 13px;
        }

        .blog-content code {
          padding: 2px 5px;
          color: #e11d48;
        }

        .blog-content pre {
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        .blog-content pre code {
          padding: 0;
          background-color: transparent;
          border: none;
          color: #334155;
        }
      `}</style>
    </>
  )
}
