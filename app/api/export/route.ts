/**
 * POST /api/export — generate CSV from session, then destroy session.
 * NO FILE STORAGE — no logs of file contents. Data deleted after export.
 */

import { NextRequest, NextResponse } from "next/server";
import * as sessionStore from "@/lib/session-store";
import { generateErpCsv } from "@/lib/export-csv";
import { REQUIRED_FIELDS, type ErpField } from "@/lib/erp-schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, mappings, convertToPln, exchangeRate, currency } = body as {
      sessionId?: string;
      mappings?: Record<ErpField, number | null>;
      convertToPln?: boolean;
      exchangeRate?: number;
      currency?: string;
    };

    if (!sessionId || !mappings) {
      return NextResponse.json(
        { error: "Brak sessionId lub mappings." },
        { status: 400 }
      );
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Sesja wygasła lub nie istnieje." }, { status: 404 });
    }

    for (const field of REQUIRED_FIELDS) {
      const col = mappings[field];
      if (col == null || col < 0) {
        return NextResponse.json(
          { error: `Wymagane pole "${field}" nie jest zmapowane.` },
          { status: 400 }
        );
      }
    }

    const normalizedMappings: Record<ErpField, number | null> = {
      symbol: mappings.symbol ?? null,
      ilosc: mappings.ilosc ?? null,
      cenaJedn: mappings.cenaJedn ?? null,
    };

    const csv = generateErpCsv(
      session.rawRows,
      session.headerRowIndex,
      normalizedMappings,
      {
        convertToPln: convertToPln === true,
        exchangeRate,
      }
    );

    sessionStore.remove(sessionId);

    return NextResponse.json({ csv });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Błąd eksportu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
