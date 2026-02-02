/**
 * Suggest column mappings from header names and column types (numeric vs text).
 * Returns columnIndex and confidence (0–1). Preselect in UI only when confidence > 0.7.
 */

import type { ErpField } from "./erp-schemas";

export type SuggestedMappingItem = { columnIndex: number; confidence: number };
export type SuggestedMappings = Partial<Record<ErpField, SuggestedMappingItem>>;

const SKU_SYNONYMS = [
  "symbol",
  "sku",
  "kod",
  "artikel",
  "article",
  "product",
  "item",
  "nr",
  "numer",
  "index",
  "ean",
  "barcode",
  "kody kreskowe",
  "编号",
  "货号",
];
const ILOSC_SYNONYMS = ["ilość", "ilosc", "qty", "quantity", "amount", "szt", "数量", "件"];
const CENA_SYNONYMS = [
  "cena",
  "price",
  "unit price",
  "cena jedn",
  "cena_jedn",
  "unit",
  "单价",
  "价格",
];
const WALUTA_SYNONYMS = ["waluta", "currency", "curr", "货币", "币种"];

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function columnLooksNumeric(values: string[], skipHeader = true, sampleSize = 20): boolean {
  const start = skipHeader ? 1 : 0;
  const sample = values.slice(start, start + sampleSize).filter((v) => v !== "" && v != null);
  if (sample.length === 0) return false;
  const numeric = sample.filter((v) => /^-?[\d.,\s]+%?$/.test(String(v).trim()));
  return numeric.length / sample.length >= 0.7;
}

/** Returns 0 = no match, 0.75 = partial, 0.95 = exact. */
function matchHeaderConfidence(label: string, synonyms: string[]): number {
  const n = normalize(label);
  if (!n) return 0;
  for (const syn of synonyms) {
    const sn = normalize(syn);
    if (n === sn) return 0.95;
    if (n.includes(sn) || sn.includes(n)) return 0.75;
  }
  return 0;
}

export function suggestMappings(rows: string[][], headerRowIndex: number): SuggestedMappings {
  const suggested: SuggestedMappings = {};
  if (rows.length <= headerRowIndex) return suggested;

  const headerRow = rows[headerRowIndex].map((c) => String(c ?? "").trim());
  const dataRows = rows.slice(headerRowIndex + 1);
  const columnCount = Math.max(headerRow.length, ...dataRows.map((r) => r.length));

  for (let col = 0; col < columnCount; col++) {
    const label = headerRow[col] ?? `Kolumna ${col + 1}`;
    const columnValues = dataRows.map((r) => String(r[col] ?? "").trim());
    const isNumeric = columnLooksNumeric(columnValues, false);

    const confSymbol = matchHeaderConfidence(label, SKU_SYNONYMS);
    const confIlosc = matchHeaderConfidence(label, ILOSC_SYNONYMS);
    const confCena = matchHeaderConfidence(label, CENA_SYNONYMS);

    if (confSymbol > 0 && !suggested.symbol) {
      suggested.symbol = { columnIndex: col, confidence: confSymbol };
    } else if (confIlosc > 0 && !suggested.ilosc) {
      suggested.ilosc = { columnIndex: col, confidence: confIlosc };
    } else if (confCena > 0 && !suggested.cenaJedn) {
      suggested.cenaJedn = { columnIndex: col, confidence: confCena };
    } else {
      const typeOnlyConf = 0.55;
      if (isNumeric && !suggested.ilosc) {
        suggested.ilosc = { columnIndex: col, confidence: typeOnlyConf };
      } else if (isNumeric && !suggested.cenaJedn) {
        suggested.cenaJedn = { columnIndex: col, confidence: typeOnlyConf };
      } else if (!isNumeric && !suggested.symbol) {
        suggested.symbol = { columnIndex: col, confidence: typeOnlyConf };
      }
    }
  }

  return suggested;
}

export function getColumnLabels(rows: string[][], headerRowIndex: number): string[] {
  if (rows.length <= headerRowIndex) return [];
  const headerRow = rows[headerRowIndex];
  const maxCols = Math.max(
    headerRow?.length ?? 0,
    ...rows.slice(headerRowIndex + 1).map((r) => r.length)
  );
  const labels: string[] = [];
  for (let c = 0; c < maxCols; c++) {
    const label = (headerRow?.[c] != null ? String(headerRow[c]) : "").trim();
    labels.push(label || `Kolumna ${c + 1}`);
  }
  return labels;
}

/**
 * Find currency column index in the file (for currency conversion).
 * Returns column index or null if not found.
 */
export function findCurrencyColumn(rows: string[][], headerRowIndex: number): number | null {
  if (rows.length <= headerRowIndex) return null;
  const headerRow = rows[headerRowIndex].map((c) => String(c ?? "").trim());
  const columnCount = headerRow.length;

  for (let col = 0; col < columnCount; col++) {
    const label = headerRow[col] ?? `Kolumna ${col + 1}`;
    const confWaluta = matchHeaderConfidence(label, WALUTA_SYNONYMS);
    if (confWaluta > 0) {
      return col;
    }
  }
  return null;
}
