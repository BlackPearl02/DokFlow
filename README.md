# Dokflow — konwerter do Optima

Konwerter plików Excel/CSV od dostawców na gotowy CSV do importu dokumentów w **Comarch Optima** przez kolektor danych. Język i rynek: polski.

> **Licencja:** Projekt objęty licencją zastrzeżoną (proprietary). Wszelkie prawa zastrzeżone — bez pisemnej zgody autora nie wolno kopiować, modyfikować ani wykorzystywać tego kodu. Szczegóły: [LICENSE](LICENSE).

## Architektura

Aplikacja jest **stateless** pod względem plików:

- Plik **nigdy nie jest zapisywany** na dysku ani w bazie danych.
- Parsowanie i eksport odbywają się **wyłącznie w pamięci**.
- Po przesłaniu pliku tworzona jest **sesja w pamięci** (Map w Node.js) identyfikowana przez `sessionId`.
- Po wygenerowaniu i pobraniu CSV **sesja jest usuwana**; dane znikają z serwera.
- Opcjonalnie sesje starsze niż 30 minut są usuwane przez okresowe czyszczenie (TTL).

Przepływ: **Upload** → **Mapowanie kolumn** → **Generuj i pobierz CSV**. Brak rejestracji, brak kont użytkowników.

## Gwarancja usuwania danych

- **Żadne pliki nie są zapisywane.** Zawartość uploadu trafia tylko do bufora w pamięci, jest parsowana i przechowywana w `Map<sessionId, SessionData>` w procesie Node.js.
- **Dane są usuwane** po wywołaniu eksportu (pobraniu CSV) lub po upływie 30 minut od utworzenia sesji.
- **Logi nie zawierają zawartości plików** — w kodzie obowiązuje zasada: nie logować treści uploadów ani wygenerowanego CSV.

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja dostępna pod `http://localhost:3000`.

## Deploy na Vercel

Aplikacja jest gotowa do deployu na Vercel z wbudowanym Vercel Analytics.

### Wymagania

- Konto na [Vercel](https://vercel.com)
- Repozytorium Git (GitHub, GitLab, Bitbucket)

### Kroki deployu

1. **Zainstaluj zależności lokalnie** (aby upewnić się, że wszystko działa):
   ```bash
   npm install
   ```

2. **Sklonuj repozytorium na Vercel**:
   - Zaloguj się do [Vercel Dashboard](https://vercel.com/dashboard)
   - Kliknij "Add New Project"
   - Połącz repozytorium Git
   - Vercel automatycznie wykryje Next.js i skonfiguruje projekt

3. **Skonfiguruj zmienne środowiskowe** (opcjonalnie):
   - W ustawieniach projektu na Vercel dodaj zmienną:
     - `NEXT_PUBLIC_BASE_URL` — URL aplikacji (np. `https://dokflow.pl`)
   - Jeśli nie ustawisz, aplikacja użyje domyślnej wartości `https://dokflow.pl`

4. **Deploy**:
   - Vercel automatycznie zbuduje i wdroży aplikację
   - Po deployu Vercel Analytics będzie automatycznie aktywny

### Vercel Analytics

Vercel Analytics jest już zintegrowany w aplikacji. Po deployu na Vercel:
- Analytics będzie automatycznie zbierał dane o ruchu
- Dane będą dostępne w Vercel Dashboard
- Nie wymaga dodatkowej konfiguracji

### Build lokalny

Aby przetestować build przed deployem:

```bash
npm run build
npm run start
```

## Lint i formatowanie

- **ESLint** (Next.js + Prettier): `npm run lint`, `npm run lint:fix`
- **Prettier**: `npm run format` (zapis), `npm run format:check` (kontrola)

## Ograniczenia MVP

- **Brak auth** — brak kont, profili, płatności.
- **Brak zapisu mapowań** — mapowanie kolumn ustawiane jest przy każdej sesji (sugestie heurystyczne można potwierdzić lub zmienić).
- **Format wyjściowy CSV dla Optima** — bez nagłówka, format: `symbol;ilość;cena` (separator średnik, UTF-8 z BOM).
- **Brak obsługi merged cells** i zaawansowanego formatowania Excela — parsowana jest tylko wartość komórek.
- **Nagłówek w dowolnym wierszu** — użytkownik wybiera numer wiersza nagłówka (1-based); wiersze poniżej traktowane są jako dane.

## Struktura projektu

- `app/` — Next.js App Router: landing, upload, map, download, API routes.
- `lib/` — parser (Excel/CSV), heurystyki mapowania, magazyn sesji w pamięci, generator CSV.
- `components/` — komponenty UI (upload, wybór wiersza nagłówka, formularz mapowania, przycisk pobrania).

## API

- **POST /api/parse** — `multipart/form-data`: plik + `headerRowIndex`. Zwraca `sessionId`, `previewRows`, `suggestedMappings`, `columnLabels`.
- **GET /api/session?sessionId=...** — zwraca podgląd i sugestie dla strony mapowania (404 jeśli sesja nie istnieje).
- **POST /api/export** — JSON: `sessionId`, `mappings`. Zwraca `{ csv }`. Po odpowiedzi sesja jest usuwana.

---

## Licencja

Projekt objęty licencją **proprietary (wszelkie prawa zastrzeżone)**. Żadna osoba ani podmiot nie ma prawa kopiować, modyfikować, rozpowszechniać ani w jakikolwiek sposób wykorzystywać tego kodu bez pisemnej zgody autora. Zobacz [LICENSE](LICENSE).
