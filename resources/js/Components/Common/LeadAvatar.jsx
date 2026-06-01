import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar'
import { cn } from '@/lib/utils'

const avatarColors = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-500',
  'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500',
]

export default function LeadAvatar({ name, url, size = 'default' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const colorIndex = name ? name.charCodeAt(0) % avatarColors.length : 0

  const sizeClass = {
    xs:  'h-6 w-6 text-[10px]',
    sm:  'h-7 w-7 text-xs',
    default: 'h-9 w-9 text-sm',
    lg:  'h-11 w-11 text-base',
    xl:  'h-14 w-14 text-lg',
  }[size] ?? 'h-9 w-9 text-sm'

  return (
    <Avatar className={sizeClass}>
      {url && <AvatarImage src={url} alt={name} />}
      <AvatarFallback className={cn(avatarColors[colorIndex], 'text-white font-semibold')}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
