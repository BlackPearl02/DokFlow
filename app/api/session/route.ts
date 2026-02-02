/**
 * GET /api/session?sessionId=... — return preview and suggestions for mapping page.
 * PUT /api/session — update headerRowIndex in session.
 * NO FILE STORAGE — data only in memory.
 */

import { NextRequest, NextResponse } from "next/server";
import * as sessionStore from "@/lib/session-store";
import { suggestMappings, getColumnLabels } from "@/lib/heuristics";

const PREVIEW_ROWS = 20;

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "Brak sessionId." }, { status: 400 });
  }

  const session = sessionStore.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Sesja wygasła lub nie istnieje." }, { status: 404 });
  }

  const { rawRows, headerRowIndex, fileName } = session;
  const suggestedMappings = suggestMappings(rawRows, headerRowIndex);
  const columnLabels = getColumnLabels(rawRows, headerRowIndex);
  const dataStart = headerRowIndex + 1;
  // Pokaż wszystkie wiersze przed dataStart + PREVIEW_ROWS wierszy danych
  // Ale maksymalnie 100 wierszy, żeby nie przeciążać
  const maxPreviewRows = Math.min(100, dataStart + PREVIEW_ROWS);
  const previewRows = rawRows.slice(0, maxPreviewRows);

  return NextResponse.json({
    previewRows,
    suggestedMappings,
    columnLabels,
    headerRowIndex,
    fileName: fileName ?? undefined,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, headerRowIndex } = body;

    if (!sessionId || typeof headerRowIndex !== "number") {
      return NextResponse.json({ error: "Brak sessionId lub headerRowIndex." }, { status: 400 });
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Sesja wygasła lub nie istnieje." }, { status: 404 });
    }

    if (headerRowIndex < 0 || headerRowIndex >= session.rawRows.length) {
      return NextResponse.json({ error: "Nieprawidłowy indeks wiersza nagłówka." }, { status: 400 });
    }

    sessionStore.update(sessionId, { headerRowIndex });

    // Zwróć zaktualizowane dane
    const updatedSession = sessionStore.get(sessionId)!;
    const { rawRows, fileName } = updatedSession;
    const suggestedMappings = suggestMappings(rawRows, headerRowIndex);
    const columnLabels = getColumnLabels(rawRows, headerRowIndex);
    const dataStart = headerRowIndex + 1;
    // Pokaż wszystkie wiersze przed dataStart + PREVIEW_ROWS wierszy danych
    // Ale maksymalnie 100 wierszy, żeby nie przeciążać
    const maxPreviewRows = Math.min(100, dataStart + PREVIEW_ROWS);
    const previewRows = rawRows.slice(0, maxPreviewRows);

    return NextResponse.json({
      previewRows,
      suggestedMappings,
      columnLabels,
      headerRowIndex,
      fileName: fileName ?? undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Błąd aktualizacji sesji.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
