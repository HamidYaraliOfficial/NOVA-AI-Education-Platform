"use client";

import Link from "next/link";
import { CheckCircle2, Circle, FileText, PlayCircle, Trophy } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ProgressRing } from "@/components/widgets";
import type { Section } from "@/lib/types";

const CURRICULUM: Section[] = [
  {
    id: "s1",
    title: "Getting Started",
    chapters: [
      {
        id: "c1",
        title: "Python Basics",
        lessons: [
          { id: "l1", title: "Variables & Types", type: "VIDEO", durationMinutes: 12, completed: true },
          { id: "l2", title: "Control Flow", type: "VIDEO", durationMinutes: 15, completed: true },
          { id: "l3", title: "Practice: Loops", type: "CODE_EXERCISE", durationMinutes: 20, completed: false }
        ]
      }
    ]
  },
  {
    id: "s2",
    title: "Working With Data",
    chapters: [
      {
        id: "c2",
        title: "Collections",
        lessons: [
          { id: "l4", title: "Lists & Dictionaries", type: "TEXT", durationMinutes: 10, completed: false },
          { id: "l5", title: "Quiz: Collections", type: "QUIZ", durationMinutes: 8, completed: false },
          { id: "l6", title: "Final Project", type: "PROJECT", durationMinutes: 45, completed: false }
        ]
      }
    ]
  }
];

const ICONS: Record<string, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  TEXT: FileText,
  CODE_EXERCISE: FileText,
  QUIZ: Trophy,
  PROJECT: Trophy
};

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <Badge variant="muted">Programming</Badge>
            <h1 className="mt-2 text-2xl font-semibold">Python for Data Analysis</h1>
            <p className="text-muted-foreground">by Dr. Amelia Chen · 48 lessons · Beginner</p>
          </div>

          {CURRICULUM.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.chapters.map((chapter) => (
                  <div key={chapter.id}>
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">{chapter.title}</div>
                    <div className="space-y-1.5">
                      {chapter.lessons.map((lesson) => {
                        const Icon = ICONS[lesson.type] ?? FileText;
                        return (
                          <Link
                            key={lesson.id}
                            href={`/courses/${params.courseId}/lesson/${lesson.id}`}
                            className="flex items-center gap-3 rounded-md p-2.5 text-sm hover:bg-muted"
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-xs text-muted-foreground">{lesson.durationMinutes}m</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 pt-6">
              <ProgressRing percent={62} label="complete" size={110} />
              <Link
                href={`/courses/${params.courseId}/lesson/l3`}
                className="w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Resume learning
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
