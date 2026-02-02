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
    <div className="space-y-4">
      {symbolMapped && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <p className="font-medium">Ważne: Mapowanie identyfikatora towaru</p>
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
            {hasEan
              ? "Mapujesz kolumnę z kodem EAN. Upewnij się, że kody EAN w pliku dokładnie odpowiadają kodom EAN w Optimie."
              : hasIndex
                ? "Mapujesz kolumnę z kodem/indexem. Upewnij się, że kody w pliku dokładnie odpowiadają kodom towarów w Optimie."
                : "Upewnij się, że wartości w kolumnie Symbol dokładnie odpowiadają kodom towarów lub kodom EAN w Optimie. Optima rozpoznaje towary po kodzie, nazwie lub kodzie EAN."}
          </p>
        </div>
      )}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mapowanie kolumn</p>
        {ERP_FIELDS.map(({ id, label, required }) => {
          const error = getFieldError(id);
          const hasError = error !== null;
          return (
            <div key={id} className="space-y-1">
              <div className="flex items-center gap-3">
                <label htmlFor={`map-${id}`} className="w-36 shrink-0 text-sm text-slate-700 dark:text-slate-300">
                  {label}
                  {required && (
                    <span className="text-red-600 dark:text-red-400" aria-hidden>
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <div className="flex flex-1 flex-col gap-1">
                  <select
                    id={`map-${id}`}
                    value={mappings[id] != null ? String(mappings[id]) : ""}
                    onChange={(e) => handleChange(id, e.target.value)}
                    onBlur={() => setTouchedFields((prev) => new Set(prev).add(id))}
                    className={`
                      flex-1 rounded border px-3 py-2 text-sm transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-70
                      ${hasError ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20 dark:focus:border-red-500 dark:focus:ring-red-500" : "border-slate-300 bg-white focus:border-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-offset-slate-800"}
                    `}
                    disabled={disabled}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `map-${id}-error` : undefined}
                  >
                    <option value="">— nie mapuj —</option>
                    {options}
                  </select>
                  {hasError && (
                    <span
                      id={`map-${id}-error`}
                      className="text-xs text-red-600 dark:text-red-400"
                      role="alert"
                      aria-live="polite"
                    >
                      {error}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!allRequiredMapped && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <p className="font-medium">Mapuj wymagane pola:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-amber-700 dark:text-amber-300">
              <li>
                <strong>Symbol (SKU)</strong> — kod towaru, index lub kod EAN (musi odpowiadać wartościom w Optimie)
              </li>
              <li>
                <strong>Ilość</strong> — ilość towaru (bez separatora tysięcy)
              </li>
              <li>
                <strong>Cena jedn.</strong> — cena jednostkowa (bez separatora tysięcy)
              </li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
          <label htmlFor="currency" className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Waluta w pliku
          </label>
          <select
            id="currency"
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange?.(e.target.value)}
            disabled={disabled}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-offset-slate-800"
          >
            {COMMON_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.name}
              </option>
            ))}
          </select>
          {detectedCurrency && detectedCurrency !== selectedCurrency && (
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              Wykryto walutę w pliku: <strong>{detectedCurrency}</strong>
            </p>
          )}
        </div>
        
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="convertToPln"
              checked={convertToPln}
              onChange={(e) => onConvertToPlnChange?.(e.target.checked)}
              disabled={disabled || selectedCurrency === "PLN"}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 dark:border-slate-600 dark:bg-slate-700"
            />
            <div className="flex-1">
              <label htmlFor="convertToPln" className="text-sm font-medium text-blue-900 dark:text-blue-200 cursor-pointer">
                Przewalutuj na PLN
              </label>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                {selectedCurrency === "PLN" ? (
                  <>Waluta w pliku to PLN. Przewalutowanie nie jest potrzebne.</>
                ) : (
                  <>Ceny zostaną przeliczone z <strong>{selectedCurrency}</strong> na PLN według kursu NBP.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
