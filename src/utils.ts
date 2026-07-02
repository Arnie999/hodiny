import { format, getDay, differenceInMinutes, isToday as isTodayFn } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { TimeEntry, WorkDay, WorkDaySummary, MonthSummary, WorkStatus } from './types'

export function getStatus(entries: TimeEntry[]): WorkStatus {
  if (entries.length === 0) return 'not_working'
  switch (entries[entries.length - 1].type) {
    case 'clock_in':
    case 'break_end':
      return 'working'
    case 'break_start':
      return 'on_break'
    case 'clock_out':
      return 'not_working'
    default:
      return 'not_working'
  }
}

export function getWorkMinutes(entries: TimeEntry[]): number {
  if (entries.length === 0) return 0
  let total = 0
  let start: Date | null = null
  const sorted = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  for (const entry of sorted) {
    if (entry.type === 'clock_in' || entry.type === 'break_end') {
      start = entry.timestamp
    } else if ((entry.type === 'break_start' || entry.type === 'clock_out') && start) {
      total += differenceInMinutes(entry.timestamp, start)
      start = null
    }
  }
  if (start) {
    total += differenceInMinutes(new Date(), start)
  }
  return total
}

export function getBreakMinutes(entries: TimeEntry[]): number {
  if (entries.length === 0) return 0
  let total = 0
  let start: Date | null = null
  const sorted = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  for (const entry of sorted) {
    if (entry.type === 'break_start') {
      start = entry.timestamp
    } else if (entry.type === 'break_end' && start) {
      total += differenceInMinutes(entry.timestamp, start)
      start = null
    }
  }
  if (start) {
    total += differenceInMinutes(new Date(), start)
  }
  return total
}

function isComplete(entries: TimeEntry[]): boolean {
  const hasClockIn = entries.some(e => e.type === 'clock_in')
  const hasClockOut = entries.some(e => e.type === 'clock_out')
  return hasClockIn && hasClockOut
}

export function calculateWorkDay(workDay: WorkDay): WorkDaySummary {
  const drinkCount = workDay.drinkCount ?? 0
  if (workDay.manualOverride) {
    return {
      totalWorkMinutes: workDay.manualOverride.totalMinutes,
      totalBreakMinutes: 0,
      netWorkMinutes: workDay.manualOverride.totalMinutes,
      isComplete: true,
      drinkCount,
    }
  }
  const work = getWorkMinutes(workDay.entries)
  const breaks = getBreakMinutes(workDay.entries)
  return {
    totalWorkMinutes: work,
    totalBreakMinutes: breaks,
    netWorkMinutes: work,
    isComplete: isComplete(workDay.entries),
    drinkCount,
  }
}

export function calculateMonthSummary(workDays: WorkDay[]): MonthSummary {
  let totalWork = 0
  let totalBreaks = 0
  let daysWorked = 0
  let totalDrinks = 0
  for (const wd of workDays) {
    const s = calculateWorkDay(wd)
    totalDrinks += s.drinkCount
    if (s.totalWorkMinutes > 0) {
      totalWork += s.netWorkMinutes
      totalBreaks += s.totalBreakMinutes
      daysWorked++
    }
  }
  return {
    totalWorkMinutes: totalWork,
    totalBreakMinutes: totalBreaks,
    netWorkMinutes: totalWork,
    daysWorked,
    averageMinutesPerDay: daysWorked > 0 ? Math.round(totalWork / daysWorked) : 0,
    totalDrinks,
  }
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1).replace('.', ',')} hod.`
}

export function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function isSunday(date: Date): boolean {
  return getDay(date) === 0
}

export function formatDate(date: Date): string {
  return format(date, 'dd.MM.yyyy', { locale: cs })
}

export function formatDateId(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function isToday(date: Date): boolean {
  return isTodayFn(date)
}

export { cs }
