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
    nazwa: null,
    ilosc: null,
    cenaJedn: null,
    vat: null,
    waluta: null,
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
    nazwa: null,
    ilosc: null,
    cenaJedn: null,
    vat: null,
    waluta: null,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

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

  const handleExport = useCallback(async () => {
    if (!sessionId) return;
    setError(null);
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          mappings,
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
  }, [sessionId, mappings]);

  if (loading) {
    return <div className="text-neutral-600">Ładowanie podglądu…</div>;
  }

  if (error && !previewRows.length) {
    return (
      <div className="space-y-4">
        <p className="text-red-600" role="alert">
          {error}
        </p>
        <Link href="/upload" className="text-neutral-700 underline">
          Wróć do przesyłania pliku
        </Link>
      </div>
    );
  }

  const dataStart = headerRowIndex + 1;
  const displayRows = previewRows.slice(0, dataStart + PREVIEW_ROWS);
  const colCount = displayRows[0]?.length ?? 0;
  const numericCols = new Set(
    Array.from({ length: colCount }, (_, j) => j).filter((j) =>
      columnIsNumeric(displayRows, j, dataStart)
    )
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <StepIndicator currentStep={exportDone ? 3 : 2} fileName={fileName} />
      <h1 className="text-xl font-bold text-slate-900">Mapuj i sprawdź</h1>
      <p className="text-sm text-slate-600">
        Sprawdź podgląd i przypisz kolumny z pliku do pól ERP. Następnie pobierz CSV.
      </p>

      {exportDone ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800">
          <div className="animate-fade-in flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-200 text-2xl font-medium text-green-800">
              ✓
            </span>
            <div>
              <p className="font-medium">Plik został pobrany.</p>
              <p className="mt-0.5 text-sm text-green-700">
                Wygenerowany plik CSV do importu PZ w Comarch Optima.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium">Dane zostały usunięte z pamięci.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/upload"
              className="inline-block rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Nowa konwersja
            </Link>
            <Link
              href="/"
              className="inline-block rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Strona główna
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
            <div className="min-w-0">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm" aria-label="Podgląd pierwszych 20 wierszy">
                  <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100">
                    {displayRows.slice(0, dataStart).map((row, i) => (
                      <tr key={`h-${i}`}>
                        {row.map((cell, j) => (
                          <th
                            key={j}
                            scope="col"
                            className={`px-3 py-2 font-medium text-slate-700 ${numericCols.has(j) ? "text-right tabular-nums" : "text-left"}`}
                          >
                            {String(cell || "").trim() || `Kolumna ${j + 1}`}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {displayRows.slice(dataStart).map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50"
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`px-3 py-2 text-slate-800 ${numericCols.has(j) ? "text-right tabular-nums" : "text-left"}`}
                          >
                            {String(cell ?? "").trim()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-4">
              <MappingForm
                columnLabels={columnLabels}
                suggestedMappings={suggestedMappings}
                mappings={mappings}
                onMappingsChange={setMappings}
                disabled={exporting}
              />
              {error && (
                <p className="text-sm text-red-600" role="alert">
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
                  className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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
    <Suspense fallback={<div className="text-neutral-600">Ładowanie…</div>}>
      <MapPageContent />
    </Suspense>
  );
}
