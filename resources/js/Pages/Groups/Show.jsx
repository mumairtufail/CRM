import { Head, Link, router } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import StatusBadge from '@/Components/Common/StatusBadge'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/Components/ui/dialog'
import { Checkbox } from '@/Components/ui/checkbox'
import {
  ChevronLeft, UsersRound, Plus, Trash2, Search, UserMinus,
} from 'lucide-react'
import { toast } from 'sonner'

function AddLeadsModal({ open, onClose, groupId }) {
  const [search, setSearch]       = useState('')
  const [results, setResults]     = useState([])
  const [selected, setSelected]   = useState([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding]       = useState(false)
  const debounceRef               = useRef(null)

  const fetchLeads = async (q) => {
    setSearching(true)
    try {
      const res  = await fetch(`/leads/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setResults(Array.isArray(json) ? json : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (open) fetchLeads('')
    else { setSearch(''); setResults([]); setSelected([]) }
  }, [open])

  const handleSearch = (q) => {
    setSearch(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchLeads(q), 300)
  }

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleAdd = () => {
    if (!selected.length) return
    setAdding(true)
    router.post(`/groups/${groupId}/leads`, { lead_ids: selected }, {
      onSuccess: () => {
        toast.success(`${selected.length} lead${selected.length !== 1 ? 's' : ''} added`)
        setSelected([])
        setResults([])
        setSearch('')
        onClose()
      },
      onError: () => toast.error('Failed to add leads'),
      onFinish: () => setAdding(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Leads to Group</DialogTitle>
          <DialogDescription className="text-xs">
            Search for leads and select them to add to this group.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, email, company…"
            className="h-8 pl-8 text-[13px]"
          />
        </div>

        {selected.length > 0 && (
          <p className="text-[11px] text-brand-600 font-semibold">
            {selected.length} lead{selected.length !== 1 ? 's' : ''} selected
          </p>
        )}

        <div className="max-h-64 overflow-y-auto space-y-1 -mx-1">
          {searching && (
            <p className="text-center text-xs text-slate-400 py-4">Searching…</p>
          )}
          {!searching && results.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-4">No leads found.</p>
          )}
          {!searching && results.map(lead => (
            <label
              key={lead.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer group"
            >
              <Checkbox
                checked={selected.includes(lead.id)}
                onCheckedChange={() => toggleSelect(lead.id)}
                className="shrink-0"
              />
              <LeadAvatar name={lead.full_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-slate-800 truncate">{lead.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{lead.primary_email || lead.company || '—'}</p>
              </div>
              <StatusBadge status={lead.status} />
            </label>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selected.length || adding}
            className="h-8 text-xs"
            onClick={handleAdd}
          >
            {adding ? 'Adding…' : `Add ${selected.length || ''} Leads`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function GroupShow({ group, members }) {
  const [addOpen, setAddOpen]       = useState(false)
  const [removing, setRemoving]     = useState(null)

  const { data: rows, ...pagination } = members

  const handleRemove = (leadId) => {
    setRemoving(leadId)
    router.delete(`/groups/${group.id}/leads`, { data: { lead_ids: [leadId] } }, {
      preserveState: true,
      onSuccess: () => toast.success('Lead removed from group'),
      onError:   () => toast.error('Failed to remove lead'),
      onFinish:  () => setRemoving(null),
    })
  }

  const handlePageChange = (page) => {
    router.get(`/groups/${group.id}`, { page }, { preserveState: true })
  }

  return (
    <>
      <Head title={group.name} />
      <AppLayout title="Groups">
        <div className="max-w-4xl">

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <Link href="/groups">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200">
                  <ChevronLeft size={13} /> Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: group.color + '22', border: `1.5px solid ${group.color}55` }}
                >
                  <UsersRound size={18} style={{ color: group.color }} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{group.name}</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {group.leads_count} lead{group.leads_count !== 1 ? 's' : ''}
                    {group.description && ` · ${group.description}`}
                  </p>
                </div>
              </div>
            </div>

            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus size={13} /> Add Leads
            </Button>
          </div>

          {/* Members table */}
          {rows.length ? (
            <div className="form-card overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lead</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Company</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-4 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m, i) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/60 transition-colors"
                      style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <LeadAvatar name={m.full_name} size="sm" />
                          <div className="min-w-0">
                            <Link
                              href={`/leads/${m.id}`}
                              className="font-medium text-slate-800 hover:text-brand-600 truncate block transition-colors"
                            >
                              {m.full_name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-slate-500 truncate max-w-[130px]">
                        {m.company || '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-4 py-2.5 hidden sm:table-cell text-slate-400 truncate max-w-[180px]">
                        {m.primary_email || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => handleRemove(m.id)}
                          disabled={removing === m.id}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove from group"
                        >
                          {removing === m.id
                            ? <span className="text-[10px]">…</span>
                            : <UserMinus size={13} />
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {(pagination.prev_page_url || pagination.next_page_url) && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      disabled={!pagination.prev_page_url}
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      disabled={!pagination.next_page_url}
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={UsersRound}
              title="No leads in this group"
              description="Add leads to this group to use it as a campaign recipient list."
              action={
                <Button size="sm" className="gap-1.5 h-9" onClick={() => setAddOpen(true)}>
                  <Plus size={14} /> Add Leads
                </Button>
              }
            />
          )}
        </div>

        <AddLeadsModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          groupId={group.id}
        />
      </AppLayout>
    </>
  )
}
