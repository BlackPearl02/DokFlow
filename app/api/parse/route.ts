/**
 * POST /api/parse — upload file, parse in memory, store in session.
 * NO FILE STORAGE — data only in memory, cleared after export or TTL.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import * as sessionStore from "@/lib/session-store";
import { parseFile } from "@/lib/parser";
import { suggestMappings, getColumnLabels } from "@/lib/heuristics";

const PREVIEW_ROWS = 20;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Brak pliku lub plik jest pusty." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.toLowerCase().endsWith(".xml") ? ".xml" : 
                file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls") ? ".xlsx" : ".csv";
    
    const { rows, xmlSections, excelSheets } = parseFile(buffer, file.name);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Plik nie zawiera danych." }, { status: 400 });
    }

    // Domyślnie używamy pierwszego wiersza jako nagłówka (indeks 0)
    const headerRowIndex = 0;

    const sessionId = randomUUID();
    sessionStore.set(sessionId, {
      rawRows: rows,
      headerRowIndex,
      fileName: file.name,
      createdAt: Date.now(),
      // Przechowuj buffer XML tylko dla plików XML
      xmlBuffer: ext === ".xml" ? buffer : undefined,
      xmlSections: xmlSections,
      // Przechowuj buffer Excel tylko dla plików Excel
      excelBuffer: ext === ".xlsx" ? buffer : undefined,
      excelSheets: excelSheets,
    });

    const suggestedMappings = suggestMappings(rows, headerRowIndex);
    const columnLabels = getColumnLabels(rows, headerRowIndex);
    const dataStart = headerRowIndex + 1;
    // Pokaż wszystkie wiersze przed dataStart + PREVIEW_ROWS wierszy danych
    // Ale maksymalnie 100 wierszy, żeby nie przeciążać
    const maxPreviewRows = Math.min(100, dataStart + PREVIEW_ROWS);
    const previewRows = rows.slice(0, maxPreviewRows);

    return NextResponse.json({
      sessionId,
      previewRows,
      suggestedMappings,
      columnLabels,
      headerRowIndex,
      xmlSections: xmlSections,
      excelSheets: excelSheets,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Błąd parsowania pliku.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
