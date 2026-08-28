"use client";

import { AppShell } from "@/components/shell";
import { CodePlayground } from "@/components/code-playground";

export default function PlaygroundPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Coding Playground</h1>
          <p className="text-muted-foreground">Write, run and test code in a sandboxed, resource-limited environment.</p>
        </div>
        <CodePlayground />
      </div>
    </AppShell>
  );
}
