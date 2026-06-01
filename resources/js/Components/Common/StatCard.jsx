import { Card, CardContent } from '@/Components/ui/card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const colors = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-green-50 text-green-600',
  amber:  'bg-amber-50 text-amber-600',
  red:    'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  teal:   'bg-teal-50 text-teal-600',
}

export default function StatCard({ title, value, change, icon: Icon, color = 'blue', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1.5">{value ?? '—'}</p>
              {change != null && (
                <p className={cn('text-xs mt-1 font-medium', change >= 0 ? 'text-green-600' : 'text-red-500')}>
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
                </p>
              )}
            </div>
            <div className={cn('p-2.5 rounded-xl shrink-0', colors[color] ?? colors.blue)}>
              <Icon size={20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
