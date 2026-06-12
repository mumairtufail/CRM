import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import { Mail, Plus, Users, Send, Eye } from 'lucide-react'

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-50 text-blue-600',
  sending:   'bg-violet-50 text-violet-600',
  sent:      'bg-emerald-50 text-emerald-700',
  paused:    'bg-amber-50 text-amber-600',
  failed:    'bg-red-50 text-red-600',
}

export default function CampaignsIndex({ campaigns }) {
  return (
    <>
      <Head title="Campaigns" />
      <AppLayout title="Campaigns">
        <PageHeader
          title="Email Campaigns"
          description={`${campaigns?.length ?? 0} campaigns`}
          action={
            <Link href="/campaigns/create">
              <Button size="sm" className="gap-1.5 h-9">
                <Plus size={14} /> New Campaign
              </Button>
            </Link>
          }
        />

        {campaigns?.length ? (
          <div className="space-y-2 max-w-3xl">
            {campaigns.map(c => (
              <Link key={c.id} href={`/campaigns/${c.id}`} className="block">
                <div className="form-card px-4 py-3 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13.5px] font-semibold text-slate-800 truncate">{c.name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[c.status] ?? STATUS_STYLE.draft}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                        Subject: {c.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        From {c.from_name} &lt;{c.from_email}&gt; · {c.created_at}
                      </p>
                    </div>

                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-slate-400 justify-center">
                          <Users size={11} />
                          <span className="text-[12px] font-semibold text-slate-700">{c.total_recipients}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">recipients</p>
                      </div>
                      {c.status === 'sent' && (
                        <>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-slate-400 justify-center">
                              <Send size={10} />
                              <p className="text-[12px] font-semibold text-slate-700">{c.sent_count}</p>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-0.5">sent</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-slate-400 justify-center">
                              <Eye size={10} />
                              <p className="text-[12px] font-semibold text-slate-700">{c.opened_count}</p>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-0.5">opens</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Mail}
            title="No campaigns yet"
            description="Create your first email campaign to start reaching leads at scale."
            action={
              <Link href="/campaigns/create">
                <Button size="sm" className="gap-1.5 h-9">
                  <Plus size={14} /> Create Campaign
                </Button>
              </Link>
            }
          />
        )}
      </AppLayout>
    </>
  )
}
