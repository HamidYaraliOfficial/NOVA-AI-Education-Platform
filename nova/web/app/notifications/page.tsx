"use client";

import { AppShell } from "@/components/shell";
import { Badge, Card, CardContent } from "@/components/ui";
import type { Notification } from "@/lib/types";

const ITEMS: Notification[] = [
  { id: "n1", title: "Study reminder", body: "Your evening session starts in 30 minutes.", type: "REMINDER", read: false, createdAt: new Date().toISOString() },
  { id: "n2", title: "Exam scheduled", body: "Algorithms Midterm on Friday, 6:00 PM.", type: "EXAM", read: false, createdAt: new Date().toISOString() },
  { id: "n3", title: "27-day streak!", body: "You're on fire — keep it going today.", type: "STREAK", read: true, createdAt: new Date().toISOString() },
  { id: "n4", title: "New AI recommendation", body: "Review recursion before tomorrow's quiz.", type: "AI_RECOMMENDATION", read: true, createdAt: new Date().toISOString() }
];

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {ITEMS.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-4">
                <div className={`mt-1 h-2 w-2 rounded-full ${n.read ? "bg-transparent" : "bg-primary"}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                </div>
                <Badge variant="muted">{n.type.replace("_", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
