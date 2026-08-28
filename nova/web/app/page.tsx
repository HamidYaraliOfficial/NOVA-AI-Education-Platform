"use client";

import Link from "next/link";
import { ArrowRight, Bot, Code2, LineChart, Sparkles, Trophy } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { ThemeSwitcher, LocaleSwitcher } from "@/components/switchers";

const FEATURES = [
  { icon: Sparkles, title: "Personalized Learning Path", desc: "NOVA analyzes every quiz, exercise and study session to reshape your path in real time." },
  { icon: Bot, title: "Context-Aware AI Tutor", desc: "Ask questions grounded in the exact course and lesson you're studying, powered by a RAG pipeline." },
  { icon: Code2, title: "Coding Playground", desc: "A full sandboxed IDE with test cases, auto-grading, and multi-language support." },
  { icon: Trophy, title: "Gamified Progress", desc: "XP, streaks, badges and leaderboards keep momentum going." },
  { icon: LineChart, title: "Deep Analytics", desc: "Track accuracy, velocity, retention and weak topics — for students and teachers alike." }
];

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="mica min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">N</div>
          <span className="font-semibold">{t("app.name")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
          <Link href="/login">
            <Button variant="secondary" size="sm">{t("auth.login")}</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">{t("auth.register")}</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" /> AI-Native Education Ecosystem
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("app.name")} — {t("app.tagline")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          One connected platform for courses, AI tutoring, coding practice, exams and analytics — on web and Android, online and offline.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register">
            <Button size="lg">
              Start learning <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/student">
            <Button size="lg" variant="secondary">Explore dashboard</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardContent className="space-y-2 pt-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
