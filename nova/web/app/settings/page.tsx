"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Switch } from "@/components/ui";
import { ThemeSwitcher, LocaleSwitcher } from "@/components/switchers";
import { Button } from "@/components/ui";

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [aiPersonalization, setAiPersonalization] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Appearance, language, notifications and privacy.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance & language</CardTitle>
            <CardDescription>Windows 11 Fluent theming with light, dark, red and blue variants.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ThemeSwitcher />
            <LocaleSwitcher />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Email reminders" checked={emailNotifs} onChange={setEmailNotifs} />
            <Row label="Push notifications" checked={pushNotifs} onChange={setPushNotifs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Center</CardTitle>
            <CardDescription>Control how NOVA uses your data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Let AI personalize my learning path" checked={aiPersonalization} onChange={setAiPersonalization} />
            <Row label="Share anonymized analytics" checked={shareAnalytics} onChange={setShareAnalytics} />
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="sm">Export my data</Button>
              <Button variant="destructive" size="sm">Delete account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
