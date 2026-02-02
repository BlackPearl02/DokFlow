import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instrukcja importu CSV do Comarch Optima",
  description:
    "Dowiedz się jak zaimportować wygenerowany plik CSV do dokumentu PZ (Przyjęcie Zewnętrzne) lub Faktury Zakupowej w Comarch Optima. Krok po kroku z rozwiązywaniem problemów.",
  keywords: [
    "import CSV Optima",
    "import PZ Optima",
    "Comarch Optima import",
    "instrukcja importu Optima",
    "jak zaimportować CSV do Optimy",
    "import pozycji Optima",
    "przyjęcie zewnętrzne import",
  ],
  alternates: {
    canonical: "/instrukcja-importu",
  },
  openGraph: {
    title: "Instrukcja importu CSV do Comarch Optima — Dokflow",
    description:
      "Dowiedz się jak zaimportować wygenerowany plik CSV do dokumentu PZ (Przyjęcie Zewnętrzne) lub Faktury Zakupowej w Comarch Optima. Krok po kroku z rozwiązywaniem problemów.",
    url: "/instrukcja-importu",
  },
};

export default function InstrukcjaImportuPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-slate-100"
        >
          ← Wróć do strony głównej
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Instrukcja importu pliku CSV do Comarch Optima
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Dowiedz się jak zaimportować wygenerowany plik CSV do dokumentu PZ (Przyjęcie Zewnętrzne) lub
          Faktury Zakupowej w Optimie.
        </p>
      </div>

      {/* Wymagania */}
      <section className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/30">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-3">Wymagania przed importem</h2>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">•</span>
            <span>
              <strong>Plik CSV</strong> wygenerowany przez nasz konwerter (format: <code className="bg-blue-100 px-1 rounded">TOWAR;ILOŚĆ;CENA</code>)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">•</span>
            <span>
              <strong>Kody towarów</strong> w pliku muszą dokładnie odpowiadać kodom w bazie Optimy (index lub EAN)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">•</span>
            <span>
              <strong>Dokument w buforze</strong> — PZ lub Faktura Zakupowa musi być w stanie buforowym (niezatwierdzona)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">•</span>
            <span>
              <strong>Towary w bazie</strong> — wszystkie towary z pliku muszą istnieć w cenniku Optimy
            </span>
          </li>
        </ul>
      </section>

      {/* Format pliku */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Format pliku CSV</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Wygenerowany plik ma strukturę zgodną z wymaganiami Optimy:
        </p>
        <div className="rounded border border-slate-200 bg-slate-50 p-4 font-mono text-xs overflow-x-auto dark:border-slate-700 dark:bg-slate-900">
          <div className="text-slate-600 dark:text-slate-400">TOWAR;ILOŚĆ;CENA</div>
          <div className="mt-1 text-slate-800 dark:text-slate-200">ABC123;10;99.99</div>
          <div className="text-slate-800 dark:text-slate-200">XYZ789;5;149.50</div>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>TOWAR</strong> — kod towaru, nazwa towaru, kod EAN domyślny lub dodatkowy, lub PLU. Wartość jest
            wymagana.
          </p>
          <p>
            <strong>ILOŚĆ</strong> — ilość towaru (do 4 miejsc po przecinku, bez jednostki miary). Wartość jest
            wymagana.
          </p>
          <p>
            <strong>CENA</strong> — cena jednostkowa. Jeśli VAT liczony jest od netto — cena netto, jeśli od brutto —
            cena brutto.
          </p>
        </div>
        <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <strong>Uwaga:</strong> Nie używaj separatorów tysięcy (spacji) w liczbach. Optima może nie rozpoznać
          wartości z separatorami.
        </div>
      </section>

      {/* Import do PZ */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Import do dokumentu PZ (Przyjęcie Zewnętrzne)
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Otwórz dokument PZ</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                W Optimie przejdź do modułu <strong>Magazyn</strong> i otwórz nowy dokument{" "}
                <strong>Przyjęcie Zewnętrzne (PZ)</strong> lub edytuj istniejący dokument w buforze.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">Znajdź opcję importu</h3>
              <p className="mt-1 text-sm text-slate-600">
                Na zakładce <strong>[Ogólne]</strong> dokumentu, na górnej wstążce programu znajdź opcję{" "}
                <strong>Kolektor danych → Importuj pozycje</strong>.
              </p>
              <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <strong>Wskazówka:</strong> Jeśli nie widzisz opcji, upewnij się, że dokument jest w buforze (nie
                zatwierdzony).
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white dark:bg-slate-500">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Wskaż plik CSV</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                W oknie importu wybierz plik CSV z dysku lokalnego lub z IBARD (jeśli masz założone konto). Plik musi
                mieć rozszerzenie <code className="bg-slate-100 px-1 rounded">.csv</code> lub{" "}
                <code className="bg-slate-100 px-1 rounded">.txt</code>.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">Wybierz źródło ceny</h3>
              <p className="mt-1 text-sm text-slate-600">
                W oknie importu wybierz jedną z opcji:
              </p>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm text-slate-600">
                <li>
                  <strong>Pobieraj ceny z programu</strong> — Optima użyje cen domyślnych z cennika (z uwzględnieniem
                  rabatów)
                </li>
                <li>
                  <strong>Pobieraj ceny z pliku</strong> — Optima użyje cen z pliku CSV (netto lub brutto, zależnie od
                  ustawień dokumentu)
                </li>
              </ul>
              <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                <strong>Uwaga:</strong> Jeśli operator ma blokadę zmiany ceny, sekcja z wyborem ceny nie będzie
                widoczna.
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white dark:bg-slate-500">
              5
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Zatwierdź import</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Kliknij <strong>OK</strong> lub <strong>Importuj</strong>. Optima zaimportuje pozycje z pliku na
                dokument.
              </p>
              <div className="mt-2 rounded border border-green-200 bg-green-50 p-3 text-xs text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200">
                <strong>Sukces:</strong> Jeśli wszystkie towary zostały znalezione w bazie, pozycje pojawią się na
                dokumencie.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Import do Faktury Zakupowej */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Import do Faktury Zakupowej
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Proces importu do Faktury Zakupowej jest identyczny jak dla dokumentu PZ:
        </p>
        <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>Otwórz dokument <strong>Faktura Zakupowa</strong> w buforze</li>
          <li>Przejdź do zakładki <strong>[Ogólne]</strong></li>
          <li>Wybierz <strong>Kolektor danych → Importuj pozycje</strong></li>
          <li>Wskaż plik CSV i wybierz źródło ceny</li>
          <li>Zatwierdź import</li>
        </ol>
        <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <strong>Wskazówka:</strong> Dla Faktury Zakupowej ceny z pliku są traktowane jako netto (jeśli VAT liczony
          od netto) lub brutto (jeśli VAT liczony od brutto), zgodnie z ustawieniami dokumentu.
        </div>
      </section>

      {/* Rozwiązywanie problemów */}
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/30">
        <h2 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-4">Rozwiązywanie problemów</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-200 mb-1">
              Towar nie został zaimportowany / "Nie znaleziono pozycji"
            </h3>
            <ul className="ml-4 list-disc space-y-1 text-red-800 dark:text-red-300">
              <li>Sprawdź czy kod towaru w pliku <strong>dokładnie</strong> odpowiada kodowi w Optimie</li>
              <li>Upewnij się, że towar istnieje w cenniku Optimy</li>
              <li>Jeśli używasz EAN, sprawdź czy kod EAN jest przypisany do towaru w Optimie</li>
              <li>Sprawdź czy nie ma dodatkowych spacji w kodzie towaru</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-200 mb-1">Ilość lub cena nie zaimportowały się poprawnie</h3>
            <ul className="ml-4 list-disc space-y-1 text-red-800 dark:text-red-300">
              <li>Upewnij się, że nie używasz separatorów tysięcy (spacji) w liczbach</li>
              <li>Sprawdź format liczby — użyj kropki jako separatora dziesiętnego (np. <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">99.99</code>)</li>
              <li>Dla ilości maksymalnie 4 miejsca po przecinku</li>
              <li>Dla ceny maksymalnie 2 miejsca po przecinku (zostanie zaokrąglona)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-200 mb-1">Opcja "Importuj pozycje" nie jest dostępna</h3>
            <ul className="ml-4 list-disc space-y-1 text-red-800 dark:text-red-300">
              <li>Upewnij się, że dokument jest w buforze (niezatwierdzony)</li>
              <li>Funkcja nie działa na korektach, Fakturach Zaliczkowych i Dowodach Wewnętrznych Sprzedaży</li>
              <li>Sprawdź uprawnienia operatora</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Dodatkowe informacje */}
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Dodatkowe informacje</h2>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>Jednostka miary:</strong> Jeśli w pliku podano kod EAN, na dokumencie ustawi się jednostka miary
            przypisana do tego kodu. Jeśli podano kod/nazwę/PLU, podpowiada się podstawowa jednostka miary towaru.
          </p>
          <p>
            <strong>Towary nieaktywne:</strong> Na dokument importowane są również towary oznaczone jako nieaktywne.
          </p>
          <p>
            <strong>Kontrola ilości:</strong> Przy imporcie towarów z pliku nie działa parametr "Kontrola ilości na
            dokumentach rozchodowych – przy akceptacji pozycji (przez bufor)".
          </p>
          <p>
            <strong>Dodatkowe dane:</strong> Wszystkie dodatkowe dane wpisane w pliku po cenie zostaną pominięte podczas
            importu.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Gotowy do importu?</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Jeśli jeszcze nie masz pliku CSV, wygeneruj go teraz.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/upload"
            className="rounded-lg bg-slate-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-400 dark:active:bg-slate-300 dark:focus:ring-offset-slate-800"
          >
            Wygeneruj plik CSV
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 dark:focus:ring-offset-slate-800"
          >
            Strona główna
          </Link>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "Instrukcja importu pliku CSV do Comarch Optima",
            description:
              "Krok po kroku instrukcja importu pliku CSV do dokumentu PZ (Przyjęcie Zewnętrzne) lub Faktury Zakupowej w Comarch Optima.",
            step: [
              {
                "@type": "HowToStep",
                position: 1,
                name: "Otwórz dokument PZ",
                text: "W Optimie przejdź do modułu Magazyn i otwórz nowy dokument Przyjęcie Zewnętrzne (PZ) lub edytuj istniejący dokument w buforze.",
              },
              {
                "@type": "HowToStep",
                position: 2,
                name: "Znajdź opcję importu",
                text: "Na zakładce [Ogólne] dokumentu, na górnej wstążce programu znajdź opcję Kolektor danych → Importuj pozycje.",
              },
              {
                "@type": "HowToStep",
                position: 3,
                name: "Wskaż plik CSV",
                text: "W oknie importu wybierz plik CSV z dysku lokalnego lub z IBARD. Plik musi mieć rozszerzenie .csv lub .txt.",
              },
              {
                "@type": "HowToStep",
                position: 4,
                name: "Wybierz źródło ceny",
                text: "Wybierz jedną z opcji: Pobieraj ceny z programu (Optima użyje cen domyślnych z cennika) lub Pobieraj ceny z pliku (Optima użyje cen z pliku CSV).",
              },
              {
                "@type": "HowToStep",
                position: 5,
                name: "Zatwierdź import",
                text: "Kliknij OK lub Importuj. Optima zaimportuje pozycje z pliku na dokument.",
              },
            ],
            totalTime: "PT5M",
          }),
        }}
      />
    </div>
  );
}

