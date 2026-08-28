"use client";

import Link from "next/link";
import { Flame, Star, Trophy } from "lucide-react";
import { Badge, Card, CardContent, Progress } from "@/components/ui";
import { cn, formatMinutes, initials } from "@/lib/utils";
import type { Course, LeaderboardEntry } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

/* ---------------------------- Progress ring ---------------------------- */

export function ProgressRing({
  percent,
  size = 88,
  strokeWidth = 8,
  label
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="stroke-muted fill-none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="stroke-primary fill-none transition-[stroke-dashoffset] duration-1000 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-semibold">{Math.round(percent)}%</span>
        {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

/* ---------------------------- XP / streak badges ---------------------------- */

export function XpBadge({ xp, level }: { xp: number; level: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm font-medium">
      <Star className="h-3.5 w-3.5" />
      <span>{xp.toLocaleString()} XP</span>
      <span className="opacity-60">· Lv.{level}</span>
    </div>
  );
}

export function StreakBadge({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-warning text-sm font-medium">
      <Flame className="h-3.5 w-3.5" />
      <span>{days}</span>
    </div>
  );
}

/* ---------------------------- Course card ---------------------------- */

export function CourseCard({ course }: { course: Course }) {
  const { t } = useI18n();
  const started = course.completedLessons > 0;

  return (
    <Card className="overflow-hidden group">
      <div className="h-28 w-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold leading-snug">{course.title}</h4>
          <Badge variant="muted">{course.difficulty}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        <div className="space-y-1.5">
          <Progress value={course.progressPercent} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
            <span>{course.progressPercent}%</span>
          </div>
        </div>
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          {started ? t("course.resume") : t("course.startCourse")} →
        </Link>
      </CardContent>
    </Card>
  );
}

/* ---------------------------- Leaderboard ---------------------------- */

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="divide-y divide-border">
      {entries.map((e) => (
        <div key={e.rank} className="flex items-center gap-3 py-2.5">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              e.rank === 1 && "bg-warning/20 text-warning",
              e.rank !== 1 && "bg-muted text-muted-foreground"
            )}
          >
            {e.rank === 1 ? <Trophy className="h-3.5 w-3.5" /> : e.rank}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials(e.userName)}
          </div>
          <span className="flex-1 text-sm font-medium">{e.userName}</span>
          <span className="text-sm text-muted-foreground">{e.xp.toLocaleString()} XP</span>
        </div>
      ))}
    </div>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

export { formatMinutes };
