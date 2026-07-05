// Compact single-line empty state for glass cards on Dashboard/Reports —
// distinct from EmptyState.jsx (full-page title/description variant used elsewhere).
export default function InlineEmptyState({ icon: Icon, message, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${compact ? 'py-6' : 'py-8'}`}>
      {Icon && <Icon size={compact ? 20 : 22} className="text-slate-200" />}
      <p className="text-[12px] text-slate-400">{message}</p>
    </div>
  )
}
