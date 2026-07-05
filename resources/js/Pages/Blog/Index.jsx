import { Head, Link, usePage } from '@inertiajs/react'
import { BookOpen, Calendar, Clock, ArrowRight, ChevronRight, User } from 'lucide-react'
import Logo from '@/Components/Common/Logo'
import SiteFooter from '@/Components/Common/SiteFooter'
import { useState } from 'react'

export default function Index({ blogs }) {
  const { props } = usePage()
  const latestBlogs = props.latestBlogs || []
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <Head>
        <title>Blog · LumeniaCRM</title>
        <meta name="description" content="Read the latest articles, guides, and updates on pipeline management, customer relations, and business growth from the team at LumeniaCRM." />
        <meta property="og:title" content="LumeniaCRM Blog" />
        <meta property="og:description" content="Guides and articles to help you turn leads into revenue." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800">
        {/* Simple Navbar */}
        <header className="sticky top-0 z-50 bg-[rgb(var(--brand-tint))]/85 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={32} showText={true} text="LumeniaCRM" textClassName="text-[17px] font-extrabold" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-slate-600">
              <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              <Link href="/blog" className="text-brand-600">Blog</Link>
              <Link href="/login" className="hover:text-brand-600 transition-colors">Sign in</Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-brand-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </nav>
            {/* Mobile menu toggle omitted for clean minimalism */}
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-slate-200/50 relative overflow-hidden bg-gradient-to-b from-white to-transparent">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full opacity-[0.04] pointer-events-none blur-3xl bg-brand-600" />
          
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              The <span className="bg-gradient-to-r from-brand-600 to-brand2-600 bg-clip-text text-transparent">LumeniaCRM</span> Blog
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed font-normal">
              Practical advice, design system deep dives, and expert pipeline tips to help you build relationships and win more sales.
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          {blogs.data.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <BookOpen className="mx-auto text-slate-300 mb-4" size={40} />
              <h2 className="text-[17px] font-bold text-slate-700">No Articles Yet</h2>
              <p className="text-[13px] text-slate-400 mt-1.5 max-w-xs mx-auto">
                We are currently crafting some amazing guides. Check back very soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.data.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col group"
                >
                  {/* Thumbnail */}
                  <Link href={`/blog/${post.slug}`} className="block aspect-[16/10] bg-slate-100 overflow-hidden relative border-b border-slate-100">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        alt={post.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-500">
                        <BookOpen size={24} />
                      </div>
                    )}
                  </Link>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Meta Tags / Info */}
                      <div className="flex flex-wrap items-center gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <Link href={`/blog/${post.slug}`} className="block">
                        <h2 className="text-[17px] font-bold text-slate-800 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      {/* Subtitle / Excerpt */}
                      {post.subtitle && (
                        <p className="text-[13px] text-slate-400 line-clamp-3 leading-relaxed font-normal">
                          {post.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Author & Footer */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-6 text-[12px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <User size={12} className="text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-600 truncate max-w-[100px]">{post.author_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {post.published_at}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {post.read_time}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {blogs.links && blogs.links.length > 3 && (
            <div className="mt-12 flex items-center justify-center gap-1.5">
              {blogs.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.url}
                  disabled={!link.url}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3.5 py-1.5 rounded-lg border text-[13px] transition-colors ${
                    link.active
                      ? 'bg-brand-600 border-brand-600 text-white font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  } ${!link.url && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <SiteFooter />
      </div>
    </>
  )
}
