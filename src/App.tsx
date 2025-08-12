import { useEffect, useMemo, useState } from "react";
import NumberFlow from "@number-flow/react";
import {
  IconSettings2,
  IconSun,
  IconMoon,
  IconBrandGithub,
  IconBrandX,
} from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gauge } from "@suyalcinkaya/gauge";
import { useSettingsStore } from "@/stores/settings";
import { cn } from "@/lib/utils";

type ThemePreference = "system" | "light" | "dark";

const COMMON_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "BRL",
  "AUD",
  "CAD",
  "JPY",
  "CNY",
  "CHF",
  "SEK",
  "NZD",
  "NOK",
  "DKK",
  "HKD",
  "SGD",
  "INR",
  "BRL",
  "ZAR",
  "MXN",
  "PLN",
  "TRY",
];

function getBusinessDaysInMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let businessDays = 0;
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) businessDays += 1;
  }
  return businessDays;
}

function toSeconds(hours: number, minutes: number): number {
  return hours * 3600 + minutes * 60;
}

function App() {
  const {
    currency,
    period,
    pay,
    shiftStart,
    shiftEnd,
    setCurrency,
    setPeriod,
    setPay,
    setShiftStart,
    setShiftEnd,
  } = useSettingsStore();

  const [theme, setTheme] = useState<ThemePreference>(() => {
    try {
      const stored = localStorage.getItem("theme") as ThemePreference | null;
      return stored || "system";
    } catch {
      return "system";
    }
  });

  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const docEl = document.documentElement;
    const apply = (pref: ThemePreference) => {
      if (pref === "light") {
        docEl.classList.remove("dark");
        return;
      }
      if (pref === "dark") {
        docEl.classList.add("dark");
        return;
      }
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      docEl.classList.toggle("dark", isDark);
    };
    try {
      localStorage.setItem("theme", theme);
    } catch {
      void 0;
    }
    apply(theme);
  }, [theme]);

  const businessDays = useMemo(() => getBusinessDaysInMonth(now), [now]);

  const dailyTotal = useMemo(() => {
    const monthlyPay = period === "monthly" ? pay : pay / 12;
    return monthlyPay / businessDays;
  }, [pay, period, businessDays]);

  const workdaySeconds = useMemo(() => {
    const start = toSeconds(shiftStart.hour, shiftStart.minute);
    const end = toSeconds(shiftEnd.hour, shiftEnd.minute);
    return Math.max(0, end - start);
  }, [shiftStart, shiftEnd]);

  const secondsSinceStart = useMemo(() => {
    const start = new Date(now);
    start.setHours(shiftStart.hour, shiftStart.minute, 0, 0);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    return Math.max(0, Math.min(diff, workdaySeconds));
  }, [now, shiftStart, workdaySeconds]);

  const progressPercent =
    workdaySeconds === 0 ? 0 : (secondsSinceStart / workdaySeconds) * 100;

  const earnedSoFar = useMemo(() => {
    if (workdaySeconds === 0) return 0;
    const perSecond = dailyTotal / workdaySeconds;
    return perSecond * secondsSinceStart;
  }, [dailyTotal, workdaySeconds, secondsSinceStart]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency]
  );

  useEffect(() => {
    document.title = `${formatter.format(earnedSoFar)} today (${progressPercent.toFixed(2)}%)`;
  }, [earnedSoFar, formatter, progressPercent]);

  return (
    <div className="grow h-full flex flex-col bg-background text-foreground mx-auto max-w-2xl px-6 py-10">
      <header className="flex-none flex items-center justify-between">
        <h1 className="text-xl font-medium tracking-tight">
          🤑 Salary per Second
        </h1>
        <div className="flex items-center gap-2">
          <div
            className="inline-flex items-center rounded-lg border bg-muted/50 p-0.5"
            role="group"
            aria-label="Theme"
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Light theme"
              aria-pressed={theme === "light"}
              onClick={() => setTheme("light")}
              className={cn(
                theme === "light"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <IconSun className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Dark theme"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
              className={cn(
                theme === "dark"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <IconMoon className="h-5 w-5" />
            </Button>
          </div>

          <span aria-hidden className="mx-1 h-5 w-px bg-border" />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Settings">
                <IconSettings2 className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>
                  Configure your pay and work hours.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={currency}
                      onValueChange={(value) => setCurrency(value)}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_CURRENCIES.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Period</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={period === "monthly" ? "default" : "outline"}
                        onClick={() => setPeriod("monthly")}
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={period === "yearly" ? "default" : "outline"}
                        onClick={() => setPeriod("yearly")}
                      >
                        Yearly
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pay">Pay ({period})</Label>
                    <Input
                      id="pay"
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={pay === 0 ? "" : pay}
                      onChange={(e) => setPay(Number(e.target.value || 0))}
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
                          placeholder="00"
                          value={shiftStart.hour === 0 ? "" : shiftStart.hour}
                          onChange={(e) => {
                            const hour = Math.max(
                              0,
                              Math.min(23, Number(e.target.value || 0))
                            );
                            setShiftStart(hour, shiftStart.minute);
                          }}
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          placeholder="00"
                          value={shiftStart.minute === 0 ? "" : shiftStart.minute}
                          onChange={(e) => {
                            const minute = Math.max(
                              0,
                              Math.min(59, Number(e.target.value || 0))
                            );
                            setShiftStart(shiftStart.hour, minute);
                          }}
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
                          placeholder="00"
                          value={shiftEnd.hour === 0 ? "" : shiftEnd.hour}
                          onChange={(e) => {
                            const hour = Math.max(
                              0,
                              Math.min(23, Number(e.target.value || 0))
                            );
                            setShiftEnd(hour, shiftEnd.minute);
                          }}
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          placeholder="00"
                          value={shiftEnd.minute === 0 ? "" : shiftEnd.minute}
                          onChange={(e) => {
                            const minute = Math.max(
                              0,
                              Math.min(59, Number(e.target.value || 0))
                            );
                            setShiftEnd(shiftEnd.hour, minute);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-12 items-center justify-center">
        <section className="text-center">
          <div className="text-[56px] font-semibold tracking-tight sm:text-7xl">
            <NumberFlow
              value={earnedSoFar}
              format={{ style: "currency", currency }}
            />
          </div>
          <div className="-mt-2 text-sm text-muted-foreground">
            Today’s total: {formatter.format(dailyTotal)}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex justify-center">
            <div className="relative w-[180px] h-[180px]">
              <Gauge
                value={Math.round(progressPercent)}
                size={180}
                showAnimation
                primary={{ 0: "#FF611B", 50: "#FF611B", 100: "#10b981" }}
                secondary={theme === "dark" ? "#333" : "#e5e7eb"}
                aria-label="Day progress gauge"
              />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">
                    Day progress
                  </span>
                  <div className="text-xl font-semibold text-foreground -my-1 pb-1.5">
                    <NumberFlow
                      value={progressPercent / 100}
                      className="text-4xl"
                      format={{ style: "percent", maximumFractionDigits: 0 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="mt-16 flex items-center gap-4 justify-center border-t pt-6 text-center text-sm text-muted-foreground">
        <p className="text-left text-balance text-xs">
          The idea for this project is for it to be a reverse british smart
          meter; gives you motivation, not anxiety.
        </p>
        <p className="text-left text-xs whitespace-nowrap">
          by{" "}
          <a
            href="https://x.com/frederic_ooo"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            freddie
          </a>
        </p>

        <a
          href="https://x.com/frederic_ooo"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X profile"
          className="inline-flex items-center hover:text-foreground"
        >
          <IconBrandX className="h-4 w-4" />
        </a>

        <a
          href="https://github.com/fredericoo/sps"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          className="inline-flex items-center hover:text-foreground"
        >
          <IconBrandGithub className="h-4 w-4" />
        </a>
      </footer>
    </div>
  );
}

export default App;
