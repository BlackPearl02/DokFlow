/**
 * Parse Excel/CSV in memory. NO FILE STORAGE — buffer only, no disk write.
 */

import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";

export type ParseResult = { rows: string[][]; sheetName?: string };

const EXCEL_EXT = [".xlsx", ".xls"];
const CSV_EXT = [".csv"];

function getExtension(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i >= 0 ? fileName.slice(i).toLowerCase() : "";
}

function bufferToRowsFromExcel(buffer: Buffer): string[][] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return [];
  const aoa = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  return aoa.map((row) => (Array.isArray(row) ? row.map(String) : [String(row)]));
}

function bufferToRowsFromCsv(buffer: Buffer): string[][] {
  const text = buffer.toString("utf-8");
  const sep = text.includes(";") ? ";" : ",";
  const records = parse(text, {
    delimiter: sep,
    relax_column_count: true,
    skip_empty_lines: true,
    bom: true,
    columns: false,
  }) as string[][];
  return records;
}

export function parseFile(buffer: Buffer, fileName: string): ParseResult {
  const ext = getExtension(fileName);
  if (EXCEL_EXT.some((e) => ext === e)) {
    const rows = bufferToRowsFromExcel(buffer);
    return { rows };
  }
  if (CSV_EXT.some((e) => ext === e)) {
    const rows = bufferToRowsFromCsv(buffer);
    return { rows };
  }
  throw new Error("Nieobsługiwany format pliku. Użyj .xlsx, .xls lub .csv");
}
