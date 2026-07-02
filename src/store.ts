import { create } from 'zustand'

interface AppState {
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  isDetailModalOpen: boolean
  openDetailModal: (date: Date) => void
  closeDetailModal: () => void
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  isPunching: boolean
  setIsPunching: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  isDetailModalOpen: false,
  openDetailModal: (date) => set({ selectedDate: date, isDetailModalOpen: true }),
  closeDetailModal: () => set({ isDetailModalOpen: false }),
  currentMonth: new Date(),
  setCurrentMonth: (date) => set({ currentMonth: date }),
  goToPreviousMonth: () =>
    set((state) => {
      const d = new Date(state.currentMonth)
      d.setMonth(d.getMonth() - 1)
      return { currentMonth: d }
    }),
  goToNextMonth: () =>
    set((state) => {
      const d = new Date(state.currentMonth)
      d.setMonth(d.getMonth() + 1)
      return { currentMonth: d }
    }),
  isPunching: false,
  setIsPunching: (v) => set({ isPunching: v }),
}))
