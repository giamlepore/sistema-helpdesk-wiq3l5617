import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const statusMap: Record<string, { label: string; className: string }> = {
  open: { label: 'Aberto', className: 'badge-status-open' },
  in_progress: { label: 'Em Progresso', className: 'badge-status-in_progress' },
  resolved: { label: 'Resolvido', className: 'badge-status-resolved' },
  closed: { label: 'Fechado', className: 'badge-status-closed' },
}

export const priorityMap: Record<string, { label: string; className: string }> = {
  low: { label: 'Baixa', className: 'badge-priority-low' },
  medium: { label: 'Média', className: 'badge-priority-medium' },
  high: { label: 'Alta', className: 'badge-priority-high' },
  urgent: { label: 'Urgente', className: 'badge-priority-urgent' },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  return (
    <Badge
      variant="outline"
      className={cn(config.className, 'border-transparent font-medium', className)}
    >
      {config.label}
    </Badge>
  )
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const config = priorityMap[priority] || {
    label: priority,
    className: 'bg-gray-100 text-gray-800',
  }
  return (
    <Badge
      variant="outline"
      className={cn(config.className, 'border-transparent font-medium', className)}
    >
      {config.label}
    </Badge>
  )
}
