import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { Search, User, Mail, ChevronRight, Image as ImageIcon, Cpu, Globe } from 'lucide-react'

const CARDS = [
  {
    id:          'account',
    label:       'Account',
    description: 'Update your name, email address, and password.',
    icon:        User,
    href:        '/admin/settings/account',
    iconBg:      'bg-violet-50',
    iconColor:   'text-violet-600',
  },
  {
    id:          'smtp',
    label:       'SMTP / Email',
    description: 'Configure the outbound mail server used for platform emails.',
    icon:        Mail,
    href:        '/admin/smtp-settings',
    iconBg:      'bg-blue-50',
    iconColor:   'text-blue-600',
  },
  {
    id:          'branding',
    label:       'Branding & Logo',
    description: 'Upload a custom logo and download vector/raster logo assets.',
    icon:        ImageIcon,
    href:        '/admin/settings/branding',
    iconBg:      'bg-emerald-50',
    iconColor:   'text-emerald-600',
  },
  {
    id:          'ai',
    label:       'AI Configuration',
    description: 'Configure and test the system-wide AI provider and models.',
    icon:        Cpu,
    href:        '/admin/settings/ai',
    iconBg:      'bg-purple-50',
    iconColor:   'text-purple-600',
  },
  {
    id:          'seo',
    label:       'SEO & Indexing',
    description: 'Manage landing page meta tags, robots.txt, and sitemap configuration.',
    icon:        Globe,
    href:        '/admin/settings/seo',
    iconBg:      'bg-indigo-50',
    iconColor:   'text-indigo-600',
  },
]

export default function AdminSettings() {
  const [query, setQuery] = useState('')

  const filtered = CARDS.filter(c =>
    !query.trim() ||
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <Head title="Admin · Settings" />
      <AdminLayout title="Settings">

        <div className="max-w-5xl mx-auto py-4 px-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[18px] font-bold text-slate-800 leading-tight">Settings</h1>
              <p className="text-[12px] text-slate-400">Manage your account and platform configuration.</p>
            </div>

            {/* Search */}
            <div className="relative w-64 shrink-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search settings…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition"
              />
            </div>
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <p className="text-center text-[13px] text-slate-400 py-12">No settings match your search.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(({ id, label, description, icon: Icon, href, iconBg, iconColor }) => (
                <Link
                  key={id}
                  href={href}
                  className="group flex flex-col gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-violet-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                      <Icon size={16} className={iconColor} />
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-violet-400 transition-colors shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800">{label}</p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </AdminLayout>
    </>
  )
}
