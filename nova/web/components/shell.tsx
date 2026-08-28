"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Code2,
  Layers,
  Bot,
  CalendarClock,
  Bell,
  Settings,
  Presentation,
  ShieldCheck,
  Search,
  Command
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { ThemeSwitcher, LocaleSwitcher } from "@/components/switchers";
import { XpBadge, StreakBadge } from "@/components/widgets";

const NAV = [
  { href: "/dashboard/student", icon: LayoutDashboard, key: "nav.dashboard" },
  { href: "/courses", icon: GraduationCap, key: "nav.courses" },
  { href: "/playground", icon: Code2, key: "nav.playground" },
  { href: "/flashcards", icon: Layers, key: "nav.flashcards" },
  { href: "/ai-tutor", icon: Bot, key: "nav.aiTutor" },
  { href: "/study-planner", icon: CalendarClock, key: "nav.studyPlanner" },
  { href: "/settings", icon: Settings, key: "nav.settings" }
] as const;

const NAV_STAFF = [
  { href: "/dashboard/teacher", icon: Presentation, key: "nav.teacher" },
  { href: "/dashboard/admin", icon: ShieldCheck, key: "nav.admin" }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside className="acrylic sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 p-4 md:flex">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            N
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">{t("app.name")}</div>
            <div className="text-[11px] text-muted-foreground">{t("app.tagline")}</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => (
            <SidebarLink key={item.href} {...item} active={pathname?.startsWith(item.href)} label={t(item.key)} />
          ))}
          <div className="my-2 h-px bg-border" />
          {NAV_STAFF.map((item) => (
            <SidebarLink key={item.href} {...item} active={pathname?.startsWith(item.href)} label={t(item.key)} />
          ))}
        </nav>

        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
        >
          <Command className="h-3.5 w-3.5" />
          <span>{t("search.placeholder")}</span>
          <kbd className="ms-auto rounded bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="acrylic sticky top-0 z-30 flex items-center gap-3 px-4 py-3 md:px-6">
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("search.placeholder")} className="ps-9" onFocus={() => setPaletteOpen(true)} readOnly />
          </div>
          <div className="ms-auto flex items-center gap-2">
            <XpBadge xp={12480} level={14} />
            <StreakBadge days={27} />
            <Link href="/notifications" className="rounded-md p-2 hover:bg-muted">
              <Bell className="h-4.5 w-4.5" />
            </Link>
            <LocaleSwitcher />
            <ThemeSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} onNavigate={(href) => router.push(href)} />}
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function CommandPalette({ onClose, onNavigate }: { onClose: () => void; onNavigate: (href: string) => void }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const items = [...NAV, ...NAV_STAFF].filter((i) => t(i.key).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-32 backdrop-blur-sm" onClick={onClose}>
      <div
        className="fluent-card w-full max-w-lg overflow-hidden shadow-acrylic animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                onNavigate(item.href);
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-start text-sm hover:bg-muted"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              {t(item.key)}
            </button>
          ))}
          {items.length === 0 && <div className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</div>}
        </div>
      </div>
    </div>
  );
}
