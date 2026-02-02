import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konwerter PZ do Optima — Dokflow",
  description:
    "Przekształć pliki od dostawcy (Excel, CSV, XML) w gotowy CSV do importu dokumentów PZ w Comarch Optima. Bez rejestracji, szybko i bezpiecznie. Obsługiwane formaty: XLSX, XLS, CSV, XML.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Konwerter PZ do Optima — Dokflow",
    description:
      "Przekształć pliki od dostawcy (Excel, CSV, XML) w gotowy CSV do importu dokumentów PZ w Comarch Optima. Bez rejestracji, szybko i bezpiecznie.",
    url: "/",
  },
};

export default function LandingPage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50/50 to-white px-6 py-16 shadow-xl shadow-slate-200/50 dark:border-slate-800/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 dark:shadow-slate-950/50 sm:px-10 sm:py-20 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Szybka konwersja bez rejestracji</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:via-slate-200 dark:to-slate-100">
              Konwerter PZ do Optima
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
            Przekształć pliki od dostawcy (Excel, CSV) w gotowy CSV do importu dokumentów PZ w
            polskich systemach ERP. <span className="font-semibold text-slate-700 dark:text-slate-200">Bez rejestracji.</span>
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-100 dark:from-blue-500 dark:to-indigo-500 dark:shadow-blue-500/20 dark:hover:shadow-blue-500/30 sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Rozpocznij — prześlij plik
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100"></span>
            </Link>
            <a
              href="#jak-to-dziala"
              className="group flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            >
              <span>Jak to działa</span>
              <svg className="h-5 w-5 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Jak to działa */}
      <section id="jak-to-dziala" className="py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">Jak to działa</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Trzy proste kroki: prześlij plik, ustaw mapowanie kolumn, pobierz CSV.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:gap-8 sm:grid-cols-3">
          <div className="group relative rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-300/50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:shadow-slate-950/50 dark:hover:shadow-slate-900/50">
            <div className="absolute -top-4 -left-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
              1
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">Prześlij plik</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Wgraj plik od dostawcy w formacie XLSX, XLS, CSV lub XML. Wskaż wiersz z nagłówkami.
            </p>
          </div>
          <div className="group relative rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-300/50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:shadow-slate-950/50 dark:hover:shadow-slate-900/50">
            <div className="absolute -top-4 -left-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20">
              2
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">Mapuj i sprawdź</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Przypisz kolumny z pliku do pól ERP (symbol/index/EAN, ilość, cena). Kody muszą odpowiadać Optimie.
            </p>
          </div>
          <div className="group relative rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-300/50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:shadow-slate-950/50 dark:hover:shadow-slate-900/50">
            <div className="absolute -top-4 -left-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-2xl font-bold text-white shadow-lg shadow-purple-500/30 dark:shadow-purple-500/20">
              3
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">Eksport i pobierz</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Pobierz wygenerowany plik CSV i zaimportuj go w Comarch Optima. Zobacz instrukcję importu.
            </p>
          </div>
        </div>
      </section>

      {/* Dla kogo */}
      <section className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50/80 via-white/50 to-slate-50/80 px-6 py-12 shadow-lg shadow-slate-200/30 dark:border-slate-700/50 dark:from-slate-800/80 dark:via-slate-900/50 dark:to-slate-800/80 dark:shadow-slate-950/50 sm:px-10 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">Dla kogo</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Narzędzie dla osób zajmujących się importem, księgowością i operacjami.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="group flex items-center gap-3 rounded-xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm group-hover:scale-110 transition-transform" aria-hidden>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Operatorzy e-commerce</span>
          </li>
          <li className="group flex items-center gap-3 rounded-xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-sm group-hover:scale-110 transition-transform" aria-hidden>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Księgowi</span>
          </li>
          <li className="group flex items-center gap-3 rounded-xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm group-hover:scale-110 transition-transform" aria-hidden>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Menadżerowie importu</span>
          </li>
          <li className="group flex items-center gap-3 rounded-xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm group-hover:scale-110 transition-transform" aria-hidden>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Specjaliści ds. operacji</span>
          </li>
        </ul>
      </section>

      {/* Obsługiwane systemy */}
      <section className="py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
            Obsługiwane systemy ERP
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Eksport do formatu CSV zgodnego z importem PZ w:</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="group rounded-2xl border-2 border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 px-8 py-6 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:scale-105 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-200/50 dark:border-slate-700/80 dark:from-slate-800 dark:to-slate-900/80 dark:shadow-slate-950/50 dark:hover:border-blue-600 dark:hover:shadow-blue-900/30">
            <span className="flex items-center gap-3 font-bold text-lg text-slate-800 dark:text-slate-200">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Comarch Optima
            </span>
          </div>
        </div>
      </section>

      {/* Bezpieczeństwo danych */}
      <section className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-green-50/50 via-white to-green-50/50 px-6 py-12 shadow-xl shadow-slate-200/30 dark:border-slate-700/50 dark:from-green-950/20 dark:via-slate-900 dark:to-green-950/20 dark:shadow-slate-950/50 sm:px-10 sm:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 dark:shadow-green-500/20 mb-6">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">Bezpieczeństwo danych</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Pliki nie są przechowywane na serwerze.</p>
        </div>
        <ul className="mt-10 space-y-4 text-base text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-4 rounded-xl border border-green-100/50 bg-white/60 p-5 backdrop-blur-sm dark:border-green-900/30 dark:bg-slate-800/60">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" aria-hidden>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-medium">Przetwarzanie wyłącznie w pamięci</span>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-green-100/50 bg-white/60 p-5 backdrop-blur-sm dark:border-green-900/30 dark:bg-slate-800/60">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" aria-hidden>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-medium">Dane usuwane zaraz po eksporcie lub po upływie sesji</span>
          </li>
          <li className="flex items-start gap-4 rounded-xl border border-green-100/50 bg-white/60 p-5 backdrop-blur-sm dark:border-green-900/30 dark:bg-slate-800/60">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" aria-hidden>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-medium">Bez rejestracji i logowania</span>
          </li>
        </ul>
      </section>

      {/* CTA końcowy */}
      <section className="py-12 text-center sm:py-16">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">Gotowy do konwersji?</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Prześlij pierwszy plik i pobierz CSV w kilku minutach.
        </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/upload"
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-100 dark:from-blue-500 dark:to-indigo-500 dark:shadow-blue-500/20 dark:hover:shadow-blue-500/30 sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Rozpocznij — prześlij plik
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100"></span>
            </Link>
            <Link
              href="/instrukcja-importu"
              className="group w-full rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-md transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100 sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Instrukcja importu do Optimy
              </span>
            </Link>
          </div>
      </section>
    </div>
  );
}
