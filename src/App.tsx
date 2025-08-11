import { useEffect, useMemo, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { Settings2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Gauge } from '@suyalcinkaya/gauge'

type Period = 'monthly' | 'yearly'

type Settings = {
  currency: string
  period: Period
  pay: number
  shiftStart: { hour: number; minute: number }
  shiftEnd: { hour: number; minute: number }
}

const COMMON_CURRENCIES = [
  'USD','EUR','GBP','AUD','CAD','JPY','CNY','CHF','SEK','NZD','NOK','DKK','HKD','SGD','INR','BRL','ZAR','MXN','PLN','TRY'
]

function getBusinessDaysInMonth(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let businessDays = 0
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) businessDays += 1
  }
  return businessDays
}

function toSeconds(hours: number, minutes: number): number {
  return hours * 3600 + minutes * 60
}

function App() {
  const [settings, setSettings] = useState<Settings>(() => ({
    currency: 'USD',
    period: 'yearly',
    pay: 120000,
    shiftStart: { hour: 9, minute: 0 },
    shiftEnd: { hour: 17, minute: 0 },
  }))

  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const businessDays = useMemo(() => getBusinessDaysInMonth(now), [now])

  const dailyTotal = useMemo(() => {
    const monthlyPay = settings.period === 'monthly' ? settings.pay : settings.pay / 12
    return monthlyPay / businessDays
  }, [settings.pay, settings.period, businessDays])

  const workdaySeconds = useMemo(() => {
    const start = toSeconds(settings.shiftStart.hour, settings.shiftStart.minute)
    const end = toSeconds(settings.shiftEnd.hour, settings.shiftEnd.minute)
    return Math.max(0, end - start)
  }, [settings.shiftStart, settings.shiftEnd])

  const secondsSinceStart = useMemo(() => {
    const start = new Date(now)
    start.setHours(settings.shiftStart.hour, settings.shiftStart.minute, 0, 0)
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000)
    return Math.max(0, Math.min(diff, workdaySeconds))
  }, [now, settings.shiftStart, workdaySeconds])

  const progressPercent = workdaySeconds === 0 ? 0 : (secondsSinceStart / workdaySeconds) * 100

  const earnedSoFar = useMemo(() => {
    if (workdaySeconds === 0) return 0
    const perSecond = dailyTotal / workdaySeconds
    return perSecond * secondsSinceStart
  }, [dailyTotal, workdaySeconds, secondsSinceStart])

  const formatter = useMemo(() => new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: settings.currency,
    maximumFractionDigits: 2,
  }), [settings.currency])

  useEffect(() => {
    document.title = `${formatter.format(earnedSoFar)}`
  }, [earnedSoFar, formatter])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-12 flex items-center justify-between">
          <h1 className="text-xl font-medium tracking-tight">Salary per Second</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings2 className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>Configure your pay and work hours.</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => setSettings(s => ({ ...s, currency: value }))}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_CURRENCIES.map(code => (
                          <SelectItem key={code} value={code}>{code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Period</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={settings.period === 'monthly' ? 'default' : 'outline'}
                        onClick={() => setSettings(s => ({ ...s, period: 'monthly' }))}
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={settings.period === 'yearly' ? 'default' : 'outline'}
                        onClick={() => setSettings(s => ({ ...s, period: 'yearly' }))}
                      >
                        Yearly
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pay">Pay ({settings.period})</Label>
                    <Input
                      id="pay"
                      type="number"
                      inputMode="decimal"
                      value={settings.pay}
                      onChange={(e) => setSettings(s => ({ ...s, pay: Number(e.target.value || 0) }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Shift start</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={23}
                          value={settings.shiftStart.hour}
                          onChange={(e) => setSettings(s => ({ ...s, shiftStart: { ...s.shiftStart, hour: Math.max(0, Math.min(23, Number(e.target.value || 0))) } }))}
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={settings.shiftStart.minute}
                          onChange={(e) => setSettings(s => ({ ...s, shiftStart: { ...s.shiftStart, minute: Math.max(0, Math.min(59, Number(e.target.value || 0))) } }))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Shift end</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={23}
                          value={settings.shiftEnd.hour}
                          onChange={(e) => setSettings(s => ({ ...s, shiftEnd: { ...s.shiftEnd, hour: Math.max(0, Math.min(23, Number(e.target.value || 0))) } }))}
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={settings.shiftEnd.minute}
                          onChange={(e) => setSettings(s => ({ ...s, shiftEnd: { ...s.shiftEnd, minute: Math.max(0, Math.min(59, Number(e.target.value || 0))) } }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="space-y-6">
          <div className="text-center">
            <div className="text-[56px] font-semibold tracking-tight sm:text-7xl">
              <NumberFlow value={earnedSoFar} format={{ style: 'currency', currency: settings.currency }} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Today’s total: {formatter.format(dailyTotal)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Day progress</span>
              <span>{Math.floor(progressPercent)}%</span>
            </div>
            <div className="flex justify-center">
              <Gauge
                value={Math.round(progressPercent)}
                size={180}
                showAnimation
                primary={{  0: '#FF611B', 50: '#FF611B', 100: '#10b981'}}
                secondary="#e5e7eb"
                aria-label="Day progress gauge"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
