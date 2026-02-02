/**
 * Parse Excel/CSV/XML in memory. NO FILE STORAGE — buffer only, no disk write.
 */

import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";

export type ParseResult = { 
  rows: string[][]; 
  sheetName?: string;
  xmlSections?: Array<{ name: string; path: string[]; size: number }>;
  excelSheets?: Array<{ name: string; index: number }>;
};

const EXCEL_EXT = [".xlsx", ".xls"];
const CSV_EXT = [".csv"];
const XML_EXT = [".xml"];

function getExtension(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i >= 0 ? fileName.slice(i).toLowerCase() : "";
}

function bufferToRowsFromExcel(
  buffer: Buffer,
  selectedSheetIndex?: number
): { rows: string[][]; sheets: Array<{ name: string; index: number }> } {
  const workbook = XLSX.read(buffer, { 
    type: "buffer", 
    cellDates: false,
    // Opcje dla lepszej obsługi formuł i scalonych komórek
    cellFormula: false, // Nie zwracaj formuł, tylko wartości obliczone
    cellStyles: false, // Nie potrzebujemy stylów
    sheetStubs: false, // Pomiń puste arkusze
  });

  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    return { rows: [], sheets: [] };
  }

  // Utwórz listę dostępnych arkuszy
  const sheets = sheetNames.map((name, index) => ({
    name,
    index,
  }));

  // Wybierz arkusz do parsowania
  let sheetIndex = selectedSheetIndex ?? 0;
  if (sheetIndex < 0 || sheetIndex >= sheetNames.length) {
    sheetIndex = 0; // Fallback do pierwszego arkusza
  }

  const selectedSheet = workbook.Sheets[sheetNames[sheetIndex]];
  if (!selectedSheet) {
    return { rows: [], sheets };
  }

  // Konwertuj arkusz do tablicy tablic
  // raw: false - zwraca wartości obliczone z formuł (nie same formuły)
  // defval: "" - domyślna wartość dla pustych komórek
  // blankrows: false - pomiń całkowicie puste wiersze
  const aoa = XLSX.utils.sheet_to_json<string[]>(selectedSheet, {
    header: 1,
    defval: "",
    raw: false, // Zwraca wartości obliczone, nie formuły
    blankrows: false, // Pomiń puste wiersze
  });

  // Obsługa scalonych komórek - XLSX automatycznie wypełnia scalone komórki
  // wartością z pierwszej komórki, więc nie musimy tego robić ręcznie

  const rows = aoa.map((row) => (Array.isArray(row) ? row.map(String) : [String(row)]));

  return { rows, sheets };
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

function bufferToRowsFromXml(
  buffer: Buffer,
  selectedSectionPath?: string[]
): { rows: string[][]; sections: Array<{ name: string; path: string[]; size: number }> } {
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

  // Typ dla sekcji z tablicą elementów
  type ArraySection = {
    elements: any[];
    keys: string[];
    path: string[];
    name: string;
    size: number;
  };

  // Znajdź wszystkie sekcje z tablicami elementów
  function findAllArraySections(
    obj: any,
    path: string[] = []
  ): ArraySection[] {
    const sections: ArraySection[] = [];

    if (obj == null) return sections;

    // Jeśli obiekt jest tablicą, użyj jej
    if (Array.isArray(obj)) {
      if (obj.length === 0) return sections;
      const first = obj[0];
      const keys = new Set<string>();
      if (typeof first === "object" && first !== null) {
        Object.keys(first).forEach((k) => {
          if (!k.startsWith("@_") && k !== "#text") {
            keys.add(k);
          }
        });
      }
      const sectionName = path.length > 0 ? path[path.length - 1] : "root";
      sections.push({
        elements: obj,
        keys: Array.from(keys),
        path,
        name: sectionName,
        size: obj.length,
      });
      return sections;
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
            sections.push({
              elements: value,
              keys: Array.from(keys),
              path: [...path, key],
              name: key,
              size: value.length,
            });
            // Kontynuuj szukanie, nie zwracaj od razu - znajdź wszystkie sekcje
          }
        }

        // Rekurencyjnie szukaj głębiej
        const nestedSections = findAllArraySections(value, [...path, key]);
        sections.push(...nestedSections);
      }
    }

    return sections;
  }

  const allSections = findAllArraySections(parsed);

  if (allSections.length === 0) {
    throw new Error("Nie znaleziono powtarzających się elementów w XML (np. produkty, pozycje).");
  }

  // Znajdź wybraną sekcję lub wybierz domyślną
  let selectedSection: ArraySection;
  
  if (selectedSectionPath && selectedSectionPath.length > 0) {
    // Znajdź sekcję pasującą do wybranej ścieżki
    const pathStr = JSON.stringify(selectedSectionPath);
    const found = allSections.find((s) => JSON.stringify(s.path) === pathStr);
    if (found) {
      selectedSection = found;
    } else {
      // Jeśli nie znaleziono, użyj pierwszej
      selectedSection = allSections[0];
    }
  } else {
    // Wybierz sekcję do użycia:
    // 1. Jeśli jest tylko jedna sekcja, użyj jej
    // 2. Jeśli jest więcej, preferuj sekcję z największą liczbą elementów
    // 3. W przypadku remisu, preferuj sekcje typu "products", "produkty", "items", "pozycje"
    const preferredNames = ["products", "produkty", "items", "pozycje", "product", "item"];
    
    selectedSection = allSections[0];
    
    if (allSections.length > 1) {
      // Najpierw szukaj sekcji z preferowanymi nazwami
      const preferred = allSections.find((s) =>
        preferredNames.some((name) => s.name.toLowerCase().includes(name.toLowerCase()))
      );
      
      if (preferred) {
        selectedSection = preferred;
      } else {
        // Jeśli nie ma preferowanej, wybierz największą
        selectedSection = allSections.reduce((max, section) =>
          section.size > max.size ? section : max
        );
      }
    }
  }

  const { elements, keys } = selectedSection;
  
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

  return {
    rows: [headerRow, ...dataRows],
    sections: allSections.map((s) => ({
      name: s.name,
      path: s.path,
      size: s.size,
    })),
  };
}

export function parseFile(
  buffer: Buffer,
  fileName: string,
  xmlSectionPath?: string[],
  excelSheetIndex?: number
): ParseResult {
  const ext = getExtension(fileName);
  if (EXCEL_EXT.some((e) => ext === e)) {
    const { rows, sheets } = bufferToRowsFromExcel(buffer, excelSheetIndex);
    return { rows, excelSheets: sheets, sheetName: sheets[excelSheetIndex ?? 0]?.name };
  }
  if (CSV_EXT.some((e) => ext === e)) {
    const rows = bufferToRowsFromCsv(buffer);
    return { rows };
  }
  if (XML_EXT.some((e) => ext === e)) {
    const { rows, sections } = bufferToRowsFromXml(buffer, xmlSectionPath);
    return { rows, xmlSections: sections };
  }
  throw new Error("Nieobsługiwany format pliku. Użyj .xlsx, .xls, .csv lub .xml");
}
