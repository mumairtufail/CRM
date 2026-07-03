import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { ArrowLeft, Globe, Save, Search, ShieldAlert, Sparkles, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function Seo({ seo, app_url }) {
  const { data, setData, post, processing, errors } = useForm({
    meta_title: seo.meta_title || '',
    meta_description: seo.meta_description || '',
    meta_keywords: seo.meta_keywords || '',
    robots_txt: seo.robots_txt || "User-agent: *\nDisallow:",
  })

  const submit = (e) => {
    e.preventDefault()
    post('/admin/settings/seo', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('SEO and Indexing settings updated successfully!')
      },
      onError: (err) => {
        const firstErr = Object.values(err)[0]
        toast.error(firstErr || 'Failed to update settings.')
      }
    })
  }

  const sitemapUrl = `${app_url.replace(/\/$/, '')}/sitemap.xml`

  return (
    <>
      <Head title="Admin · SEO & Indexing" />
      <AdminLayout title="SEO & Indexing">
        <div className="max-w-5xl mx-auto py-4 px-2">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-3">
            <Link href="/admin/settings" className="hover:text-violet-600 transition-colors">Settings</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">SEO & Indexing</span>
          </div>

          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-[17px] font-bold text-slate-800 mb-0.5 flex items-center gap-2">
                <Globe size={18} className="text-violet-600" />
                SEO & Indexing Configuration
              </h1>
              <p className="text-[12px] text-slate-400 font-normal leading-snug">
                Optimize search visibility, manage robots.txt rules, and configure dynamic site crawl maps.
              </p>
            </div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-600 transition-colors shrink-0"
            >
              <ArrowLeft size={12} /> Back
            </Link>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* Card 1: Default Meta Tags */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <h2 className="text-[13.5px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Search size={15} className="text-violet-500" />
                  Global Meta Tags
                </h2>
                <p className="text-[11.5px] text-slate-400 mb-3 leading-snug">
                  Default fallback for search engines on pages without custom SEO data.
                </p>

                <div className="space-y-3">
                  {/* Meta Title */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Default Meta Title
                    </label>
                    <input
                      type="text"
                      value={data.meta_title}
                      onChange={e => setData('meta_title', e.target.value)}
                      placeholder="LumeniaCRM - Turn Leads into Revenue"
                      className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none text-slate-750"
                    />
                    {errors.meta_title && <p className="text-red-500 text-[11px] mt-1">{errors.meta_title}</p>}
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Default Meta Description
                    </label>
                    <textarea
                      value={data.meta_description}
                      onChange={e => setData('meta_description', e.target.value)}
                      placeholder="Describe your platform in under 160 characters..."
                      rows="3"
                      className="w-full p-2.5 text-[12.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none text-slate-600 resize-none leading-normal"
                    />
                    {errors.meta_description && <p className="text-red-500 text-[11px] mt-1">{errors.meta_description}</p>}
                  </div>

                  {/* Meta Keywords */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Default Keywords (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={data.meta_keywords}
                      onChange={e => setData('meta_keywords', e.target.value)}
                      placeholder="crm, pipeline tracking, lead generation"
                      className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none text-slate-750"
                    />
                    {errors.meta_keywords && <p className="text-red-500 text-[11px] mt-1">{errors.meta_keywords}</p>}
                  </div>
                </div>
              </div>

              {/* Right column: robots.txt + Sitemap status */}
              <div className="space-y-4">
                {/* Card 2: robots.txt Editor */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <h2 className="text-[13.5px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <ShieldAlert size={15} className="text-amber-500" />
                    robots.txt Configuration
                  </h2>
                  <p className="text-[11.5px] text-slate-400 mb-3 leading-snug">
                    Controls how search bots crawl your site. Saving updates the public file instantly.
                  </p>

                  <div>
                    <textarea
                      value={data.robots_txt}
                      onChange={e => setData('robots_txt', e.target.value)}
                      placeholder="User-agent: *..."
                      rows="5"
                      className="w-full p-2.5 font-mono text-[12px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none bg-slate-50 text-slate-700 leading-normal"
                    />
                    <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-400 space-y-1">
                      <p>• <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-150 text-slate-600">User-agent: *</span> targets all spiders.</p>
                      <p>• Add <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-150 text-slate-600">Sitemap: {sitemapUrl}</span> for discovery.</p>
                    </div>
                    {errors.robots_txt && <p className="text-red-500 text-[11px] mt-1">{errors.robots_txt}</p>}
                  </div>
                </div>

                {/* Card 3: Sitemap Status */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <h2 className="text-[13.5px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <FileText size={15} className="text-emerald-500" />
                    Dynamic Sitemap Status
                  </h2>
                  <p className="text-[11.5px] text-slate-400 mb-3 leading-snug">
                    Dynamically generated, including landing pages and all published blog posts.
                  </p>

                  <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block text-[12.5px] font-bold text-emerald-800">sitemap.xml is active</span>
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        className="inline-block text-[11.5px] text-violet-600 hover:text-violet-800 font-semibold underline mt-1 break-all"
                      >
                        {sitemapUrl}
                      </a>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={processing}
                className="px-3.5 py-2 rounded-lg bg-violet-600 text-[12.5px] font-bold text-white hover:bg-violet-700 flex items-center gap-1.5 transition-colors shadow-sm shadow-violet-500/10 disabled:opacity-50"
              >
                <Save size={13} /> Save Configuration
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  )
}
