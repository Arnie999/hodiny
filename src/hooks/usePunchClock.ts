import { useCallback } from 'react'
import { useTodayWorkDay } from './useWorkDay'
import { useAppStore } from '../store'
import { getStatus, generateEntryId } from '../utils'
import type { EntryType } from '../types'

export function usePunchClock(userId: string | undefined) {
  const { setIsPunching } = useAppStore()
  const { workDay, isLoading, error, addEntry, isSaving } = useTodayWorkDay(userId)

  const entries = workDay?.entries ?? []
  const status = getStatus(entries)

  const punch = useCallback(
    async (type: EntryType) => {
      if (!userId) return
      setIsPunching(true)
      try {
        const entry = {
          id: generateEntryId(),
          timestamp: new Date(),
          type,
        }
        await addEntry(entry)
      } finally {
        setIsPunching(false)
      }
    },
    [userId, addEntry, setIsPunching],
  )

  const clockIn = useCallback(() => punch('clock_in'), [punch])
  const startBreak = useCallback(() => punch('break_start'), [punch])
  const endBreak = useCallback(() => punch('break_end'), [punch])
  const clockOut = useCallback(() => punch('clock_out'), [punch])

  return {
    status,
    entries,
    isLoading,
    isSaving,
    error,
    punch,
    clockIn,
    startBreak,
    endBreak,
    clockOut,
  }
}
