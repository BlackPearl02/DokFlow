/**
 * POST /api/analytics — track events in Supabase
 * Anonymous tracking - no authentication required
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicjalizacja Supabase tylko jeśli klucze są dostępne
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  // Jeśli Supabase nie jest skonfigurowany, po prostu zwróć sukces (silent fail)
  if (!supabase) {
    return NextResponse.json({ success: true, message: "Analytics disabled" });
  }

  try {
    const body = await request.json();
    const { event_name, properties } = body as {
      event_name?: string;
      properties?: Record<string, any>;
    };

    if (!event_name) {
      return NextResponse.json({ error: "Brak event_name." }, { status: 400 });
    }

    // Pobierz IP i User-Agent dla kontekstu (anonimowo)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Zapisz event do Supabase
    const { error } = await supabase.from("analytics_events").insert({
      event_name,
      properties: properties || {},
      ip_address: ip,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Analytics error:", error);
      // Nie zwracaj błędu do klienta - silent fail
      return NextResponse.json({ success: false, error: "Failed to track" });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics route error:", err);
    // Silent fail - nie przerywaj działania aplikacji
    return NextResponse.json({ success: false });
  }
}

