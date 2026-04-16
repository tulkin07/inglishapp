import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { DailyReminder } from "@/components/daily-reminder";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speaking Trainer",
  description:
    "Improve your English speaking in 30 days with structured daily practice, shadowing, and real-time feedback.",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <div className="flex-1 flex flex-col">
          <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  30 Day Speaking Plan
                </span>
                <h1 className="text-lg font-semibold text-slate-50">
                  Speaking Trainer
                </h1>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 mx-auto flex w-full max-w-3xl flex-col px-4 pb-6 pt-4">
            {children}
          </main>
        </div>
        <DailyReminder />
      </body>
    </html>
  );
}
