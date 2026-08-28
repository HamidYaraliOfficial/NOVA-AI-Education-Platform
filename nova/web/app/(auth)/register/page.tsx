"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { authApi } from "@/lib/api-client";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register({ fullName, email, password });
      push({ title: "Account created", description: "You can now sign in.", variant: "success" });
      router.push("/login");
    } catch {
      push({ title: "Registration failed", description: "Please check the API connection and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mica flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.register")}</CardTitle>
          <CardDescription>Personalized learning starts with a quick onboarding quiz.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder={t("auth.fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              type="password"
              placeholder={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {t("auth.register")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
