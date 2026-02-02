/**
 * POST /api/export — generate CSV from session, then destroy session.
 * NO FILE STORAGE — no logs of file contents. Data deleted after export.
 */

import { NextRequest, NextResponse } from "next/server";
import * as sessionStore from "@/lib/session-store";
import { generateErpCsv } from "@/lib/export-csv";
import { REQUIRED_FIELDS, type ErpField, type TargetErp } from "@/lib/erp-schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, mappings, targetErp } = body as {
      sessionId?: string;
      mappings?: Record<ErpField, number | null>;
      targetErp?: TargetErp;
    };

    if (!sessionId || !mappings || !targetErp) {
      return NextResponse.json(
        { error: "Brak sessionId, mappings lub targetErp." },
        { status: 400 }
      );
    }

    if (targetErp !== "subiekt" && targetErp !== "optima") {
      return NextResponse.json(
        { error: "Nieprawidłowy docelowy system (subiekt lub optima)." },
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
      nazwa: mappings.nazwa ?? null,
      ilosc: mappings.ilosc ?? null,
      cenaJedn: mappings.cenaJedn ?? null,
      vat: mappings.vat ?? null,
      waluta: mappings.waluta ?? null,
    };

    const csv = generateErpCsv(
      session.rawRows,
      session.headerRowIndex,
      normalizedMappings,
      targetErp
    );

    sessionStore.remove(sessionId);

    return NextResponse.json({ csv });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Błąd eksportu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
