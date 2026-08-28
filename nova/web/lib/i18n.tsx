"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "fa" | "zh";

export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  fa: "rtl",
  zh: "ltr"
};

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  fa: "فارسی",
  zh: "中文"
};

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    "app.name": "NOVA",
    "app.tagline": "AI-Native Education Platform",
    "nav.dashboard": "Dashboard",
    "nav.courses": "My Learning",
    "nav.playground": "Coding Playground",
    "nav.flashcards": "Flashcards",
    "nav.aiTutor": "AI Tutor",
    "nav.studyPlanner": "Study Planner",
    "nav.calendar": "Calendar",
    "nav.notifications": "Notifications",
    "nav.settings": "Settings",
    "nav.teacher": "Teacher Studio",
    "nav.admin": "Admin Console",
    "dashboard.welcome": "Welcome back",
    "dashboard.continue": "Continue learning",
    "dashboard.streak": "Day streak",
    "dashboard.xp": "Total XP",
    "dashboard.rank": "Leaderboard rank",
    "dashboard.todayPlan": "Today's plan",
    "dashboard.weak": "Focus areas",
    "dashboard.strong": "Strong topics",
    "dashboard.upcomingExams": "Upcoming exams",
    "dashboard.recommendations": "AI recommendations",
    "course.resume": "Resume",
    "course.startCourse": "Start course",
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.run": "Run",
    "action.submit": "Submit",
    "action.send": "Send",
    "action.viewAll": "View all",
    "quiz.timeLeft": "Time left",
    "quiz.next": "Next question",
    "quiz.finish": "Finish attempt",
    "flashcards.due": "Due for review",
    "flashcards.again": "Again",
    "flashcards.good": "Good",
    "flashcards.easy": "Easy",
    "aiTutor.placeholder": "Ask about this lesson…",
    "planner.title": "Study availability",
    "planner.subtitle": "Tell NOVA when you're usually free, and it will find your next study window automatically.",
    "planner.addWindow": "Add time window",
    "planner.openNow": "You're in an open study window",
    "planner.closedNow": "No study window is open right now",
    "planner.nextIn": "Next window opens in",
    "planner.closesIn": "This window closes in",
    "planner.day": "Day",
    "planner.start": "Start",
    "planner.end": "End",
    "auth.login": "Sign in",
    "auth.register": "Create account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full name",
    "theme.light": "Light (Windows Default)",
    "theme.dark": "Dark",
    "theme.red": "Red",
    "theme.blue": "Blue",
    "search.placeholder": "Search courses, lessons, questions…"
  },
  fa: {
    "app.name": "نوا",
    "app.tagline": "پلتفرم آموزشی هوشمند مبتنی بر هوش مصنوعی",
    "nav.dashboard": "داشبورد",
    "nav.courses": "یادگیری من",
    "nav.playground": "محیط برنامه‌نویسی",
    "nav.flashcards": "فلش‌کارت‌ها",
    "nav.aiTutor": "معلم هوشمند",
    "nav.studyPlanner": "برنامه‌ریز مطالعه",
    "nav.calendar": "تقویم",
    "nav.notifications": "اعلان‌ها",
    "nav.settings": "تنظیمات",
    "nav.teacher": "کارگاه استاد",
    "nav.admin": "کنسول مدیریت",
    "dashboard.welcome": "خوش برگشتی",
    "dashboard.continue": "ادامه یادگیری",
    "dashboard.streak": "روز پیاپی",
    "dashboard.xp": "امتیاز کل",
    "dashboard.rank": "رتبه در جدول امتیازات",
    "dashboard.todayPlan": "برنامه امروز",
    "dashboard.weak": "نقاط قابل تقویت",
    "dashboard.strong": "موضوعات قوی",
    "dashboard.upcomingExams": "آزمون‌های پیش‌رو",
    "dashboard.recommendations": "پیشنهادهای هوش مصنوعی",
    "course.resume": "ادامه دوره",
    "course.startCourse": "شروع دوره",
    "action.save": "ذخیره",
    "action.cancel": "انصراف",
    "action.run": "اجرا",
    "action.submit": "ارسال پاسخ",
    "action.send": "ارسال",
    "action.viewAll": "مشاهده همه",
    "quiz.timeLeft": "زمان باقی‌مانده",
    "quiz.next": "سؤال بعدی",
    "quiz.finish": "پایان آزمون",
    "flashcards.due": "آماده مرور",
    "flashcards.again": "دوباره",
    "flashcards.good": "خوب",
    "flashcards.easy": "آسان",
    "aiTutor.placeholder": "درباره این درس بپرس…",
    "planner.title": "زمان‌های آزاد مطالعه",
    "planner.subtitle": "به نوا بگو معمولاً چه ساعاتی آزاد هستی تا خودش زمان جلسه بعدی مطالعه را پیدا کند.",
    "planner.addWindow": "افزودن بازه زمانی",
    "planner.openNow": "الان در یک بازه مطالعه آزاد هستی",
    "planner.closedNow": "در حال حاضر هیچ بازه مطالعه‌ای باز نیست",
    "planner.nextIn": "بازه بعدی شروع می‌شود تا",
    "planner.closesIn": "این بازه بسته می‌شود تا",
    "planner.day": "روز",
    "planner.start": "شروع",
    "planner.end": "پایان",
    "auth.login": "ورود",
    "auth.register": "ساخت حساب کاربری",
    "auth.email": "ایمیل",
    "auth.password": "رمز عبور",
    "auth.fullName": "نام و نام خانوادگی",
    "theme.light": "روشن (پیش‌فرض ویندوز)",
    "theme.dark": "تاریک",
    "theme.red": "قرمز",
    "theme.blue": "آبی",
    "search.placeholder": "جستجوی دوره‌ها، درس‌ها، سؤالات…"
  },
  zh: {
    "app.name": "NOVA",
    "app.tagline": "AI 原生教育平台",
    "nav.dashboard": "仪表盘",
    "nav.courses": "我的学习",
    "nav.playground": "编程练习场",
    "nav.flashcards": "闪卡",
    "nav.aiTutor": "AI 导师",
    "nav.studyPlanner": "学习计划",
    "nav.calendar": "日历",
    "nav.notifications": "通知",
    "nav.settings": "设置",
    "nav.teacher": "教师工作室",
    "nav.admin": "管理控制台",
    "dashboard.welcome": "欢迎回来",
    "dashboard.continue": "继续学习",
    "dashboard.streak": "连续学习天数",
    "dashboard.xp": "总经验值",
    "dashboard.rank": "排行榜名次",
    "dashboard.todayPlan": "今日计划",
    "dashboard.weak": "薄弱环节",
    "dashboard.strong": "擅长主题",
    "dashboard.upcomingExams": "即将到来的考试",
    "dashboard.recommendations": "AI 推荐",
    "course.resume": "继续学习",
    "course.startCourse": "开始课程",
    "action.save": "保存",
    "action.cancel": "取消",
    "action.run": "运行",
    "action.submit": "提交",
    "action.send": "发送",
    "action.viewAll": "查看全部",
    "quiz.timeLeft": "剩余时间",
    "quiz.next": "下一题",
    "quiz.finish": "完成测验",
    "flashcards.due": "待复习",
    "flashcards.again": "重来",
    "flashcards.good": "良好",
    "flashcards.easy": "简单",
    "aiTutor.placeholder": "询问本课内容…",
    "planner.title": "学习空闲时段",
    "planner.subtitle": "告诉 NOVA 你通常什么时候有空，系统会自动为你找到下一次学习时段。",
    "planner.addWindow": "添加时间段",
    "planner.openNow": "当前处于开放学习时段",
    "planner.closedNow": "当前没有开放的学习时段",
    "planner.nextIn": "下一个时段将在以下时间开始",
    "planner.closesIn": "该时段将在以下时间关闭",
    "planner.day": "星期",
    "planner.start": "开始",
    "planner.end": "结束",
    "auth.login": "登录",
    "auth.register": "创建账户",
    "auth.email": "邮箱",
    "auth.password": "密码",
    "auth.fullName": "姓名",
    "theme.light": "浅色（Windows 默认）",
    "theme.dark": "深色",
    "theme.red": "红色",
    "theme.blue": "蓝色",
    "search.placeholder": "搜索课程、课时、题目…"
  }
};

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("nova.locale") as Locale | null;
    if (stored && dictionaries[stored]) setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_DIR[locale];
    window.localStorage.setItem("nova.locale", locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: LOCALE_DIR[locale],
      setLocale: setLocaleState,
      t: (key: string) => dictionaries[locale][key] ?? key
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
