/**
 * GET /api/nbp-exchange-rate?currency=EUR — get exchange rate from NBP API.
 * Returns exchange rate for given currency to PLN.
 */

import { NextRequest, NextResponse } from "next/server";

const NBP_API_BASE = "https://api.nbp.pl/api/exchangerates/rates/a";

export async function GET(request: NextRequest) {
  try {
    const currency = request.nextUrl.searchParams.get("currency");
    if (!currency) {
      return NextResponse.json({ error: "Brak parametru currency." }, { status: 400 });
    }

    const currencyUpper = currency.toUpperCase();
    
    // PLN nie wymaga przeliczenia
    if (currencyUpper === "PLN") {
      return NextResponse.json({ rate: 1, currency: "PLN" });
    }

    // Pobierz kurs z NBP API
    const url = `${NBP_API_BASE}/${currencyUpper}/?format=json`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Nie znaleziono kursu dla waluty ${currencyUpper}.` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Błąd pobierania kursu z NBP." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rate = data.rates?.[0]?.mid;

    if (!rate || typeof rate !== "number") {
      return NextResponse.json(
        { error: "Nieprawidłowy format odpowiedzi z NBP." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rate,
      currency: currencyUpper,
      date: data.rates?.[0]?.effectiveDate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Błąd połączenia z NBP.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

