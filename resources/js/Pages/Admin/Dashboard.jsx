import { Head, Link } from '@inertiajs/react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import StatCard from '@/Components/Common/StatCard'
import { Building2, Users, UserCircle, FileText, ArrowRight } from 'lucide-react'

const ROLE_STYLES = {
  owner:  'bg-brand-50 text-brand-600',
  member: 'bg-slate-100 text-slate-500',
}

export default function AdminDashboard({ stats, recentOrganizations, recentUsers }) {
  return (
    <>
      <Head title="Admin · Dashboard" />
      <AdminLayout title="Platform Dashboard">
        <PageHeader
          title="Platform Overview"
          description="System-wide metrics across every workspace"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Organizations" value={stats.organizations} icon={Building2} color="purple" index={0} />
          <StatCard title="Users"         value={stats.users}         icon={Users}     color="blue"   index={1} />
          <StatCard title="Total Leads"   value={stats.leads}         icon={UserCircle} color="teal"  index={2} />
          <StatCard title="Invoices"      value={stats.invoices}      icon={FileText}  color="amber"  index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent organizations */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-slate-800">Recent Organizations</h3>
              <Link href="/admin/organizations" className="text-[12px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-1">
              {recentOrganizations.length === 0 && (
                <p className="text-[13px] text-slate-400 py-6 text-center">No organizations yet.</p>
              )}
              {recentOrganizations.map(org => (
                <div key={org.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 100%)' }}>
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{org.name}</p>
                    <p className="text-[11.5px] text-slate-400 truncate">{org.owner || 'No owner'} · {org.created_at}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-semibold text-slate-600">{org.users_count} users</p>
                    <p className="text-[11px] text-slate-400">{org.leads_count} leads</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent users */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-slate-800">Recent Users</h3>
              <Link href="/admin/users" className="text-[12px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-1">
              {recentUsers.length === 0 && (
                <p className="text-[13px] text-slate-400 py-6 text-center">No users yet.</p>
              )}
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-[12px] font-bold shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{u.name}</p>
                    <p className="text-[11.5px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold capitalize ${ROLE_STYLES[u.role] || ROLE_STYLES.member}`}>
                      {u.role}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[120px]">{u.organization || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
