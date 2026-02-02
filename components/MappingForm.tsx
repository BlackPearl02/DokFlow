"use client";

import type { ErpField } from "@/lib/erp-schemas";
import { ERP_FIELDS, REQUIRED_FIELDS } from "@/lib/erp-schemas";
import type { SuggestedMappings } from "@/lib/heuristics";

interface MappingFormProps {
  columnLabels: string[];
  suggestedMappings: SuggestedMappings;
  mappings: Record<ErpField, number | null>;
  onMappingsChange: (mappings: Record<ErpField, number | null>) => void;
  disabled?: boolean;
}

export function MappingForm({
  columnLabels,
  suggestedMappings,
  mappings,
  onMappingsChange,
  disabled,
}: MappingFormProps) {
  const options = columnLabels.map((label, index) => (
    <option key={index} value={index}>
      {label || `Kolumna ${index + 1}`}
    </option>
  ));

  const handleChange = (field: ErpField, value: string) => {
    const num = value === "" ? null : parseInt(value, 10);
    onMappingsChange({ ...mappings, [field]: num });
  };

  const allRequiredMapped = REQUIRED_FIELDS.every((id) => mappings[id] != null);

  // Sprawdź czy użytkownik mapuje symbol (index/EAN)
  const symbolMapped = mappings.symbol != null;
  const symbolLabel = symbolMapped ? columnLabels[mappings.symbol!]?.toLowerCase() || "" : "";
  const hasIndex = symbolLabel.includes("index") || symbolLabel.includes("kod");
  const hasEan = symbolLabel.includes("ean") || symbolLabel.includes("barcode") || symbolLabel.includes("kreskow");

  return (
    <div className="space-y-4">
      {symbolMapped && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-medium">Ważne: Mapowanie identyfikatora towaru</p>
          <p className="mt-1 text-xs text-blue-700">
            {hasEan
              ? "Mapujesz kolumnę z kodem EAN. Upewnij się, że kody EAN w pliku dokładnie odpowiadają kodom EAN w Optimie."
              : hasIndex
                ? "Mapujesz kolumnę z kodem/indexem. Upewnij się, że kody w pliku dokładnie odpowiadają kodom towarów w Optimie."
                : "Upewnij się, że wartości w kolumnie Symbol dokładnie odpowiadają kodom towarów lub kodom EAN w Optimie. Optima rozpoznaje towary po kodzie, nazwie lub kodzie EAN."}
          </p>
        </div>
      )}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Mapowanie kolumn</p>
        {ERP_FIELDS.map(({ id, label, required }) => {
          const suggestion = suggestedMappings[id];
          const hasSuggestion = suggestion != null;
          const confidence = suggestion?.confidence ?? 0;
          const isMissingRequired = required && mappings[id] == null;
          return (
            <div key={id} className="flex items-center gap-3">
              <label htmlFor={`map-${id}`} className="w-36 shrink-0 text-sm text-slate-700">
                {label}
                {required && (
                  <span className="text-red-600" aria-hidden>
                    {" "}
                    *
                  </span>
                )}
              </label>
              <div className="flex flex-1 items-center gap-2">
                <select
                  id={`map-${id}`}
                  value={mappings[id] != null ? String(mappings[id]) : ""}
                  onChange={(e) => handleChange(id, e.target.value)}
                  className={`
                    flex-1 rounded border px-3 py-2 text-sm transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-70
                    ${isMissingRequired ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500" : "border-slate-300 bg-white focus:border-slate-500"}
                  `}
                  disabled={disabled}
                  aria-invalid={isMissingRequired}
                  aria-describedby={isMissingRequired ? `map-${id}-error` : undefined}
                >
                  <option value="">— nie mapuj —</option>
                  {options}
                </select>
                {hasSuggestion && (
                  <span
                    className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    title={`Sugestia (pewność ${Math.round(confidence * 100)}%)`}
                  >
                    {Math.round(confidence * 100)}%
                  </span>
                )}
              </div>
              {isMissingRequired && (
                <span id={`map-${id}-error`} className="sr-only">
                  Wymagane pole
                </span>
              )}
            </div>
          );
        })}
        {!allRequiredMapped && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">Mapuj wymagane pola:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-amber-700">
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
    </div>
  );
}
