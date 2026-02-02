/**
 * GET /api/session?sessionId=... — return preview and suggestions for mapping page.
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
  const previewRows = rawRows.slice(0, dataStart + PREVIEW_ROWS);

  return NextResponse.json({
    previewRows,
    suggestedMappings,
    columnLabels,
    headerRowIndex,
    fileName: fileName ?? undefined,
  });
}
