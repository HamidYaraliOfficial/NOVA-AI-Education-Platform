"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Plus, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { formatCountdown } from "@/lib/utils";
import type { AvailabilityWindow } from "@/lib/types";
import { studyPlannerApi } from "@/lib/api-client";

const DAY_KEYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function minutesSinceWeekStart(dow: number, hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return dow * 1440 + h * 60 + m;
}

/**
 * Given the user's weekly availability windows and "now", determine whether a
 * study window is currently open, and compute the countdown to the relevant
 * boundary (either "closes in" if open, or "opens in" if closed).
 */
function computeStatus(windows: AvailabilityWindow[], now: Date) {
  if (windows.length === 0) return { isOpen: false, targetMs: null as number | null, nextLabel: null as string | null };

  const nowDow = now.getDay();
  const nowMinutes = nowDow * 1440 + now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  // Normalize all windows to absolute weekly-minute ranges, expanding wrap-around (end < start => spans midnight).
  type Range = { start: number; end: number; day: number };
  const ranges: Range[] = [];
  for (const w of windows) {
    const start = minutesSinceWeekStart(w.dayOfWeek, w.startTime);
    let end = minutesSinceWeekStart(w.dayOfWeek, w.endTime);
    if (end <= start) end += 1440; // crosses midnight
    ranges.push({ start, end, day: w.dayOfWeek });
  }

  const WEEK = 7 * 1440;
  // Check open now (considering the week wraps, so also check "previous week" copies near boundary).
  for (const shift of [-WEEK, 0, WEEK]) {
    for (const r of ranges) {
      const s = r.start + shift;
      const e = r.end + shift;
      if (nowMinutes >= s && nowMinutes < e) {
        const closesInMinutes = e - nowMinutes;
        return { isOpen: true, targetMs: closesInMinutes * 60000, nextLabel: null };
      }
    }
  }

  // Not open: find the closest future start.
  let best: number | null = null;
  for (const shift of [0, WEEK, 2 * WEEK]) {
    for (const r of ranges) {
      const s = r.start + shift;
      if (s >= nowMinutes) {
        const delta = s - nowMinutes;
        if (best === null || delta < best) best = delta;
      }
    }
  }
  if (best === null) return { isOpen: false, targetMs: null, nextLabel: null };
  return { isOpen: false, targetMs: best * 60000, nextLabel: null };
}

export function StudyAvailability() {
  const { t, locale } = useI18n();
  const [windows, setWindows] = useState<AvailabilityWindow[]>([
    { id: uid(), dayOfWeek: 1, startTime: "19:00", endTime: "21:00" },
    { id: uid(), dayOfWeek: 3, startTime: "19:00", endTime: "21:00" },
    { id: uid(), dayOfWeek: 6, startTime: "10:00", endTime: "13:00" }
  ]);
  const [now, setNow] = useState(() => new Date());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    studyPlannerApi
      .getAvailability()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setWindows(data as AvailabilityWindow[]);
      })
      .catch(() => void 0); // fall back to local defaults if backend isn't reachable
  }, []);

  const status = useMemo(() => computeStatus(windows, now), [windows, now]);

  const dayLabel = (d: number) => {
    if (locale === "fa") {
      return ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"][d];
    }
    if (locale === "zh") {
      return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d];
    }
    return DAY_KEYS_EN[d];
  };

  function updateWindow(id: string, patch: Partial<AvailabilityWindow>) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  function addWindow() {
    setWindows((prev) => [...prev, { id: uid(), dayOfWeek: 1, startTime: "18:00", endTime: "19:00" }]);
  }

  function removeWindow(id: string) {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }

  async function save() {
    setSaving(true);
    try {
      await studyPlannerApi.saveAvailability(windows);
    } catch {
      // Backend not reachable in this demo environment — availability still works locally.
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          {t("planner.title")}
        </CardTitle>
        <CardDescription>{t("planner.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className={
            "rounded-md border p-4 " +
            (status.isOpen ? "border-success/30 bg-success/5" : "border-border bg-muted")
          }
        >
          <div className="text-sm font-medium">{status.isOpen ? t("planner.openNow") : t("planner.closedNow")}</div>
          {status.targetMs !== null && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">
                {status.isOpen ? t("planner.closesIn") : t("planner.nextIn")}
              </span>
              <span className="font-mono text-lg tabular-nums">{formatCountdown(status.targetMs)}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {windows.map((w) => (
            <div key={w.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2.5">
              <select
                value={w.dayOfWeek}
                onChange={(e) => updateWindow(w.id, { dayOfWeek: Number(e.target.value) as AvailabilityWindow["dayOfWeek"] })}
                className="h-9 rounded-md border border-input bg-surface px-2 text-sm"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {dayLabel(d)}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">{t("planner.start")}</span>
              <Input
                type="time"
                value={w.startTime}
                onChange={(e) => updateWindow(w.id, { startTime: e.target.value })}
                className="h-9 w-28"
              />
              <span className="text-xs text-muted-foreground">{t("planner.end")}</span>
              <Input
                type="time"
                value={w.endTime}
                onChange={(e) => updateWindow(w.id, { endTime: e.target.value })}
                className="h-9 w-28"
              />
              <Button variant="ghost" size="icon" className="ms-auto" onClick={() => removeWindow(w.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={addWindow}>
            <Plus className="h-3.5 w-3.5" />
            {t("planner.addWindow")}
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {t("action.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
