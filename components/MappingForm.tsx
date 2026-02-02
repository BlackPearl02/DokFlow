"use client";

import { useState, useEffect } from "react";
import type { ErpField } from "@/lib/erp-schemas";
import { ERP_FIELDS, REQUIRED_FIELDS } from "@/lib/erp-schemas";
import type { SuggestedMappings } from "@/lib/heuristics";
import { findCurrencyColumn } from "@/lib/heuristics";

interface MappingFormProps {
  columnLabels: string[];
  suggestedMappings: SuggestedMappings;
  mappings: Record<ErpField, number | null>;
  onMappingsChange: (mappings: Record<ErpField, number | null>) => void;
  previewRows: string[][];
  headerRowIndex: number;
  disabled?: boolean;
  onConvertToPlnChange?: (enabled: boolean) => void;
  convertToPln?: boolean;
  selectedCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

const COMMON_CURRENCIES = [
  { code: "PLN", name: "PLN (Polski złoty)" },
  { code: "EUR", name: "EUR (Euro)" },
  { code: "USD", name: "USD (Dolar amerykański)" },
  { code: "GBP", name: "GBP (Funt brytyjski)" },
  { code: "CHF", name: "CHF (Frank szwajcarski)" },
  { code: "CZK", name: "CZK (Korona czeska)" },
  { code: "SEK", name: "SEK (Korona szwedzka)" },
  { code: "NOK", name: "NOK (Korona norweska)" },
  { code: "DKK", name: "DKK (Korona duńska)" },
  { code: "CNY", name: "CNY (Yuan chiński)" },
  { code: "JPY", name: "JPY (Jen japoński)" },
  { code: "KRW", name: "KRW (Won południowokoreański)" },
  { code: "HKD", name: "HKD (Dolar hongkoński)" },
  { code: "SGD", name: "SGD (Dolar singapurski)" },
  { code: "THB", name: "THB (Baht tajlandzki)" },
  { code: "INR", name: "INR (Rupia indyjska)" },
  { code: "IDR", name: "IDR (Rupia indonezyjska)" },
  { code: "MYR", name: "MYR (Ringgit malezyjski)" },
  { code: "PHP", name: "PHP (Peso filipińskie)" },
  { code: "VND", name: "VND (Dong wietnamski)" },
];

export function MappingForm({
  columnLabels,
  suggestedMappings,
  mappings,
  onMappingsChange,
  previewRows,
  headerRowIndex,
  disabled,
  onConvertToPlnChange,
  convertToPln = false,
  selectedCurrency = "PLN",
  onCurrencyChange,
}: MappingFormProps) {
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [currencyColumnIndex, setCurrencyColumnIndex] = useState<number | null>(null);

  useEffect(() => {
    const currencyCol = findCurrencyColumn(previewRows, headerRowIndex);
    setCurrencyColumnIndex(currencyCol);
    
    if (currencyCol != null && previewRows.length > headerRowIndex + 1) {
      // Sprawdź pierwszą wartość waluty w danych
      const firstDataRow = previewRows[headerRowIndex + 1];
      const currencyValue = firstDataRow?.[currencyCol]?.toString().trim().toUpperCase();
      if (currencyValue) {
        setDetectedCurrency(currencyValue);
        // Automatycznie ustaw wykrytą walutę, jeśli nie została jeszcze wybrana
        if (onCurrencyChange && selectedCurrency === "PLN" && currencyValue !== "PLN") {
          onCurrencyChange(currencyValue);
        }
      }
    }
  }, [previewRows, headerRowIndex, selectedCurrency, onCurrencyChange]);

  const options = columnLabels.map((label, index) => (
    <option key={index} value={index}>
      {label || `Kolumna ${index + 1}`}
    </option>
  ));

  const [touchedFields, setTouchedFields] = useState<Set<ErpField>>(new Set());

  const handleChange = (field: ErpField, value: string) => {
    const num = value === "" ? null : parseInt(value, 10);
    onMappingsChange({ ...mappings, [field]: num });
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const allRequiredMapped = REQUIRED_FIELDS.every((id) => mappings[id] != null);
  
  const getFieldError = (field: ErpField): string | null => {
    const fieldConfig = ERP_FIELDS.find((f) => f.id === field);
    if (!fieldConfig?.required) return null;
    if (!touchedFields.has(field)) return null;
    if (mappings[field] == null) {
      return `Pole "${fieldConfig.label}" jest wymagane`;
    }
    return null;
  };

  // Sprawdź czy użytkownik mapuje symbol (index/EAN)
  const symbolMapped = mappings.symbol != null;
  const symbolLabel = symbolMapped ? columnLabels[mappings.symbol!]?.toLowerCase() || "" : "";
  const hasIndex = symbolLabel.includes("index") || symbolLabel.includes("kod");
  const hasEan = symbolLabel.includes("ean") || symbolLabel.includes("barcode") || symbolLabel.includes("kreskow");

  return (
    <div className="space-y-6">
      {symbolMapped && (
        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-blue-50/50 to-white p-5 shadow-lg shadow-blue-200/30 dark:border-blue-800/80 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-slate-900 dark:shadow-blue-950/50">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-base text-blue-900 dark:text-blue-200">Ważne: Mapowanie identyfikatora towaru</p>
              <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                {hasEan
                  ? "Mapujesz kolumnę z kodem EAN. Upewnij się, że kody EAN w pliku dokładnie odpowiadają kodom EAN w Optimie."
                  : hasIndex
                    ? "Mapujesz kolumnę z kodem/indexem. Upewnij się, że kody w pliku dokładnie odpowiadają kodom towarów w Optimie."
                    : "Upewnij się, że wartości w kolumnie Symbol dokładnie odpowiadają kodom towarów lub kodom EAN w Optimie. Optima rozpoznaje towary po kodzie, nazwie lub kodzie EAN."}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg shadow-slate-200/30 dark:border-slate-700/80 dark:bg-slate-800/80 dark:shadow-slate-950/50">
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Mapowanie kolumn</p>
          <div className="space-y-5">
            {ERP_FIELDS.map(({ id, label, required }) => {
              const error = getFieldError(id);
              const hasError = error !== null;
              const suggestion = suggestedMappings[id];
              return (
                <div key={id} className="space-y-2">
                  <div className="flex items-start gap-4">
                    <label htmlFor={`map-${id}`} className="w-40 shrink-0 pt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {label}
                      {required && (
                        <span className="ml-1 text-red-600 dark:text-red-400" aria-hidden>
                          *
                        </span>
                      )}
                    </label>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <select
                        id={`map-${id}`}
                        value={mappings[id] != null ? String(mappings[id]) : ""}
                        onChange={(e) => handleChange(id, e.target.value)}
                        onBlur={() => setTouchedFields((prev) => new Set(prev).add(id))}
                        className={`
                          w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 shadow-sm
                          focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70
                          ${hasError 
                            ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20 dark:focus:border-red-500 dark:focus:ring-red-500" 
                            : "border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-offset-slate-800 dark:hover:border-slate-500"
                          }
                        `}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `map-${id}-error` : undefined}
                      >
                        <option value="">Wybierz</option>
                        {options}
                      </select>
                      {hasError && (
                        <span
                          id={`map-${id}-error`}
                          className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5"
                          role="alert"
                          aria-live="polite"
                        >
                          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {error}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {!allRequiredMapped && (
          <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-amber-50/50 to-white p-4 shadow-md shadow-amber-200/30 dark:border-amber-800/80 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-slate-900 dark:shadow-amber-950/50">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-amber-900 dark:text-amber-200">Mapuj wymagane pola:</p>
                <ul className="mt-2 space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" aria-hidden />
                    <span><strong>Symbol (SKU)</strong> — kod towaru, index lub kod EAN (musi odpowiadać wartościom w Optimie)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" aria-hidden />
                    <span><strong>Ilość</strong> — ilość towaru (bez separatora tysięcy)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" aria-hidden />
                    <span><strong>Cena jedn.</strong> — cena jednostkowa (bez separatora tysięcy)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-slate-200/30 dark:border-slate-700/80 dark:bg-slate-800/80 dark:shadow-slate-950/50">
          <label htmlFor="currency" className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
            Waluta w pliku
          </label>
          <select
            id="currency"
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange?.(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:border-slate-400 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-offset-slate-800 dark:hover:border-slate-500"
          >
            {COMMON_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.name}
              </option>
            ))}
          </select>
          {detectedCurrency && detectedCurrency !== selectedCurrency && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-200/50 bg-blue-50/50 p-2.5 dark:border-blue-900/30 dark:bg-blue-950/20">
              <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                Wykryto walutę w pliku: <strong>{detectedCurrency}</strong>
              </p>
            </div>
          )}
        </div>
        
        <div className="rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-slate-200/30 dark:border-slate-700/80 dark:bg-slate-800/80 dark:shadow-slate-950/50">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="convertToPln"
              checked={convertToPln}
              onChange={(e) => onConvertToPlnChange?.(e.target.checked)}
              disabled={disabled || selectedCurrency === "PLN"}
              className="mt-1 h-5 w-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 dark:border-slate-600 dark:bg-slate-700"
            />
            <div className="flex-1">
              <label htmlFor="convertToPln" className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer block mb-2">
                Przewalutuj na PLN
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedCurrency === "PLN" ? (
                  <>Waluta w pliku to PLN. Przewalutowanie nie jest potrzebne.</>
                ) : (
                  <>Ceny zostaną przeliczone z <strong className="text-slate-800 dark:text-slate-200">{selectedCurrency}</strong> na PLN według kursu NBP.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
