import { Clock, Coffee, CircleOff } from 'lucide-react'
import type { WorkStatus } from '../types'
import { formatMinutes } from '../utils'

const statusConfig = {
  not_working: {
    label: 'Nepracuješ',
    sublabel: 'Klikni na tlačítko Příchod',
    icon: CircleOff,
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-600',
  },
  working: {
    label: 'Pracuješ',
    sublabel: 'Čas běží…',
    icon: Clock,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  on_break: {
    label: 'Přestávka',
    sublabel: 'Odpočívej si',
    icon: Coffee,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
} as const

interface Props {
  status: WorkStatus
  workMinutes: number
  breakMinutes: number
}

export function StatusCard({ status, workMinutes, breakMinutes }: Props) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`rounded-2xl p-6 ${config.bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${config.textColor} bg-white/50`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${config.textColor}`}>{config.label}</h2>
            <p className="text-neutral-500 text-sm">{config.sublabel}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-neutral-500">Odpracováno</div>
          <div className="text-2xl font-bold text-neutral-800">{formatMinutes(workMinutes)}</div>
          {breakMinutes > 0 && (
            <div className="text-sm text-amber-600">
              Přestávky: {formatMinutes(breakMinutes)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
