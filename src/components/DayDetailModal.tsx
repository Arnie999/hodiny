import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Clock, X, Plus, Save, Wine, Minus } from 'lucide-react'
import type { WorkDay, TimeEntry, EntryType } from '../types'
import { calculateWorkDay, formatMinutes, generateEntryId } from '../utils'
import { EntryList } from './EntryList'

interface Props {
  date: Date
  workDay: WorkDay | null
  isOpen: boolean
  onClose: () => void
  onSave: (workDay: WorkDay) => Promise<void>
  userId: string
}

export function DayDetailModal({ date, workDay, isOpen, onClose, onSave, userId }: Props) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [drinkCount, setDrinkCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [newType, setNewType] = useState<EntryType>('clock_in')
  const [newTime, setNewTime] = useState('08:00')

  useEffect(() => {
    if (isOpen) {
      setEntries(workDay?.entries ?? [])
      setDrinkCount(workDay?.drinkCount ?? 0)
    }
  }, [isOpen, workDay])

  if (!isOpen) return null

  const summary =
    entries.length > 0 || drinkCount > 0
      ? calculateWorkDay({ id: '', userId: '', entries, drinkCount })
      : null
  const dateId = format(date, 'yyyy-MM-dd')

  const handleAdd = () => {
    const [h, m] = newTime.split(':').map(Number)
    const ts = new Date(date)
    ts.setHours(h, m, 0, 0)
    setEntries([...entries, { id: generateEntryId(), timestamp: ts, type: newType }])
  }

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ id: dateId, userId, entries, drinkCount })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">
              {format(date, 'EEEE', { locale: cs })}
            </h2>
            <p className="text-sm text-neutral-500">
              {format(date, 'd. MMMM yyyy', { locale: cs })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {summary && (summary.totalWorkMinutes > 0 || summary.drinkCount > 0) && (
            <div className="bg-amber-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Souhrn</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Odpracováno:</span>
                  <span className="ml-2 font-bold text-neutral-800">
                    {formatMinutes(summary.netWorkMinutes)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600">Přestávky:</span>
                  <span className="ml-2 font-bold text-neutral-800">
                    {formatMinutes(summary.totalBreakMinutes)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600">Drinky:</span>
                  <span className="ml-2 font-bold text-neutral-800">
                    {summary.drinkCount} ks
                  </span>
                </div>
              </div>
            </div>
          )}

          <EntryList entries={entries} onDeleteEntry={handleDelete} showDelete />

          <div className="mt-6 p-4 bg-rose-50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Wine className="w-5 h-5 text-rose-600" />
              <h4 className="font-medium text-neutral-800">Prodej Maria drinků</h4>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrinkCount((c) => Math.max(0, c - 1))}
                className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                title="Odebrat"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={0}
                value={drinkCount}
                onChange={(e) => setDrinkCount(Math.max(0, Number(e.target.value) || 0))}
                className="w-20 text-center px-3 py-2 rounded-lg border border-neutral-200 bg-white font-bold text-lg"
              />
              <button
                onClick={() => setDrinkCount((c) => c + 1)}
                className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                title="Přidat"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-neutral-500">ks</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
            <h4 className="font-medium text-neutral-800 mb-3">Přidat záznam</h4>
            <div className="flex flex-wrap gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as EntryType)}
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-neutral-200 bg-white"
              >
                <option value="clock_in">Příchod</option>
                <option value="break_start">Začátek přestávky</option>
                <option value="break_end">Konec přestávky</option>
                <option value="clock_out">Odchod</option>
              </select>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-200 bg-white"
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? (
              'Ukládám...'
            ) : (
              <>
                <Save className="w-4 h-4" />
                Uložit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
