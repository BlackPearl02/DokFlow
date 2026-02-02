/**
 * Generate ERP-compatible CSV. Uses mappings to pick source columns.
 * NO FILE STORAGE — output is returned as string; caller must not log content.
 */

import type { ErpField } from "./erp-schemas";

const SEP = ";";
const BOM = "\uFEFF";

function escapeCsvCell(value: string): string {
  const s = String(value ?? "").trim();
  if (s.includes(SEP) || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function generateErpCsv(
  rows: string[][],
  headerRowIndex: number,
  mappings: Record<ErpField, number | null>
): string {
  const dataRows = rows.slice(headerRowIndex + 1);
  const lines: string[] = [];

  // Optima: bez nagłówka, format: symbol;ilosc;cenaJedn
  for (const row of dataRows) {
    const symbolCol = mappings.symbol;
    const iloscCol = mappings.ilosc;
    const cenaCol = mappings.cenaJedn;
    
    const symbol = symbolCol != null && symbolCol >= 0 ? (row[symbolCol] ?? "") : "";
    const ilosc = iloscCol != null && iloscCol >= 0 ? (row[iloscCol] ?? "") : "";
    const cena = cenaCol != null && cenaCol >= 0 ? (row[cenaCol] ?? "") : "";
    
    // Tylko dodaj wiersz jeśli mamy wszystkie wymagane pola
    if (symbol && ilosc && cena) {
      lines.push(`${escapeCsvCell(symbol)}${SEP}${escapeCsvCell(ilosc)}${SEP}${escapeCsvCell(cena)}`);
    }
  }

  return BOM + lines.join("\r\n");
}
