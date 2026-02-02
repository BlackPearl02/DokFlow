/**
 * Generate ERP-compatible CSV. Uses mappings to pick source columns.
 * NO FILE STORAGE — output is returned as string; caller must not log content.
 */

import type { ErpField } from "./erp-schemas";
import { CSV_HEADERS, ERP_FIELDS, type TargetErp } from "./erp-schemas";

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
  mappings: Record<ErpField, number | null>,
  _targetErp: TargetErp
): string {
  const headerLine = ERP_FIELDS.map((f) => escapeCsvCell(CSV_HEADERS[f.id])).join(SEP);
  const dataRows = rows.slice(headerRowIndex + 1);
  const lines: string[] = [headerLine];

  for (const row of dataRows) {
    const cells: string[] = [];
    for (const { id } of ERP_FIELDS) {
      const col = mappings[id];
      const value = col != null && col >= 0 ? (row[col] ?? "") : "";
      cells.push(escapeCsvCell(value));
    }
    lines.push(cells.join(SEP));
  }

  return BOM + lines.join("\r\n");
}
