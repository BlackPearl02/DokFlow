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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://dokflow.pl"),
  title: {
    default: "Dokflow — konwerter PZ do Optima",
    template: "%s | Dokflow",
  },
  description:
    "Przekształć pliki od dostawcy (Excel, CSV, XML) w gotowy CSV do importu dokumentów PZ w Comarch Optima. Bez rejestracji, szybko i bezpiecznie.",
  keywords: [
    "konwerter PZ",
    "import PZ Optima",
    "Comarch Optima",
    "konwersja CSV",
    "import dokumentów",
    "przyjęcie zewnętrzne",
    "konwerter Excel do CSV",
    "import faktur Optima",
  ],
  authors: [{ name: "Dokflow" }],
  creator: "Dokflow",
  publisher: "Dokflow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/",
    siteName: "Dokflow",
    title: "Dokflow — konwerter PZ do Optima",
    description:
      "Przekształć pliki od dostawcy (Excel, CSV, XML) w gotowy CSV do importu dokumentów PZ w Comarch Optima. Bez rejestracji, szybko i bezpiecznie.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dokflow — konwerter PZ do Optima",
    description:
      "Przekształć pliki od dostawcy (Excel, CSV, XML) w gotowy CSV do importu dokumentów PZ w Comarch Optima. Bez rejestracji, szybko i bezpiecznie.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Dokflow",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "Konwerter plików Excel, CSV i XML do formatu CSV zgodnego z importem dokumentów PZ (Przyjęcie Zewnętrzne) w Comarch Optima. Bez rejestracji, przetwarzanie w pamięci, dane usuwane po eksporcie.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "PLN",
              },
              featureList: [
                "Konwersja plików XLSX, XLS, CSV, XML",
                "Mapowanie kolumn do pól ERP",
                "Eksport do CSV zgodnego z Optimą",
                "Przetwarzanie w pamięci (bezpieczeństwo danych)",
                "Bez rejestracji i logowania",
                "Automatyczne wykrywanie nagłówków",
                "Przewalutowanie do PLN",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
