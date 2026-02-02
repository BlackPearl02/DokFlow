"use client";

import type { ErpField } from "@/lib/erp-schemas";
import { ERP_FIELDS, REQUIRED_FIELDS } from "@/lib/erp-schemas";
import type { SuggestedMappings } from "@/lib/heuristics";

interface MappingFormProps {
  columnLabels: string[];
  suggestedMappings: SuggestedMappings;
  mappings: Record<ErpField, number | null>;
  onMappingsChange: (mappings: Record<ErpField, number | null>) => void;
  targetErp: "subiekt" | "optima";
  onTargetErpChange: (target: "subiekt" | "optima") => void;
  disabled?: boolean;
}

export function MappingForm({
  columnLabels,
  suggestedMappings,
  mappings,
  onMappingsChange,
  targetErp,
  onTargetErpChange,
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

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="targetErp" className="mb-2 block text-sm font-medium text-slate-700">
          Docelowy system ERP
        </label>
        <select
          id="targetErp"
          value={targetErp}
          onChange={(e) => onTargetErpChange(e.target.value as "subiekt" | "optima")}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm transition-colors duration-200 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-70"
          disabled={disabled}
        >
          <option value="subiekt">Subiekt GT</option>
          <option value="optima">Comarch Optima</option>
        </select>
      </div>

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
          <p className="text-sm text-amber-600">
            Mapuj wymagane pola: Symbol (SKU), Ilość, Cena jedn.
          </p>
        )}
      </div>
    </div>
  );
}
