import { Link } from '@inertiajs/react'
import { ArrowRight } from 'lucide-react'

export default function SectionHeader({ title, icon: Icon, href, iconColor = 'text-brand-500' }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100/80">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={13} className={iconColor} strokeWidth={2} />}
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{title}</h3>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-[11px] text-brand-500 hover:text-brand-700 font-semibold">
          View all <ArrowRight size={10} />
        </Link>
      )}
    </div>
  )
}
