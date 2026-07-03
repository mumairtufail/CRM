import { router } from '@inertiajs/react'
import { useState } from 'react'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Input } from '@/Components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { toast } from 'sonner'
import { Inbox, UserPlus, XCircle } from 'lucide-react'

export default function InboundTab({ inbound }) {
  const { data: rows, ...pagination } = inbound
  const [assignTarget, setAssignTarget] = useState(null)
  const [orgId, setOrgId] = useState('')
  const [leadId, setLeadId] = useState('')

  const openAssign = (row) => {
    setAssignTarget(row)
    setOrgId(row.candidate_orgs[0]?.id ?? '')
    setLeadId('')
  }

  const submitAssign = () => {
    if (!orgId) { toast.error('Choose an organization.'); return }
    router.post(route('admin.whatsapp-inbound.assign', assignTarget.id), {
      organization_id: orgId,
      lead_id: leadId || null,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => { toast.success('Message assigned.'); setAssignTarget(null) },
      onError: () => toast.error('Could not assign this message.'),
    })
  }

  const ignore = (row) => {
    router.post(route('admin.whatsapp-inbound.ignore', row.id), {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => toast.success('Message ignored.'),
    })
  }

  return (
    <>
      <PageHeader
        title="Unassigned Inbound Messages"
        description="Messages the pooled number received that couldn't be matched to exactly one tenant"
      />

      {rows.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing to review" description="All inbound WhatsApp messages have been matched to a tenant." />
      ) : (
        <div className="space-y-2">
          {rows.map(row => (
            <div key={row.id} className="glass-card rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12.5px] text-slate-400 mb-1">
                  <span className="font-mono">{row.from_number}</span>
                  <span>·</span>
                  <span>{row.created_at}</span>
                  {row.candidate_orgs.length > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-amber-600">{row.candidate_orgs.length} possible matches</span>
                    </>
                  )}
                </div>
                <p className="text-[13.5px] text-slate-800 truncate">{row.body || <em className="text-slate-400">[{row.message_type}]</em>}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openAssign(row)}
                  className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold text-violet-700 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
                  <UserPlus size={13} /> Assign
                </button>
                <button onClick={() => ignore(row)}
                  className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                  <XCircle size={13} /> Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Assign message</DialogTitle>
          </DialogHeader>
          {assignTarget && (
            <div className="py-2 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-600">Organization ID <span className="text-red-400">*</span></label>
                <Input value={orgId} onChange={e => setOrgId(e.target.value)} placeholder="e.g. 4" className="h-9 text-[13px]" />
                {assignTarget.candidate_orgs.length > 0 && (
                  <p className="text-[11.5px] text-slate-400">
                    Candidates: {assignTarget.candidate_orgs.map(o => `${o.name} (#${o.id})`).join(', ')}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-600">Lead ID (optional)</label>
                <Input value={leadId} onChange={e => setLeadId(e.target.value)} placeholder="Leave blank if unknown" className="h-9 text-[13px]" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button type="button" onClick={() => setAssignTarget(null)}
              className="h-8 px-4 text-[12.5px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={submitAssign}
              className="h-8 px-4 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              Assign
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
