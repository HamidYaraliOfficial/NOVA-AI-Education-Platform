"use client";

import { AppShell } from "@/components/shell";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { CourseCard, Leaderboard, ProgressRing, StatPill } from "@/components/widgets";
import { StudyAvailability } from "@/components/study-availability";
import { useI18n } from "@/lib/i18n";
import type { Course, LeaderboardEntry } from "@/lib/types";

const COURSES: Course[] = [
  {
    id: "python-101",
    title: "Python for Data Analysis",
    description: "From variables to pandas dataframes, with hands-on exercises after every lesson.",
    category: "Programming",
    difficulty: "BEGINNER",
    language: "en",
    progressPercent: 62,
    totalLessons: 48,
    completedLessons: 30,
    rating: 4.8,
    instructor: "Dr. Amelia Chen"
  },
  {
    id: "algo-201",
    title: "Algorithms & Data Structures",
    description: "Master the fundamentals with 120+ coding challenges and adaptive quizzes.",
    category: "Computer Science",
    difficulty: "INTERMEDIATE",
    language: "en",
    progressPercent: 24,
    totalLessons: 60,
    completedLessons: 14,
    rating: 4.9,
    instructor: "Farid Hosseini"
  },
  {
    id: "ml-301",
    title: "Applied Machine Learning",
    description: "Build and evaluate real models, guided by your AI tutor at every step.",
    category: "AI & ML",
    difficulty: "ADVANCED",
    language: "en",
    progressPercent: 5,
    totalLessons: 55,
    completedLessons: 3,
    rating: 4.7,
    instructor: "Li Wei"
  }
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userName: "Sara Ahmadi", xp: 24810 },
  { rank: 2, userName: "Wei Zhang", xp: 22190 },
  { rank: 3, userName: "You", xp: 12480 },
  { rank: 4, userName: "James Park", xp: 11760 }
];

export default function StudentDashboard() {
  const { t } = useI18n();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("dashboard.welcome")}, Sara</h1>
          <p className="text-muted-foreground">{t("dashboard.continue")}: Python for Data Analysis · Lesson 31</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label={t("dashboard.streak")} value="27 days" />
          <StatPill label={t("dashboard.xp")} value="12,480" />
          <StatPill label={t("dashboard.rank")} value="#3 this week" />
          <StatPill label="Learning velocity" value="+18% vs last week" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("nav.courses")}</CardTitle>
                <CardDescription>Your active courses and their personalized progress.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {COURSES.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </CardContent>
            </Card>

            <StudyAvailability />

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.recommendations")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <RecommendationRow title="Review: List comprehensions" reason="You scored 62% on the last quiz" />
                <RecommendationRow title="Try: Two Sum (Easy)" reason="Strengthens your array fundamentals" />
                <RecommendationRow title="Advance to: Pandas groupby" reason="You're ahead of pace this week" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course completion</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ProgressRing percent={62} label="overall" size={120} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.weak")} / {t("dashboard.strong")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="destructive">Recursion</Badge>
                  <Badge variant="destructive">Dictionaries</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="success">Loops</Badge>
                  <Badge variant="success">Functions</Badge>
                  <Badge variant="success">String methods</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <Leaderboard entries={LEADERBOARD} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function RecommendationRow({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{reason}</div>
      </div>
      <Badge>AI</Badge>
    </div>
  );
}
