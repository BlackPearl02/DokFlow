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
import { trackCsvExport, trackHeaderRowChange, trackParseError } from "@/lib/analytics";

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
  const [xmlSections, setXmlSections] = useState<Array<{ name: string; path: string[]; size: number }>>([]);
  const [selectedXmlSectionPath, setSelectedXmlSectionPath] = useState<string[] | null>(null);
  const [updatingXmlSection, setUpdatingXmlSection] = useState(false);
  const [excelSheets, setExcelSheets] = useState<Array<{ name: string; index: number }>>([]);
  const [selectedExcelSheetIndex, setSelectedExcelSheetIndex] = useState<number | null>(null);
  const [updatingExcelSheet, setUpdatingExcelSheet] = useState(false);

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
        setXmlSections(data.xmlSections ?? []);
        // Ustaw domyślną wybraną sekcję (pierwsza z listy lub null jeśli brak)
        if (data.xmlSections && data.xmlSections.length > 0) {
          setSelectedXmlSectionPath(data.xmlSections[0].path);
        }
        setExcelSheets(data.excelSheets ?? []);
        // Ustaw domyślną wybrany arkusz (pierwszy z listy lub null jeśli brak)
        if (data.excelSheets && data.excelSheets.length > 0) {
          setSelectedExcelSheetIndex(data.excelSheets[0].index);
        }
        
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

  const handleXmlSectionChange = useCallback(async (sectionPath: string[]) => {
    if (!sessionId || updatingXmlSection) return;
    setUpdatingXmlSection(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          xmlSectionPath: sectionPath,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Błąd zmiany sekcji XML.");
        setUpdatingXmlSection(false);
        return;
      }
      setPreviewRows(data.previewRows ?? []);
      setColumnLabels(data.columnLabels ?? []);
      setSuggestedMappings(data.suggestedMappings ?? {});
      setHeaderRowIndex(data.headerRowIndex ?? 0);
      setMappings(initialMappings(data.suggestedMappings ?? {}));
      setXmlSections(data.xmlSections ?? []);
      setSelectedXmlSectionPath(sectionPath);
      setExcelSheets(data.excelSheets ?? []);
      
      // Znajdź kolumnę waluty
      const currencyCol = findCurrencyColumn(data.previewRows ?? [], data.headerRowIndex ?? 0);
      setCurrencyColumnIndex(currencyCol);
    } catch {
      setError("Błąd połączenia.");
    } finally {
      setUpdatingXmlSection(false);
    }
  }, [sessionId, updatingXmlSection]);

  const handleExcelSheetChange = useCallback(async (sheetIndex: number) => {
    if (!sessionId || updatingExcelSheet) return;
    setUpdatingExcelSheet(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          excelSheetIndex: sheetIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Błąd zmiany arkusza Excel.");
        setUpdatingExcelSheet(false);
        return;
      }
      setPreviewRows(data.previewRows ?? []);
      setColumnLabels(data.columnLabels ?? []);
      setSuggestedMappings(data.suggestedMappings ?? {});
      setHeaderRowIndex(data.headerRowIndex ?? 0);
      setMappings(initialMappings(data.suggestedMappings ?? {}));
      setExcelSheets(data.excelSheets ?? []);
      setSelectedExcelSheetIndex(sheetIndex);
      setXmlSections(data.xmlSections ?? []);
      
      // Znajdź kolumnę waluty
      const currencyCol = findCurrencyColumn(data.previewRows ?? [], data.headerRowIndex ?? 0);
      setCurrencyColumnIndex(currencyCol);
    } catch {
      setError("Błąd połączenia.");
    } finally {
      setUpdatingExcelSheet(false);
    }
  }, [sessionId, updatingExcelSheet]);

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
      setXmlSections(data.xmlSections ?? []);
      setExcelSheets(data.excelSheets ?? []);
      
      // Znajdź kolumnę waluty
      const currencyCol = findCurrencyColumn(data.previewRows ?? [], data.headerRowIndex ?? 0);
      setCurrencyColumnIndex(currencyCol);
      
      // Trackowanie zmiany nagłówka
      await trackHeaderRowChange(data.headerRowIndex ?? 0);
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
      a.download = `import_optima.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      
      // Trackowanie udanego eksportu
      const rowCount = previewRows.length - (headerRowIndex + 1);
      await trackCsvExport({
        convertToPln,
        currency: selectedCurrency,
        exchangeRate,
        rowCount: rowCount > 0 ? rowCount : undefined,
      });
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
    <div className="mx-auto max-w-6xl space-y-8">
      <StepIndicator currentStep={exportDone ? 3 : 2} fileName={fileName} />
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">Mapuj i sprawdź</h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          Kliknij wiersz, aby wybrać go jako nagłówek. Następnie przypisz kolumny z pliku do pól ERP i pobierz CSV.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-md shadow-slate-200/20 dark:border-slate-700/80 dark:bg-slate-800/50 dark:shadow-slate-950/20">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-base text-slate-900 dark:text-slate-200 mb-3">Jak mapować kolumny:</p>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500 dark:bg-slate-400" aria-hidden />
                <span><strong>Symbol (SKU)</strong> — wybierz kolumnę z kodem towaru (index) LUB kodem EAN</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden />
                <span>Jeśli w pliku masz <strong>index</strong> → mapuj do Symbol (index musi być w Optimie)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden />
                <span>Jeśli w pliku masz <strong>EAN</strong> → mapuj do Symbol (EAN musi być w Optimie)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden />
                <span><strong>Ilość</strong> — kolumna z ilością towaru (bez jednostki miary)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden />
                <span><strong>Cena jedn.</strong> — kolumna z ceną jednostkową (netto lub brutto, zależnie od dokumentu)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {xmlSections.length > 1 && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-md shadow-slate-200/20 dark:border-slate-700/80 dark:bg-slate-800/50 dark:shadow-slate-950/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base text-slate-900 dark:text-slate-200 mb-2">
                Wybierz sekcję XML do przetworzenia
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                W pliku XML znaleziono kilka sekcji. Wybierz sekcję zawierającą produkty/pozycje do importu.
              </p>
              <div className="flex flex-col gap-2">
                {xmlSections.map((section, index) => {
                  const isSelected = JSON.stringify(selectedXmlSectionPath) === JSON.stringify(section.path);
                  return (
                    <button
                      key={index}
                      onClick={() => handleXmlSectionChange(section.path)}
                      disabled={updatingXmlSection}
                      className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                      } ${updatingXmlSection ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-slate-200">
                          {section.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {section.path.length > 0 ? section.path.join(" → ") : "Główna sekcja"} • {section.size} {section.size === 1 ? "element" : "elementów"}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white dark:bg-blue-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {updatingXmlSection && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Przetwarzanie wybranej sekcji...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {excelSheets.length > 1 && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-md shadow-slate-200/20 dark:border-slate-700/80 dark:bg-slate-800/50 dark:shadow-slate-950/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base text-slate-900 dark:text-slate-200 mb-2">
                Wybierz arkusz Excel do przetworzenia
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                W pliku Excel znaleziono kilka arkuszy. Wybierz arkusz zawierający dane do importu.
              </p>
              <div className="flex flex-col gap-2">
                {excelSheets.map((sheet, index) => {
                  const isSelected = selectedExcelSheetIndex === sheet.index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleExcelSheetChange(sheet.index)}
                      disabled={updatingExcelSheet}
                      className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                      } ${updatingExcelSheet ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-slate-200">
                          {sheet.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Arkusz {sheet.index + 1} z {excelSheets.length}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white dark:bg-blue-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {updatingExcelSheet && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Przetwarzanie wybranego arkusza...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {exportDone ? (
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-8 shadow-md shadow-slate-200/20 dark:border-slate-700/80 dark:bg-slate-800/50 dark:shadow-slate-950/20" role="alert" aria-live="polite">
          <div className="animate-fade-in flex items-start gap-4 mb-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-700 text-white shadow-md shadow-slate-700/20 dark:bg-slate-600 dark:shadow-slate-600/20">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-slate-900 dark:text-slate-200">Plik został pobrany.</p>
              <p className="mt-2 text-base text-slate-700 dark:text-slate-300">
                Wygenerowany plik CSV do importu dokumentów w Comarch Optima przez kolektor danych.
              </p>
            </div>
          </div>
          <div className="mb-6 rounded-xl border border-slate-200/50 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">✓ Dane zostały usunięte z pamięci.</p>
          </div>
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-md shadow-slate-200/20 dark:border-slate-700/80 dark:bg-slate-800/50 dark:shadow-slate-950/20">
            <p className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-2">Następny krok: Import do Optimy</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
              Pobrany plik CSV możesz zaimportować do dokumentów w Comarch Optima przez kolektor danych (PZ, Faktura Zakupowa, WZ i inne).
            </p>
            <Link
              href="/instrukcja-importu"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-100 dark:from-blue-500 dark:to-indigo-500 dark:shadow-blue-500/15 dark:hover:shadow-blue-500/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Zobacz instrukcję importu do Optimy
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/upload"
              className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-100 dark:from-blue-500 dark:to-indigo-500 dark:shadow-blue-500/15 dark:hover:shadow-blue-500/20 sm:flex-initial"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Nowa konwersja
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100"></span>
            </Link>
            <Link
              href="/"
              className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-md transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            >
              Strona główna
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
            <div className="min-w-0">
              <div className="mb-4 rounded-xl border-2 border-slate-300 bg-slate-50 px-5 py-4 shadow-md shadow-slate-200/20 dark:border-slate-600 dark:bg-slate-800/50 dark:shadow-slate-950/20">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Kliknij wiersz, aby wybrać go jako nagłówek tabeli
                </p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-lg dark:border-slate-700/80 dark:bg-slate-800/80">
                <table className="min-w-full text-sm" aria-label="Podgląd pierwszych 20 wierszy">
                  <tbody>
                    {displayRows.map((row, i) => {
                      const isHeaderRow = i === headerRowIndex;
                      const isBeforeData = i < dataStart;
                      // Pozwól klikać wszystkie wiersze, które nie są już nagłówkiem (ograniczenie do pierwszych 20 wierszy, żeby nie klikać w dane)
                      const isClickable = !updatingHeader && !isHeaderRow && i < 20;
                      return (
                        <tr
                          key={i}
                          className={`
                            border-b border-slate-100 dark:border-slate-700 transition-colors duration-150
                            ${isHeaderRow 
                              ? "bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700 font-medium" 
                              : isClickable
                                ? "bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" 
                                : isBeforeData
                                  ? "bg-slate-50 dark:bg-slate-800"
                                  : ""
                            }
                            ${updatingHeader ? "opacity-70" : ""}
                          `}
                          onClick={isClickable ? (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleHeaderRowClick(i);
                          } : undefined}
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
                                {isClickable ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleHeaderRowClick(i);
                                    }}
                                    disabled={updatingHeader || i === headerRowIndex}
                                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1 py-0.5 -my-0.5 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-70 cursor-pointer"
                                    aria-label={`Wybierz wiersz ${i + 1} jako nagłówek tabeli`}
                                    aria-pressed={isHeaderRow}
                                    style={{ pointerEvents: 'auto' }}
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
              <div className="flex flex-wrap gap-4">
                <DownloadButton
                  onClick={handleExport}
                  loading={exporting}
                  disabled={!REQUIRED_FIELDS.every((id) => mappings[id] != null)}
                />
                <Link
                  href="/upload"
                  className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-md transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
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
