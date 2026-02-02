"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MappingForm } from "@/components/MappingForm";
import { DownloadButton } from "@/components/DownloadButton";
import { StepIndicator } from "@/components/StepIndicator";
import type { ErpField } from "@/lib/erp-schemas";
import { ERP_FIELDS, REQUIRED_FIELDS } from "@/lib/erp-schemas";
import type { SuggestedMappings } from "@/lib/heuristics";
import { findCurrencyColumn } from "@/lib/heuristics";

const PREVIEW_ROWS = 20;
const CONFIDENCE_PRESELECT_THRESHOLD = 0.7;

function columnIsNumeric(rows: string[][], colIndex: number, dataStart: number): boolean {
  const dataRows = rows.slice(dataStart);
  if (dataRows.length === 0) return false;
  const sample = dataRows
    .slice(0, 20)
    .map((r) => String(r[colIndex] ?? "").trim())
    .filter(Boolean);
  if (sample.length === 0) return false;
  const numeric = sample.filter((v) => /^-?[\d.,\s]+%?$/.test(v));
  return numeric.length / sample.length >= 0.7;
}

function initialMappings(suggested: SuggestedMappings): Record<ErpField, number | null> {
  const m: Record<ErpField, number | null> = {
    symbol: null,
    ilosc: null,
    cenaJedn: null,
  };
  for (const { id } of ERP_FIELDS) {
    const s = suggested[id];
    if (s != null && s.confidence > CONFIDENCE_PRESELECT_THRESHOLD) {
      m[id] = s.columnIndex;
    }
  }
  return m;
}

function MapPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [columnLabels, setColumnLabels] = useState<string[]>([]);
  const [suggestedMappings, setSuggestedMappings] = useState<SuggestedMappings>({});
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [mappings, setMappings] = useState<Record<ErpField, number | null>>({
    symbol: null,
    ilosc: null,
    cenaJedn: null,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [updatingHeader, setUpdatingHeader] = useState(false);
  const [convertToPln, setConvertToPln] = useState(false);
  const [currencyColumnIndex, setCurrencyColumnIndex] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("PLN");

  useEffect(() => {
    if (!sessionId) {
      setError("Brak identyfikatora sesji.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/session?sessionId=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Sesja wygasła lub nie istnieje.");
          setLoading(false);
          return;
        }
        setPreviewRows(data.previewRows ?? []);
        setColumnLabels(data.columnLabels ?? []);
        setSuggestedMappings(data.suggestedMappings ?? {});
        setHeaderRowIndex(data.headerRowIndex ?? 0);
        setFileName(data.fileName ?? null);
        setMappings(initialMappings(data.suggestedMappings ?? {}));
        
        // Znajdź kolumnę waluty
        const currencyCol = findCurrencyColumn(data.previewRows ?? [], data.headerRowIndex ?? 0);
        setCurrencyColumnIndex(currencyCol);
      } catch {
        if (!cancelled) setError("Błąd połączenia.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleHeaderRowClick = useCallback(async (rowIndex: number) => {
    if (!sessionId || updatingHeader || rowIndex === headerRowIndex) return;
    setUpdatingHeader(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          headerRowIndex: rowIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Błąd aktualizacji nagłówka.");
        setUpdatingHeader(false);
        return;
      }
      setPreviewRows(data.previewRows ?? []);
      setColumnLabels(data.columnLabels ?? []);
      setSuggestedMappings(data.suggestedMappings ?? {});
      setHeaderRowIndex(data.headerRowIndex ?? 0);
      setMappings(initialMappings(data.suggestedMappings ?? {}));
      
      // Znajdź kolumnę waluty
      const currencyCol = findCurrencyColumn(data.previewRows ?? [], data.headerRowIndex ?? 0);
      setCurrencyColumnIndex(currencyCol);
    } catch {
      setError("Błąd połączenia.");
    } finally {
      setUpdatingHeader(false);
    }
  }, [sessionId, headerRowIndex, updatingHeader]);

  const handleExport = useCallback(async () => {
    if (!sessionId) return;
    setError(null);
    setExporting(true);
    try {
      // Jeśli przewalutowanie jest włączone, pobierz kurs waluty
      let exchangeRate: number | undefined;
      const currency = selectedCurrency.toUpperCase();
      
      if (convertToPln && currency && currency !== "PLN") {
        try {
          const rateRes = await fetch(`/api/nbp-exchange-rate?currency=${encodeURIComponent(currency)}`);
          const rateData = await rateRes.json();
          if (rateRes.ok && rateData.rate) {
            exchangeRate = rateData.rate;
          } else {
            setError(`Nie udało się pobrać kursu dla waluty ${currency}. ${rateData.error ?? ""}`);
            setExporting(false);
            return;
          }
        } catch (err) {
          setError(`Błąd pobierania kursu waluty: ${err instanceof Error ? err.message : "Nieznany błąd"}`);
          setExporting(false);
          return;
        }
      } else if (currency === "PLN") {
        exchangeRate = 1;
      }
      
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          mappings,
          convertToPln: convertToPln && exchangeRate != null,
          exchangeRate,
          currency: selectedCurrency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Błąd eksportu.");
        setExporting(false);
        return;
      }
      const csv = data.csv as string;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PZ_import_optima.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
    } catch {
      setError("Błąd połączenia.");
    } finally {
      setExporting(false);
    }
  }, [sessionId, mappings, convertToPln, selectedCurrency]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded dark:bg-slate-700 w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded dark:bg-slate-700 w-2/3"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
            <div className="space-y-4">
              <div className="h-12 bg-slate-200 rounded dark:bg-slate-700"></div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded dark:bg-slate-800"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-slate-200 rounded dark:bg-slate-700"></div>
              <div className="h-10 bg-slate-200 rounded dark:bg-slate-700"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !previewRows.length) {
    return (
      <div className="space-y-4">
        <p className="text-red-600 dark:text-red-400" role="alert" aria-live="polite">
          {error}
        </p>
        <Link href="/upload" className="text-neutral-700 underline dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
          Wróć do przesyłania pliku
        </Link>
      </div>
    );
  }

  const dataStart = headerRowIndex + 1;
  // Pokaż wszystkie wiersze przed dataStart oraz PREVIEW_ROWS wierszy danych
  const displayRows = previewRows;
  const colCount = displayRows[0]?.length ?? 0;
  const numericCols = new Set(
    Array.from({ length: colCount }, (_, j) => j).filter((j) =>
      columnIsNumeric(displayRows, j, dataStart)
    )
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <StepIndicator currentStep={exportDone ? 3 : 2} fileName={fileName} />
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mapuj i sprawdź</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Kliknij wiersz, aby wybrać go jako nagłówek. Następnie przypisz kolumny z pliku do pól ERP i pobierz CSV.
      </p>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <p className="font-medium mb-2">Jak mapować kolumny:</p>
        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-inside list-disc">
          <li><strong>Symbol (SKU)</strong> — wybierz kolumnę z kodem towaru (index) LUB kodem EAN</li>
          <li>Jeśli w pliku masz <strong>index</strong> → mapuj do Symbol (index musi być w Optimie)</li>
          <li>Jeśli w pliku masz <strong>EAN</strong> → mapuj do Symbol (EAN musi być w Optimie)</li>
          <li><strong>Ilość</strong> — kolumna z ilością towaru (bez jednostki miary)</li>
          <li><strong>Cena jedn.</strong> — kolumna z ceną jednostkową (netto lub brutto, zależnie od dokumentu)</li>
        </ul>
      </div>

      {exportDone ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200" role="alert" aria-live="polite">
          <div className="animate-fade-in flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-200 text-2xl font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300">
              ✓
            </span>
            <div>
              <p className="font-medium">Plik został pobrany.</p>
              <p className="mt-0.5 text-sm text-green-700 dark:text-green-300">
                Wygenerowany plik CSV do importu PZ w Comarch Optima.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium">Dane zostały usunięte z pamięci.</p>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Następny krok: Import do Optimy</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
              Pobrany plik CSV możesz zaimportować do dokumentu PZ (Przyjęcie Zewnętrzne) lub Faktury Zakupowej w Optimie.
            </p>
            <Link
              href="/instrukcja-importu"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-400 dark:active:bg-blue-300 dark:focus:ring-offset-slate-800"
            >
              Zobacz instrukcję importu do Optimy
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/upload"
              className="inline-block rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-400 dark:active:bg-slate-300 dark:focus:ring-offset-slate-800"
            >
              Nowa konwersja
            </Link>
            <Link
              href="/"
              className="inline-block rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 dark:focus:ring-offset-slate-800"
            >
              Strona główna
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
            <div className="min-w-0">
              <div className="mb-4 rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-3 dark:border-blue-600 dark:bg-blue-900/30">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  Kliknij wiersz, aby wybrać go jako nagłówek tabeli
                </p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-sm" aria-label="Podgląd pierwszych 20 wierszy">
                  <tbody>
                    {displayRows.map((row, i) => {
                      const isHeaderRow = i === headerRowIndex;
                      const isBeforeData = i < dataStart;
                      const isClickable = !updatingHeader && !isHeaderRow;
                      return (
                        <tr
                          key={i}
                          className={`
                            border-b border-slate-100 dark:border-slate-700 transition-colors duration-150
                            ${isHeaderRow 
                              ? "bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700 font-medium" 
                              : isBeforeData 
                                ? "bg-slate-50 dark:bg-slate-800" 
                                : ""
                            }
                            ${updatingHeader ? "opacity-70" : ""}
                          `}
                        >
                          {row.map((cell, j) => {
                            const CellTag = isBeforeData ? "th" : "td";
                            return (
                              <CellTag
                                key={j}
                                scope={isBeforeData ? "col" : undefined}
                                className={`
                                  px-3 py-2
                                  ${isHeaderRow ? "text-blue-900 dark:text-blue-200" : isBeforeData ? "text-slate-700 dark:text-slate-300" : "text-slate-800 dark:text-slate-200"}
                                  ${numericCols.has(j) ? "text-right tabular-nums" : "text-left"}
                                `}
                              >
                                {isClickable && isBeforeData ? (
                                  <button
                                    type="button"
                                    onClick={() => handleHeaderRowClick(i)}
                                    disabled={updatingHeader}
                                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1 py-0.5 -my-0.5 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-70"
                                    aria-label={`Wybierz wiersz ${i + 1} jako nagłówek tabeli`}
                                    aria-pressed={isHeaderRow}
                                  >
                                    {String(cell || "").trim() || `Kolumna ${j + 1}`}
                                  </button>
                                ) : (
                                  String(cell || "").trim() || (isBeforeData ? `Kolumna ${j + 1}` : "")
                                )}
                              </CellTag>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {updatingHeader && (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400" aria-live="polite" aria-busy="true">
                  Aktualizowanie nagłówka…
                </p>
              )}
            </div>
            <div className="space-y-4">
              <MappingForm
                columnLabels={columnLabels}
                suggestedMappings={suggestedMappings}
                mappings={mappings}
                onMappingsChange={setMappings}
                previewRows={previewRows}
                headerRowIndex={headerRowIndex}
                disabled={exporting}
                convertToPln={convertToPln}
                onConvertToPlnChange={setConvertToPln}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert" aria-live="polite">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <DownloadButton
                  onClick={handleExport}
                  loading={exporting}
                  disabled={!REQUIRED_FIELDS.every((id) => mappings[id] != null)}
                />
                <Link
                  href="/upload"
                  className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 dark:focus:ring-offset-slate-800"
                >
                  Anuluj — nowy plik
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="text-neutral-600 dark:text-slate-400">Ładowanie…</div>}>
      <MapPageContent />
    </Suspense>
  );
}
