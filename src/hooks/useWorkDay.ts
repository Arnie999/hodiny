import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { format } from 'date-fns'
import { startOfMonth, endOfMonth } from 'date-fns'
import { db } from '../firebase'
import type { WorkDay, WorkDayFirestore, TimeEntry } from '../types'
import { formatDateId } from '../utils'

function nonNegativeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0
}

function nonNegativeInteger(value: unknown): number {
  return Math.floor(nonNegativeNumber(value))
}

function fromFirestore(data: WorkDayFirestore): WorkDay {
  return {
    ...data,
    entries: data.entries.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    })),
    drinkCount: nonNegativeInteger(data.drinkCount),
    reviewCount: nonNegativeInteger(data.reviewCount),
    tipAmount: nonNegativeNumber(data.tipAmount),
  }
}

function toFirestore(workDay: WorkDay): WorkDayFirestore {
  return {
    id: workDay.id,
    userId: workDay.userId,
    entries: workDay.entries.map((e) => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    })),
    drinkCount: nonNegativeInteger(workDay.drinkCount),
    reviewCount: nonNegativeInteger(workDay.reviewCount),
    tipAmount: nonNegativeNumber(workDay.tipAmount),
    ...(workDay.manualOverride ? { manualOverride: workDay.manualOverride } : {}),
  }
}

export function useWorkDayQuery(userId: string | undefined, date: Date) {
  const dateId = formatDateId(date)
  return useQuery({
    queryKey: ['workDay', userId, dateId],
    queryFn: async () => {
      if (!userId) return null
      const docRef = doc(db, 'users', userId, 'workDays', dateId)
      const snap = await getDoc(docRef)
      return snap.exists() ? fromFirestore(snap.data() as WorkDayFirestore) : null
    },
    enabled: !!userId,
  })
}

export function useMonthWorkDays(userId: string | undefined, month: Date) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const startId = formatDateId(start)
  const endId = formatDateId(end)

  return useQuery({
    queryKey: ['workDays', userId, format(month, 'yyyy-MM')],
    queryFn: async () => {
      if (!userId) return []
      const col = collection(db, 'users', userId, 'workDays')
      const q = query(col, where('id', '>=', startId), where('id', '<=', endId))
      const snap = await getDocs(q)
      return snap.docs.map((d) => fromFirestore(d.data() as WorkDayFirestore))
    },
    enabled: !!userId,
  })
}

export function useSaveWorkDay(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workDay: WorkDay) => {
      if (!userId) throw new Error('Uživatel není přihlášen.')
      const docRef = doc(db, 'users', userId, 'workDays', workDay.id)
      await setDoc(docRef, toFirestore(workDay))
      return workDay
    },
    onSuccess: (workDay) => {
      queryClient.invalidateQueries({ queryKey: ['workDay', userId, workDay.id] })
      const monthKey = workDay.id.substring(0, 7)
      queryClient.invalidateQueries({ queryKey: ['workDays', userId, monthKey] })
    },
  })
}

export function useTodayWorkDay(userId: string | undefined) {
  const today = new Date()
  const dateId = formatDateId(today)
  const dayQuery = useWorkDayQuery(userId, today)
  const saveMutation = useSaveWorkDay(userId)

  const addEntry = async (entry: TimeEntry) => {
    const existing = dayQuery.data
    const workDay: WorkDay = existing
      ? { ...existing, entries: [...existing.entries, entry] }
      : {
          id: dateId,
          userId: userId!,
          entries: [entry],
          drinkCount: 0,
          reviewCount: 0,
          tipAmount: 0,
        }
    await saveMutation.mutateAsync(workDay)
  }

  const removeEntry = async (entryId: string) => {
    const existing = dayQuery.data
    if (!existing) return
    const workDay: WorkDay = {
      ...existing,
      entries: existing.entries.filter((e) => e.id !== entryId),
    }
    await saveMutation.mutateAsync(workDay)
  }

  const updateEntry = async (entryId: string, updates: Partial<TimeEntry>) => {
    const existing = dayQuery.data
    if (!existing) return
    const workDay: WorkDay = {
      ...existing,
      entries: existing.entries.map((e) =>
        e.id === entryId ? { ...e, ...updates } : e,
      ),
    }
    await saveMutation.mutateAsync(workDay)
  }

  return {
    workDay: dayQuery.data,
    isLoading: dayQuery.isLoading,
    error: dayQuery.error,
    addEntry,
    removeEntry,
    updateEntry,
    isSaving: saveMutation.isPending,
  }
}
