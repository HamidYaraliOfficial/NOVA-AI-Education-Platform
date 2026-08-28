"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { authApi } from "@/lib/api-client";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await authApi.login(email, password);
      window.localStorage.setItem("nova.accessToken", accessToken);
      window.localStorage.setItem("nova.refreshToken", refreshToken);
      push({ title: "Welcome back", variant: "success" });
      router.push("/dashboard/student");
    } catch {
      push({ title: "Sign in failed", description: "Check your credentials and the API connection.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mica flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.login")}</CardTitle>
          <CardDescription>NOVA — {t("app.tagline")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <Input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              type="password"
              placeholder={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {t("auth.login")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t("auth.register")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
