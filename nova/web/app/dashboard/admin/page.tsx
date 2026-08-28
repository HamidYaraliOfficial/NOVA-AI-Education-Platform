"use client";

import { AppShell } from "@/components/shell";
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { StatPill } from "@/components/widgets";

export default function AdminDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Console</h1>
          <p className="text-muted-foreground">Platform-wide health, users and moderation.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="Total users" value="48,204" />
          <StatPill label="Active teachers" value="312" />
          <StatPill label="Courses published" value="184" />
          <StatPill label="AI requests / day" value="96,410" />
        </div>

        <Card>
          <CardContent className="pt-5">
            <Tabs defaultValue="users">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="system">System health</TabsTrigger>
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
                <TabsTrigger value="flags">Feature flags</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-4 space-y-2">
                {["Sara Ahmadi · Student", "Farid Hosseini · Teacher", "Li Wei · Course Creator", "Admin Bot · Moderator"].map(
                  (u) => (
                    <div key={u} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                      <span>{u}</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                  )
                )}
              </TabsContent>

              <TabsContent value="system" className="mt-4 space-y-2">
                {[
                  { name: "API Gateway", status: "Healthy" },
                  { name: "PostgreSQL primary", status: "Healthy" },
                  { name: "Redis cache", status: "Healthy" },
                  { name: "Code execution workers", status: "Degraded" },
                  { name: "WebSocket cluster", status: "Healthy" }
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                    <span>{s.name}</span>
                    <Badge variant={s.status === "Healthy" ? "success" : "warning"}>{s.status}</Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="moderation" className="mt-4 text-sm text-muted-foreground">
                No pending reports. Flagged discussion posts will appear here for review.
              </TabsContent>

              <TabsContent value="flags" className="mt-4 space-y-2">
                {["Live classes (beta)", "Adaptive difficulty v2", "Payment module"].map((f) => (
                  <div key={f} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                    <span>{f}</span>
                    <Badge variant="muted">Off</Badge>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
