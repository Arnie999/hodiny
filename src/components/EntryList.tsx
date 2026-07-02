import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Play, LogOut, Coffee, Trash2 } from 'lucide-react'
import type { TimeEntry, EntryType } from '../types'

const entryConfig: Record<EntryType, {
  label: string
  icon: typeof Play
  color: string
  bgColor: string
}> = {
  clock_in: { label: 'Příchod', icon: Play, color: 'text-green-600', bgColor: 'bg-green-100' },
  break_start: { label: 'Začátek přestávky', icon: Coffee, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  break_end: { label: 'Konec přestávky', icon: Play, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  clock_out: { label: 'Odchod', icon: LogOut, color: 'text-red-600', bgColor: 'bg-red-100' },
}

interface Props {
  entries: TimeEntry[]
  onDeleteEntry?: (id: string) => void
  showDelete?: boolean
}

export function EntryList({ entries, onDeleteEntry, showDelete = false }: Props) {
  const sorted = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>Zatím žádné záznamy</p>
        <p className="text-sm mt-1">Klikni na tlačítko pro příchod</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Dnešní záznamy</h3>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-neutral-200" />
        <div className="space-y-3">
          {sorted.map((entry) => {
            const config = entryConfig[entry.type]
            const Icon = config.icon
            return (
              <div key={entry.id} className="relative flex items-center gap-4 pl-2">
                <div className={`relative z-10 p-2 rounded-full ${config.bgColor} ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-neutral-100">
                  <div>
                    <div className={`font-medium ${config.color}`}>{config.label}</div>
                    <div className="text-sm text-neutral-500">
                      {format(entry.timestamp, 'HH:mm:ss', { locale: cs })}
                    </div>
                  </div>
                  {showDelete && onDeleteEntry && (
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Smazat záznam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
