"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell";
import { StudyAvailability } from "@/components/study-availability";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import { Progress } from "@/components/ui";

interface PlanDay {
  day: string;
  topic: string;
  minutes: number;
}

export default function StudyPlannerPage() {
  const [goal, setGoal] = useState("Learn Python in 60 days");
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [plan, setPlan] = useState<PlanDay[] | null>(null);

  function generatePlan() {
    const topics = ["Syntax & variables", "Control flow", "Functions", "Collections", "File I/O", "OOP basics", "Review & quiz"];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    setPlan(days.map((d, i) => ({ day: d, topic: topics[i % topics.length], minutes: dailyMinutes })));
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Study Planner</h1>
            <p className="text-muted-foreground">Set a goal, NOVA builds a daily plan that adapts as you go.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your goal</CardTitle>
              <CardDescription>NOVA re-balances the plan automatically if you fall behind.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Learn Python in 60 days" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Daily time available</span>
                <Input
                  type="number"
                  min={10}
                  max={480}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
              <Button onClick={generatePlan}>Generate weekly plan</Button>
            </CardContent>
          </Card>

          {plan && (
            <Card>
              <CardHeader>
                <CardTitle>This week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {plan.map((d) => (
                  <div key={d.day} className="flex items-center gap-3 rounded-md border border-border p-3">
                    <span className="w-10 text-sm font-semibold">{d.day}</span>
                    <span className="flex-1 text-sm">{d.topic}</span>
                    <span className="text-xs text-muted-foreground">{d.minutes}m</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Weekly progress</span>
                    <span>2 / 7 days done</span>
                  </div>
                  <Progress value={(2 / 7) * 100} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <StudyAvailability />
      </div>
    </AppShell>
  );
}
