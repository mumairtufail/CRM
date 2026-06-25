import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { Search, User, Mail, ChevronRight } from 'lucide-react'

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

        <div className="max-w-2xl mx-auto py-6 px-2">
          <div className="mb-6">
            <h1 className="text-[20px] font-bold text-slate-800 mb-1">Settings</h1>
            <p className="text-[13px] text-slate-400">Manage your account and platform configuration.</p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search settings…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition"
            />
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <p className="text-center text-[13px] text-slate-400 py-12">No settings match your search.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map(({ id, label, description, icon: Icon, href, iconBg, iconColor }) => (
                <Link
                  key={id}
                  href={href}
                  className="group flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-violet-300 hover:shadow-sm transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={18} className={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-800">{label}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>
                  </div>
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-violet-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

      </AdminLayout>
    </>
  )
}
