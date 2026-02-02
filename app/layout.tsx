import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWithSteps } from "@/components/LayoutWithSteps";
import { ThemeToggle } from "@/components/ThemeToggle";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dokflow — konwerter PZ do Optima",
  description:
    "Prześlij plik od dostawcy, ustaw mapowanie kolumn, pobierz CSV do importu PZ w Comarch Optima.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning className="light">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 antialiased dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100`}
      >
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = stored || (prefersDark ? 'dark' : 'light');
                  const html = document.documentElement;
                  if (theme === 'dark') {
                    html.classList.remove('light');
                    html.classList.add('dark');
                    html.setAttribute('data-theme', 'dark');
                  } else {
                    html.classList.remove('dark');
                    html.classList.add('light');
                    html.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm dark:border-slate-800/80 dark:bg-slate-950/80">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <a
                href="/"
                className="group flex items-center gap-2 text-xl font-bold text-slate-900 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded-lg px-2 py-1 -ml-2 dark:text-slate-100 dark:hover:text-slate-200"
              >
                <span className="relative">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 blur-xl transition-opacity group-hover:opacity-20 dark:from-blue-400 dark:to-indigo-400"></span>
                  <span className="relative">Dokflow</span>
                </span>
              </a>
              <ThemeToggle />
            </div>
          </div>
          <LayoutWithSteps />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
