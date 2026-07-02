import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2, LogOut } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { usePunchClock } from './hooks/usePunchClock'
import { useMonthWorkDays, useWorkDayQuery, useSaveWorkDay } from './hooks/useWorkDay'
import { useAppStore } from './store'
import { getWorkMinutes, getBreakMinutes } from './utils'
import type { EntryType } from './types'
import { LoginPage } from './components/LoginPage'
import { StatusCard } from './components/StatusCard'
import { PunchButton } from './components/PunchButton'
import { EntryList } from './components/EntryList'
import { Calendar } from './components/Calendar'
import { DayDetailModal } from './components/DayDetailModal'
import { ExportButtons } from './components/ExportButtons'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 2,
    },
  },
})

function MainApp() {
  const {
    user,
    isLoading: authLoading,
    isSigningIn,
    error: authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  } = useAuth()

  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    selectedDate,
    isDetailModalOpen,
    openDetailModal,
    closeDetailModal,
  } = useAppStore()

  const {
    status,
    entries,
    isLoading: dayLoading,
    isSaving,
    clockIn,
    startBreak,
    endBreak,
    clockOut,
  } = usePunchClock(user?.uid)

  const { data: monthWorkDays = [], isLoading: monthLoading } = useMonthWorkDays(user?.uid, currentMonth)
  const { data: selectedWorkDay } = useWorkDayQuery(user?.uid, selectedDate ?? new Date())
  const saveWorkDay = useSaveWorkDay(user?.uid)

  const workMinutes = getWorkMinutes(entries)
  const breakMinutes = getBreakMinutes(entries)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-neutral-600">Načítám...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginPage
        onSignIn={signInWithGoogle}
        isSigningIn={isSigningIn}
        error={authError}
        onEmailSignIn={signInWithEmail}
        onEmailSignUp={signUpWithEmail}
      />
    )
  }

  const handlePunch = (type: EntryType) => {
    switch (type) {
      case 'clock_in': clockIn(); break
      case 'break_start': startBreak(); break
      case 'break_end': endBreak(); break
      case 'clock_out': clockOut(); break
    }
  }

  return (
    <div className="min-h-screen bg-amber-50/30">
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Hodiny</h1>
              <p className="text-neutral-600 text-sm mt-1">Sledování pracovní doby</p>
            </div>
            <div className="flex items-center gap-4">
              <ExportButtons workDays={monthWorkDays} />
              <div className="flex items-center gap-2 pl-4 border-l border-neutral-200">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-neutral-600 hidden sm:inline">
                  {user.displayName?.split(' ')[0]}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Odhlásit se"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <StatusCard status={status} workMinutes={workMinutes} breakMinutes={breakMinutes} />
              <div className="flex justify-center py-4">
                <PunchButton status={status} isLoading={dayLoading || isSaving} onPunch={handlePunch} />
              </div>
            </div>
            <div className="border-t lg:border-t-0 lg:border-l border-neutral-200 pt-6 lg:pt-0 lg:pl-8">
              <EntryList entries={entries} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          {monthLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <Calendar
              currentMonth={currentMonth}
              workDays={monthWorkDays}
              onDateSelect={openDetailModal}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
            />
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-neutral-600">
          <p>Hodiny Tracker &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>

      {selectedDate && user && (
        <DayDetailModal
          date={selectedDate}
          workDay={selectedWorkDay ?? null}
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          onSave={async (wd) => {
            await saveWorkDay.mutateAsync(wd)
          }}
          userId={user.uid}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MainApp />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
