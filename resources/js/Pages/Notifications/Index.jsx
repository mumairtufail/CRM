import { Head, router } from '@inertiajs/react'
import { useCallback } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import { Bell, Check, ChevronLeft, ChevronRight, UserPlus, Mail, MailOpen, MousePointerClick, Reply, Trash2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TYPE_META = {
  'lead.created':        { icon: UserPlus,           color: 'text-emerald-600 bg-emerald-50' },
  'lead.email_received': { icon: Mail,               color: 'text-brand-600 bg-brand-50'   },
  'lead.email_replied':  { icon: Reply,              color: 'text-blue-600 bg-blue-50'       },
  'lead.email_opened':   { icon: MailOpen,           color: 'text-amber-600 bg-amber-50'     },
  'lead.email_clicked':  { icon: MousePointerClick,  color: 'text-pink-600 bg-pink-50'       },
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

  const deleteOne = (e, n) => {
    e.stopPropagation()
    router.delete(`/notifications/${n.id}`, { preserveScroll: true, preserveState: true })
  }

  const clearAll = () => {
    if (!rows.length) return
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return
    router.delete('/notifications/clear', { preserveScroll: true })
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
          action={(
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={markAllRead}>
                  <Check size={14} /> Mark all read
                </Button>
              )}
              {rows.length > 0 && (
                <Button size="sm" variant="outline" className="gap-1.5 h-9 text-red-600 hover:text-red-700" onClick={clearAll}>
                  <Trash2 size={14} /> Clear all
                </Button>
              )}
            </div>
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
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 w-full px-4 sm:px-5 py-3.5 border-b border-gray-50 last:border-0 transition-colors hover:bg-slate-50 ${
                    n.read_at ? '' : 'bg-brand-50/40'
                  }`}
                >
                  <button onClick={() => openNotification(n)} className="flex items-start gap-3 min-w-0 flex-1 text-left">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-semibold text-slate-800 truncate">{n.title}</p>
                        {!n.read_at && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                      </div>
                      {n.body && <p className="text-[12.5px] text-slate-500 truncate mt-0.5">{n.body}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => deleteOne(e, n)}
                    aria-label="Delete notification"
                    title="Delete"
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X size={15} />
                  </button>
                </div>
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
