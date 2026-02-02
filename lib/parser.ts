/**
 * Parse Excel/CSV/XML in memory. NO FILE STORAGE — buffer only, no disk write.
 */

import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";

export type ParseResult = { rows: string[][]; sheetName?: string };

const EXCEL_EXT = [".xlsx", ".xls"];
const CSV_EXT = [".csv"];
const XML_EXT = [".xml"];

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

function bufferToRowsFromXml(buffer: Buffer): string[][] {
  const text = buffer.toString("utf-8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseAttributeValue: false,
    trimValues: true,
  });

  let parsed: any;
  try {
    parsed = parser.parse(text);
  } catch (err) {
    throw new Error("Nieprawidłowy format XML.");
  }

  // Znajdź elementy powtarzające się (produkty, pozycje, itp.)
  // Przeszukaj strukturę XML aby znaleźć tablicę elementów
  function findArrayElements(obj: any, path: string[] = []): { elements: any[]; keys: string[] } | null {
    if (obj == null) return null;
    
    // Jeśli obiekt jest tablicą, użyj jej
    if (Array.isArray(obj)) {
      if (obj.length === 0) return null;
      // Zbierz wszystkie klucze z pierwszego elementu
      const first = obj[0];
      const keys = new Set<string>();
      if (typeof first === "object" && first !== null) {
        Object.keys(first).forEach((k) => {
          if (!k.startsWith("@_") && k !== "#text") {
            keys.add(k);
          }
        });
      }
      return { elements: obj, keys: Array.from(keys) };
    }

    // Jeśli obiekt ma właściwości, sprawdź czy któraś jest tablicą
    if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith("@_") || key === "#text") continue;
        
        if (Array.isArray(value) && value.length > 0) {
          // Sprawdź czy elementy tablicy są obiektami
          const first = value[0];
          if (typeof first === "object" && first !== null) {
            const keys = new Set<string>();
            Object.keys(first).forEach((k) => {
              if (!k.startsWith("@_") && k !== "#text") {
                keys.add(k);
              }
            });
            return { elements: value, keys: Array.from(keys) };
          }
        }
        
        // Rekurencyjnie szukaj głębiej
        const result = findArrayElements(value, [...path, key]);
        if (result) return result;
      }
    }

    return null;
  }

  const result = findArrayElements(parsed);
  
  if (!result || result.elements.length === 0) {
    throw new Error("Nie znaleziono powtarzających się elementów w XML (np. produkty, pozycje).");
  }

  const { elements, keys } = result;
  
  // Utwórz nagłówek z nazwami kolumn
  const headerRow = keys.map((k) => {
    // Przekształć nazwy na bardziej czytelne
    const normalized = k
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
    return normalized || k;
  });

  // Utwórz wiersze danych
  const dataRows: string[][] = [];
  for (const element of elements) {
    const row: string[] = [];
    for (const key of keys) {
      const value = element[key];
      let cellValue = "";
      
      if (value != null) {
        if (typeof value === "object") {
          // Jeśli wartość jest obiektem, spróbuj wyciągnąć tekst
          if (value["#text"] != null) {
            cellValue = String(value["#text"]);
          } else if (Array.isArray(value)) {
            cellValue = value.map(String).join(", ");
          } else {
            // Spróbuj wyciągnąć wszystkie wartości
            const parts: string[] = [];
            for (const [k, v] of Object.entries(value)) {
              if (k !== "@_" && typeof v === "string") {
                parts.push(v);
              } else if (v != null && typeof v !== "object") {
                parts.push(String(v));
              }
            }
            cellValue = parts.join(" ");
          }
        } else {
          cellValue = String(value);
        }
      }
      
      row.push(cellValue.trim());
    }
    dataRows.push(row);
  }

  return [headerRow, ...dataRows];
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
  if (XML_EXT.some((e) => ext === e)) {
    const rows = bufferToRowsFromXml(buffer);
    return { rows };
  }
  throw new Error("Nieobsługiwany format pliku. Użyj .xlsx, .xls, .csv lub .xml");
}
