"use client";

import { AppShell } from "@/components/shell";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { StatPill } from "@/components/widgets";
import { Plus, Sparkles } from "lucide-react";

const COURSES = [
  { id: "python-101", title: "Python for Data Analysis", students: 1204, completion: 61, avgScore: 78 },
  { id: "algo-201", title: "Algorithms & Data Structures", students: 842, completion: 44, avgScore: 71 }
];

export default function TeacherDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Teacher Studio</h1>
            <p className="text-muted-foreground">Manage courses, question banks and student performance.</p>
          </div>
          <Button>
            <Plus className="h-4 w-4" /> New course
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="Active courses" value="6" />
          <StatPill label="Enrolled students" value="2,046" />
          <StatPill label="Avg. completion" value="53%" />
          <StatPill label="Pending grading" value="18" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your courses</CardTitle>
            <CardDescription>Enrollment, completion and average score per course.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {COURSES.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-4 rounded-md border border-border p-3">
                <div className="min-w-[200px] flex-1 font-medium">{c.title}</div>
                <div className="text-sm text-muted-foreground">{c.students} students</div>
                <div className="text-sm text-muted-foreground">{c.completion}% completion</div>
                <div className="text-sm text-muted-foreground">Avg. score {c.avgScore}%</div>
                <Button size="sm" variant="secondary">
                  Manage
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI content generation
            </CardTitle>
            <CardDescription>Draft lessons, quizzes and flashcards from a topic or your own notes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">Generate lesson outline</Button>
            <Button variant="secondary" size="sm">Generate quiz (10 questions)</Button>
            <Button variant="secondary" size="sm">Generate flashcard set</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
