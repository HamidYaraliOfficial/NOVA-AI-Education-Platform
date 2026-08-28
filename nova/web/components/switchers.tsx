"use client";

import { useState } from "react";
import { Check, Globe, Palette } from "lucide-react";
import { useTheme, THEME_ORDER, type ThemeName } from "@/lib/theme";
import { useI18n, type Locale, LOCALE_LABEL } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const THEME_SWATCH: Record<ThemeName, string> = {
  light: "bg-[#0078D4]",
  dark: "bg-[#60CDFF]",
  red: "bg-[#C42B1C]",
  blue: "bg-[#004E8C]"
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
        aria-label="Change theme"
      >
        <Palette className="h-4.5 w-4.5" />
      </button>
      {open && (
        <div className="fluent-card absolute end-0 z-40 mt-2 w-48 p-1.5 shadow-acrylic" onMouseLeave={() => setOpen(false)}>
          {THEME_ORDER.map((name) => (
            <button
              key={name}
              onClick={() => {
                setTheme(name);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-muted"
            >
              <span className={cn("h-3.5 w-3.5 rounded-full", THEME_SWATCH[name])} />
              <span className="flex-1 text-start">{t(`theme.${name}`)}</span>
              {theme === name && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const locales: Locale[] = ["en", "fa", "zh"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md p-2 hover:bg-muted"
        aria-label="Change language"
      >
        <Globe className="h-4.5 w-4.5" />
      </button>
      {open && (
        <div className="fluent-card absolute end-0 z-40 mt-2 w-36 p-1.5 shadow-acrylic" onMouseLeave={() => setOpen(false)}>
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm hover:bg-muted"
            >
              <span>{LOCALE_LABEL[l]}</span>
              {locale === l && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
