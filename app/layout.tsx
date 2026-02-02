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
        className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-slate-900 dark:text-slate-100`}
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
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <a
              href="/"
              className="text-lg font-semibold text-slate-800 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded dark:text-slate-200 dark:hover:text-slate-300"
            >
              Dokflow
            </a>
            <ThemeToggle />
          </div>
          <LayoutWithSteps />
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
