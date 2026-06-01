import { Menu } from 'lucide-react'
import { usePage, Link } from '@inertiajs/react'

export default function TopBar({ title, onMenuClick }) {
  const { auth } = usePage().props

  const initial = auth?.user?.name?.charAt(0)?.toUpperCase() ?? 'A'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu size={17} className="text-gray-500" />
        </button>
        {title && (
          <h1 className="font-display font-semibold text-gray-900 text-base">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link href="/profile">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-blue-600 transition-colors">
            {initial}
          </div>
        </Link>
      </div>
    </header>
  )
}
