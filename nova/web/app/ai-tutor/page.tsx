"use client";

import { AppShell } from "@/components/shell";
import { AiTutorChat } from "@/components/ai-tutor-chat";

export default function AiTutorPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">AI Tutor</h1>
          <p className="text-muted-foreground">General-purpose tutoring, not tied to a specific lesson.</p>
        </div>
        <AiTutorChat courseId="general" lessonId={null} />
      </div>
    </AppShell>
  );
}
