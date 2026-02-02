import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWithSteps } from "@/components/LayoutWithSteps";

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
    <html lang="pl">
      <body
        className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900 antialiased`}
      >
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <a
              href="/"
              className="text-lg font-semibold text-slate-800 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
            >
              Dokflow
            </a>
          </div>
          <LayoutWithSteps />
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
