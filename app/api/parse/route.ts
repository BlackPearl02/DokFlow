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
    const headerRowIndexRaw = formData.get("headerRowIndex");
    const headerRowIndex = Math.max(0, parseInt(String(headerRowIndexRaw ?? "1"), 10) - 1);

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Brak pliku lub plik jest pusty." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { rows } = parseFile(buffer, file.name);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Plik nie zawiera danych." }, { status: 400 });
    }

    const sessionId = randomUUID();
    sessionStore.set(sessionId, {
      rawRows: rows,
      headerRowIndex,
      fileName: file.name,
      createdAt: Date.now(),
    });

    const suggestedMappings = suggestMappings(rows, headerRowIndex);
    const columnLabels = getColumnLabels(rows, headerRowIndex);
    const dataStart = headerRowIndex + 1;
    const previewRows = rows.slice(0, dataStart + PREVIEW_ROWS);

    return NextResponse.json({
      sessionId,
      previewRows,
      suggestedMappings,
      columnLabels,
      headerRowIndex,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Błąd parsowania pliku.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
