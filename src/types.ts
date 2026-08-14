export type EntryType = 'clock_in' | 'clock_out' | 'break_start' | 'break_end'

export interface TimeEntry {
  id: string
  timestamp: Date
  type: EntryType
}

export interface WorkDay {
  id: string
  userId: string
  entries: TimeEntry[]
  drinkCount?: number
  reviewCount?: number
  tipAmount?: number
  manualOverride?: {
    totalMinutes: number
  }
}

export interface WorkDayFirestore {
  id: string
  userId: string
  entries: {
    id: string
    timestamp: string
    type: EntryType
  }[]
  drinkCount?: number
  reviewCount?: number
  tipAmount?: number
  manualOverride?: {
    totalMinutes: number
  }
}

export interface WorkDaySummary {
  totalWorkMinutes: number
  totalBreakMinutes: number
  netWorkMinutes: number
  isComplete: boolean
  drinkCount: number
  reviewCount: number
  tipAmount: number
}

export interface MonthSummary {
  totalWorkMinutes: number
  totalBreakMinutes: number
  netWorkMinutes: number
  daysWorked: number
  averageMinutesPerDay: number
  totalDrinks: number
  totalReviews: number
  totalTips: number
}

export type WorkStatus = 'not_working' | 'working' | 'on_break'
