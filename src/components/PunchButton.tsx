import { Play, LogOut, Coffee, Loader2 } from 'lucide-react'
import type { WorkStatus, EntryType } from '../types'

const statusActions = {
  not_working: {
    primaryAction: 'clock_in' as EntryType,
    primaryLabel: 'Příchod',
    primaryIcon: Play,
    primaryColor: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
  },
  working: {
    primaryAction: 'clock_out' as EntryType,
    primaryLabel: 'Odchod',
    primaryIcon: LogOut,
    primaryColor: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
    secondaryAction: 'break_start' as EntryType,
    secondaryLabel: 'Přestávka',
    secondaryIcon: Coffee,
    secondaryColor: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700',
  },
  on_break: {
    primaryAction: 'break_end' as EntryType,
    primaryLabel: 'Pokračovat',
    primaryIcon: Play,
    primaryColor: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
  },
} as const

interface Props {
  status: WorkStatus
  isLoading: boolean
  onPunch: (type: EntryType) => void
}

export function PunchButton({ status, isLoading, onPunch }: Props) {
  const config = statusActions[status]
  const PrimaryIcon = config.primaryIcon
  const SecondaryIcon = 'secondaryIcon' in config ? config.secondaryIcon : null

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => onPunch(config.primaryAction)}
        disabled={isLoading}
        className={`
          w-32 h-32 sm:w-40 sm:h-40 rounded-full
          flex flex-col items-center justify-center gap-2
          text-white font-bold text-lg
          shadow-lg hover:shadow-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${config.primaryColor}
        `}
      >
        {isLoading ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : (
          <>
            <PrimaryIcon className="w-10 h-10" />
            <span className="text-sm sm:text-base">{config.primaryLabel}</span>
          </>
        )}
      </button>
      {'secondaryAction' in config && SecondaryIcon && (
        <button
          onClick={() => onPunch(config.secondaryAction!)}
          disabled={isLoading}
          className={`
            px-6 py-3 rounded-xl
            flex items-center gap-2
            text-white font-medium
            shadow-md hover:shadow-lg
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${'secondaryColor' in config ? config.secondaryColor : ''}
          `}
        >
          <SecondaryIcon className="w-5 h-5" />
          <span>{'secondaryLabel' in config ? config.secondaryLabel : ''}</span>
        </button>
      )}
    </div>
  )
}
