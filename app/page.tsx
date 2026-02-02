import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-12 shadow-sm dark:border-slate-800 dark:bg-slate-800 sm:px-10 sm:py-16 md:py-20">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl md:text-5xl">
            Konwerter PZ do Optima
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
            Przekształć pliki od dostawcy (Excel, CSV) w gotowy CSV do importu dokumentów PZ w
            polskich systemach ERP. Bez rejestracji.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="w-full rounded-lg bg-slate-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-400 dark:active:bg-slate-300 dark:focus:ring-offset-slate-800 sm:w-auto"
            >
              Rozpocznij — prześlij plik
            </Link>
            <a
              href="#jak-to-dziala"
              className="text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-slate-200"
            >
              Jak to działa
            </a>
          </div>
        </div>
      </section>

      {/* Jak to działa */}
      <section id="jak-to-dziala" className="py-12 sm:py-16">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Jak to działa</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Trzy kroki: prześlij plik, ustaw mapowanie kolumn, pobierz CSV.
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              1
            </span>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">Prześlij plik</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Wgraj plik od dostawcy w formacie XLSX, XLS, CSV lub XML. Wskaż wiersz z nagłówkami.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              2
            </span>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">Mapuj i sprawdź</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Przypisz kolumny z pliku do pól ERP (symbol/index/EAN, ilość, cena). Kody muszą odpowiadać Optimie.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              3
            </span>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">Eksport i pobierz</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Pobierz wygenerowany plik CSV i zaimportuj go w Comarch Optima. Zobacz instrukcję importu.
            </p>
          </div>
        </div>
      </section>

      {/* Dla kogo */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-10 dark:border-slate-700 dark:bg-slate-800/80 sm:px-10 sm:py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Dla kogo</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Narzędzie dla osób zajmujących się importem, księgowością i operacjami.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden />
            <span className="text-sm text-slate-700 dark:text-slate-300">Operatorzy e-commerce</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden />
            <span className="text-sm text-slate-700 dark:text-slate-300">Księgowi</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden />
            <span className="text-sm text-slate-700 dark:text-slate-300">Menadżerowie importu</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden />
            <span className="text-sm text-slate-700 dark:text-slate-300">Specjaliści ds. operacji</span>
          </li>
        </ul>
      </section>

      {/* Obsługiwane systemy */}
      <section className="py-12 sm:py-16">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
          Obsługiwane systemy ERP
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Eksport do formatu CSV zgodnego z importem PZ w:</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <span className="font-medium text-slate-800 dark:text-slate-200">Comarch Optima</span>
          </div>
        </div>
      </section>

      {/* Bezpieczeństwo danych */}
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:px-10 sm:py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Bezpieczeństwo danych</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Pliki nie są przechowywane na serwerze.</p>
        <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-3">
            <span className="mt-1 shrink-0 text-green-600 dark:text-green-400" aria-hidden>
              •
            </span>
            <span>Przetwarzanie wyłącznie w pamięci</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 shrink-0 text-green-600 dark:text-green-400" aria-hidden>
              •
            </span>
            <span>Dane usuwane zaraz po eksporcie lub po upływie sesji</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 shrink-0 text-green-600 dark:text-green-400" aria-hidden>
              •
            </span>
            <span>Bez rejestracji i logowania</span>
          </li>
        </ul>
      </section>

      {/* CTA końcowy */}
      <section className="py-12 text-center sm:py-16">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Gotowy do konwersji?</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Prześlij pierwszy plik i pobierz CSV w kilku minutach.
        </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/upload"
              className="inline-block rounded-lg bg-slate-600 px-6 py-3 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-400 dark:active:bg-slate-300 dark:focus:ring-offset-slate-800"
            >
              Rozpocznij — prześlij plik
            </Link>
            <Link
              href="/instrukcja-importu"
              className="inline-block rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 dark:focus:ring-offset-slate-800"
            >
              Instrukcja importu do Optimy
            </Link>
          </div>
      </section>
    </div>
  );
}
