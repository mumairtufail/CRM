import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/Components/ui/input'
import { cn } from '@/lib/utils'

export default function SearchInput({ value, onChange, placeholder = 'Search...', className, debounce = 300 }) {
  const [local, setLocal] = useState(value ?? '')

  useEffect(() => {
    const t = setTimeout(() => onChange?.(local), debounce)
    return () => clearTimeout(t)
  }, [local])

  useEffect(() => {
    setLocal(value ?? '')
  }, [value])

  return (
    <div className={cn('relative', className)}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <Input
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-9 text-sm bg-white"
      />
      {local && (
        <button
          onClick={() => { setLocal(''); onChange?.('') }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
