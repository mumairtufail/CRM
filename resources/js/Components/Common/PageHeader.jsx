export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-[18px] font-bold text-slate-800 tracking-tight leading-none">{title}</h2>
        {description && (
          <p className="text-slate-500 mt-1.5 text-[13px]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  )
}
