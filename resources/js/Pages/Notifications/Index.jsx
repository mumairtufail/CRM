import { Head, router } from '@inertiajs/react'
import { useCallback } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import { Bell, Check, ChevronLeft, ChevronRight, UserPlus, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TYPE_META = {
  'lead.created':        { icon: UserPlus, color: 'text-emerald-600 bg-emerald-50' },
  'lead.email_received': { icon: Mail,     color: 'text-violet-600 bg-violet-50'   },
}

function timeAgo(iso) {
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }) } catch { return '' }
}

export default function NotificationsIndex({ notifications, unread }) {
  const { data: rows, ...pagination } = notifications

  const markAllRead = () => {
    if (!unread) return
    router.post('/notifications/read-all', {}, { preserveScroll: true })
  }

  const openNotification = (n) => {
    router.post(`/notifications/${n.id}/read`, {}, {
      preserveScroll: true,
      onSuccess: () => { if (n.link) router.visit(n.link) },
    })
  }

  const goPage = useCallback((page) => {
    router.get('/notifications', { page }, { preserveState: true })
  }, [])

  return (
    <>
      <Head title="Notifications" />
      <AppLayout title="Notifications">
        <PageHeader
          title="Notifications"
          description={`${pagination.total ?? 0} total · ${unread} unread`}
          action={unread > 0 && (
            <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={markAllRead}>
              <Check size={14} /> Mark all read
            </Button>
          )}
        />

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications yet" description="When your lead form is submitted, you'll see it here." />
          ) : (
            rows.map(n => {
              const meta = TYPE_META[n.type] || { icon: Bell, color: 'text-slate-500 bg-slate-100' }
              const Icon = meta.icon
              return (
                <button
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={`flex items-start gap-3 w-full px-4 sm:px-5 py-3.5 text-left border-b border-gray-50 last:border-0 transition-colors hover:bg-slate-50 ${
                    n.read_at ? '' : 'bg-violet-50/40'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13.5px] font-semibold text-slate-800 truncate">{n.title}</p>
                      {!n.read_at && <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />}
                    </div>
                    {n.body && <p className="text-[12.5px] text-slate-500 truncate mt-0.5">{n.body}</p>}
                    <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-1 mt-3">
            <p className="text-xs text-muted-foreground">
              Showing {pagination.from}–{pagination.to} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => goPage(pagination.current_page - 1)} disabled={pagination.current_page === 1}>
                <ChevronLeft size={14} />
              </Button>
              <span className="text-xs font-medium px-2 text-gray-600">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => goPage(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  )
}
