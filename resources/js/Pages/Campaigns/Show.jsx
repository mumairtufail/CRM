import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/Components/ui/dialog'
import { ChevronLeft, Send, Eye, Users, CheckCircle, Mail, BarChart2, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_STYLE = {
  draft:     'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-50 text-blue-600',
  sending:   'bg-amber-50 text-amber-600',
  sent:      'bg-emerald-50 text-emerald-700',
  paused:    'bg-orange-50 text-orange-600',
}

function StatBox({ label, value, icon: Icon, color }) {
  return (
    <div className="text-center p-4">
      <div className={cn('text-2xl font-bold font-display', color)}>{value}</div>
      <div className="flex items-center justify-center gap-1 mt-1">
        <Icon size={11} className="text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
      </div>
    </div>
  )
}

export default function CampaignShow({ campaign }) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmSend, setConfirmSend] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSend = () => {
    setSending(true)
    router.post(`/campaigns/${campaign.id}/send`, {}, {
      onSuccess: () => { toast.success('Campaign sent!'); setConfirmSend(false) },
      onError: () => { toast.error('Send failed'); setSending(false); setConfirmSend(false) },
      onFinish: () => setSending(false),
    })
  }

  const handleDelete = () => {
    setDeleting(true)
    router.delete(`/campaigns/${campaign.id}`, {
      onSuccess: () => toast.success('Campaign deleted'),
      onError: () => { toast.error('Delete failed'); setDeleting(false); setConfirmDelete(false) },
      onFinish: () => setDeleting(false),
    })
  }

  const openRate = campaign.sent_count > 0
    ? Math.round((campaign.opened_count / campaign.sent_count) * 100)
    : 0

  const clickRate = campaign.sent_count > 0
    ? Math.round((campaign.clicked_count / campaign.sent_count) * 100)
    : 0

  return (
    <>
      <Head title={campaign.name} />
      <AppLayout title="Campaign">
        <div className="max-w-4xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/campaigns">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200">
                  <ChevronLeft size={13} /> Back
                </Button>
              </Link>
              <div>
                <h2 className="text-base font-bold text-foreground">{campaign.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', STATUS_STYLE[campaign.status] ?? STATUS_STYLE.draft)}>
                    {campaign.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{campaign.created_at}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-slate-200"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye size={13} /> Preview
              </Button>
              {campaign.status !== 'sent' && (
                <Link href={`/campaigns/${campaign.id}/edit`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200">
                    <Pencil size={13} /> Edit
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={13} /> Delete
              </Button>
              {campaign.status !== 'sent' && (
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0"
                  onClick={() => setConfirmSend(true)}
                >
                  <Send size={13} /> Send Now
                </Button>
              )}
            </div>
          </div>

          {/* Stats row */}
          {campaign.status === 'sent' && (
            <Card className="border-slate-200 shadow-none mb-3">
              <div className="grid grid-cols-4 divide-x divide-[#e5ddd5]">
                <StatBox label="Recipients"  value={campaign.total_recipients} icon={Users}      color="text-foreground" />
                <StatBox label="Sent"        value={campaign.sent_count}       icon={Send}       color="text-blue-600" />
                <StatBox label="Opens"       value={`${openRate}%`}            icon={Mail}       color="text-amber-600" />
                <StatBox label="Clicks"      value={`${clickRate}%`}           icon={BarChart2}  color="text-emerald-600" />
              </div>
            </Card>
          )}

          {/* Campaign details */}
          <Card className="border-slate-200 shadow-none mb-3">
            <CardHeader className="pb-2 pt-3.5 px-4">
              <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Subject</p>
                  <p className="text-foreground mt-0.5">{campaign.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">From</p>
                  <p className="text-foreground mt-0.5">{campaign.from_name} &lt;{campaign.from_email}&gt;</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Recipients</p>
                  <p className="text-foreground mt-0.5 flex items-center gap-1">
                    <Users size={11} />
                    {campaign.total_recipients} leads
                    {campaign.filters?.status && (
                      <span className="text-muted-foreground">(status: {campaign.filters.status})</span>
                    )}
                  </p>
                </div>
                {campaign.sent_at && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Sent at</p>
                    <p className="text-foreground mt-0.5">{campaign.sent_at}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Body preview card */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2 pt-3.5 px-4">
              <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">Email Body</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div
                className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none bg-[#faf8f5] rounded-lg p-4 border border-slate-200"
                dangerouslySetInnerHTML={{ __html: campaign.body_html }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Email Preview</DialogTitle>
            </DialogHeader>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-[#faf8f5] border-b border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {campaign.from_name?.charAt(0)?.toUpperCase() ?? 'S'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{campaign.from_name}</p>
                    <p className="text-[10px] text-muted-foreground">{campaign.from_email}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">{campaign.subject}</p>
              </div>
              <div className="bg-white p-6">
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: campaign.body_html
                      .replace(/{{name}}/g, 'John Doe')
                      .replace(/{{company}}/g, 'Acme Inc.'),
                  }}
                />
              </div>
              <div className="bg-[#faf8f5] border-t border-slate-200 px-6 py-3">
                <p className="text-[10px] text-muted-foreground text-center">
                  You're receiving this because you're a contact. · Unsubscribe
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send confirmation */}
        <Dialog open={confirmSend} onOpenChange={setConfirmSend}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Send campaign?</DialogTitle>
              <DialogDescription className="text-xs">
                This will send the campaign to{' '}
                <span className="font-semibold text-foreground">{campaign.total_recipients} leads</span>.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200" onClick={() => setConfirmSend(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={sending}
                className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0"
                onClick={handleSend}
              >
                <Send size={13} /> {sending ? 'Sending…' : 'Confirm & Send'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Delete campaign?</DialogTitle>
              <DialogDescription className="text-xs">
                <span className="font-semibold text-foreground">{campaign.name}</span> will be removed.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={deleting}
                className="h-8 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={handleDelete}
              >
                <Trash2 size={13} /> {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </>
  )
}
