"use client";

interface HeaderRowSelectProps {
  value: number;
  onChange: (rowIndex: number) => void;
  maxRows?: number;
  disabled?: boolean;
}

export function HeaderRowSelect({ value, onChange, maxRows = 20, disabled }: HeaderRowSelectProps) {
  return (
    <div className="space-y-1">
      <label htmlFor="headerRow" className="block text-sm font-medium text-slate-700">
        Wiersz nagłówka
      </label>
      <select
        id="headerRow"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition-colors duration-200 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-70"
        disabled={disabled}
      >
        {Array.from({ length: maxRows }, (_, i) => i + 1).map((rowNum) => (
          <option key={rowNum} value={rowNum}>
            Wiersz {rowNum}
          </option>
        ))}
      </select>
    </div>
  );
}
