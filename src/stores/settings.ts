import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Period = 'monthly' | 'yearly'

export type Settings = {
  currency: string
  period: Period
  pay: number
  shiftStart: { hour: number; minute: number }
  shiftEnd: { hour: number; minute: number }
}

type SettingsState = Settings & {
  setCurrency: (currency: string) => void
  setPeriod: (period: Period) => void
  setPay: (pay: number) => void
  setShiftStart: (hour: number, minute: number) => void
  setShiftEnd: (hour: number, minute: number) => void
}

const defaultSettings: Settings = {
  currency: 'USD',
  period: 'yearly',
  pay: 120000,
  shiftStart: { hour: 9, minute: 0 },
  shiftEnd: { hour: 17, minute: 0 },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setCurrency: (currency) => set({ currency }),
      setPeriod: (period) => set({ period }),
      setPay: (pay) => set({ pay }),
      setShiftStart: (hour, minute) => set({ shiftStart: { hour, minute } }),
      setShiftEnd: (hour, minute) => set({ shiftEnd: { hour, minute } }),
    }),
    {
      name: 'sps-settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // If we ever change shape, we can add a migrate function here
    }
  )
)


