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

function parseNumber(value: string): number | null {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/\s+/g, "") // Usuń spacje (separatory tysięcy)
    .replace(/,/g, "."); // Zamień przecinek na kropkę
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function formatNumber(num: number): string {
  // Formatuj bez separatorów tysięcy, z kropką jako separatorem dziesiętnym
  return num.toFixed(2).replace(/\.?0+$/, "");
}

export function generateErpCsv(
  rows: string[][],
  headerRowIndex: number,
  mappings: Record<ErpField, number | null>,
  options?: {
    convertToPln?: boolean;
    exchangeRate?: number;
  }
): string {
  const dataRows = rows.slice(headerRowIndex + 1);
  const lines: string[] = [];
  const { convertToPln = false, exchangeRate } = options ?? {};

  // Optima: bez nagłówka, format: symbol;ilosc;cenaJedn
  for (const row of dataRows) {
    const symbolCol = mappings.symbol;
    const iloscCol = mappings.ilosc;
    const cenaCol = mappings.cenaJedn;
    
    const symbol = symbolCol != null && symbolCol >= 0 ? (row[symbolCol] ?? "") : "";
    const ilosc = iloscCol != null && iloscCol >= 0 ? (row[iloscCol] ?? "") : "";
    let cena = cenaCol != null && cenaCol >= 0 ? (row[cenaCol] ?? "") : "";
    
    // Przewalutowanie na PLN
    if (convertToPln && exchangeRate && cena) {
      const cenaNum = parseNumber(cena);
      if (cenaNum != null) {
        const cenaPln = cenaNum * exchangeRate;
        cena = formatNumber(cenaPln);
      }
    }
    
    // Tylko dodaj wiersz jeśli mamy wszystkie wymagane pola
    if (symbol && ilosc && cena) {
      lines.push(`${escapeCsvCell(symbol)}${SEP}${escapeCsvCell(ilosc)}${SEP}${escapeCsvCell(cena)}`);
    }
  }

  return BOM + lines.join("\r\n");
}
