import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "NOVA — AI Education Platform",
  description: "AI-native education ecosystem: personalized learning, AI tutor, coding playground, exams and gamification."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="theme-light" suppressHydrationWarning>
      <body className="mica min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
