"use client";

import { AppShell } from "@/components/shell";
import { VideoPlayer } from "@/components/video-player";
import { AiTutorChat } from "@/components/ai-tutor-chat";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { courseApi } from "@/lib/api-client";
import { useEffect } from "react";

export default function LessonPage({ params }: { params: { courseId: string; lessonId: string } }) {
  useEffect(() => {
    const id = setInterval(() => {
      courseApi.updateProgress(params.courseId, params.lessonId, 0).catch(() => void 0);
    }, 15000);
    return () => clearInterval(id);
  }, [params.courseId, params.lessonId]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="muted">Lesson {params.lessonId}</Badge>
              <h1 className="mt-1 text-xl font-semibold">Control Flow in Python</h1>
            </div>
            <Button size="sm" variant="secondary">
              Mark complete
            </Button>
          </div>

          <VideoPlayer src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" resumeSeconds={0} />

          <Card>
            <CardContent className="prose prose-sm max-w-none pt-5 dark:prose-invert">
              <p>
                Control flow statements let your program make decisions. In this lesson we cover <code>if</code>,{" "}
                <code>elif</code>, <code>else</code>, and how Python evaluates truthy and falsy values.
              </p>
              <pre className="rounded-md bg-muted p-3 text-xs">{`age = 20\nif age >= 18:\n    print("adult")\nelse:\n    print("minor")`}</pre>
            </CardContent>
          </Card>
        </div>

        <div>
          <AiTutorChat courseId={params.courseId} lessonId={params.lessonId} />
        </div>
      </div>
    </AppShell>
  );
}
