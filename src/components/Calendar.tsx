import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns'
import { cs } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Coins, Star, Wine } from 'lucide-react'
import type { WorkDay } from '../types'
import { calculateWorkDay, calculateMonthSummary, formatCurrency, formatMinutes, isSunday, isToday } from '../utils'

interface Props {
  currentMonth: Date
  workDays: WorkDay[]
  onDateSelect?: (date: Date) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export function Calendar({ currentMonth, workDays, onDateSelect, onPreviousMonth, onNextMonth }: Props) {
  const start = startOfMonth(currentMonth)
  const end = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start, end })
  const startDayOfWeek = getDay(start)
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
  const dayLabels = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

  const findWorkDay = (date: Date) => {
    const id = format(date, 'yyyy-MM-dd')
    return workDays.find((wd) => wd.id === id)
  }

  const monthSummary = calculateMonthSummary(workDays)

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPreviousMonth}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Předchozí měsíc"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-semibold text-neutral-800">
          {format(currentMonth, 'LLLL yyyy', { locale: cs })}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Další měsíc"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {dayLabels.map((label, i) => (
          <div
            key={label}
            className={`text-center text-xs sm:text-sm font-medium py-2 ${i === 6 ? 'text-red-600' : 'text-neutral-600'}`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`offset-${i}`} className="min-h-20 sm:aspect-square" />
        ))}
        {days.map((day) => {
          const wd = findWorkDay(day)
          const sunday = isSunday(day)
          const today = isToday(day)
          const summary = wd ? calculateWorkDay(wd) : null
          const hasWork = summary && summary.totalWorkMinutes > 0
          const complete = summary?.isComplete ?? false
          const drinks = summary?.drinkCount ?? 0
          const reviews = summary?.reviewCount ?? 0
          const tips = summary?.tipAmount ?? 0
          const hasBusinessMetrics = drinks > 0 || reviews > 0 || tips > 0

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect?.(day)}
              className={`
                min-h-20 sm:aspect-square rounded-xl p-1 sm:p-2 text-xs sm:text-sm font-medium
                transition-all hover:scale-105 cursor-pointer
                ${today ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                ${sunday ? 'text-red-600 bg-red-50' : 'text-neutral-800'}
                ${hasWork && complete ? 'bg-green-100 hover:bg-green-200' : ''}
                ${hasWork && !complete ? 'bg-amber-100 hover:bg-amber-200' : ''}
                ${!hasWork && !sunday && !hasBusinessMetrics ? 'bg-neutral-50 hover:bg-neutral-100' : ''}
                ${!hasWork && !sunday && hasBusinessMetrics ? 'bg-violet-50 hover:bg-violet-100' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{format(day, 'd')}</span>
                {hasWork && summary && (
                  <span className="text-[10px] sm:text-xs mt-0.5 opacity-75">
                    {formatMinutes(summary.netWorkMinutes)}
                  </span>
                )}
                {drinks > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-xs mt-0.5 text-rose-600 font-semibold">
                    <Wine className="w-3 h-3" />
                    {drinks}
                  </span>
                )}
                {reviews > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-xs mt-0.5 text-amber-600 font-semibold">
                    <Star className="w-3 h-3" />
                    {reviews}
                  </span>
                )}
                {tips > 0 && (
                  <span
                    className="flex items-center gap-0.5 text-[10px] sm:text-xs mt-0.5 text-emerald-700 font-semibold"
                    title={`Dýško: ${formatCurrency(tips)}`}
                  >
                    <Coins className="w-3 h-3" />
                    {tips.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-neutral-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          <span>Kompletní</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          <span>Rozpracovaný</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
          <span>Neděle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-white ring-2 ring-blue-500" />
          <span>Dnes</span>
        </div>
        <div className="flex items-center gap-1 text-rose-600">
          <Wine className="w-3 h-3" />
          <span>Likéry Maria</span>
        </div>
        <div className="flex items-center gap-1 text-amber-600">
          <Star className="w-3 h-3" />
          <span>Recenze</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-700">
          <Coins className="w-3 h-3" />
          <span>Dýško</span>
        </div>
      </div>

      {(monthSummary.totalDrinks > 0 || monthSummary.totalReviews > 0 || monthSummary.totalTips > 0) && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 rounded-xl text-rose-700 text-sm font-medium">
            <Wine className="w-4 h-4 shrink-0" />
            Likéry Maria: <span className="font-bold">{monthSummary.totalDrinks} ks</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 rounded-xl text-amber-700 text-sm font-medium">
            <Star className="w-4 h-4 shrink-0" />
            Recenze: <span className="font-bold">{monthSummary.totalReviews}</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 text-sm font-medium">
            <Coins className="w-4 h-4 shrink-0" />
            Dýško: <span className="font-bold">{formatCurrency(monthSummary.totalTips)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
