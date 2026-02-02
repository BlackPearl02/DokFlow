"use client";

/**
 * Helper do trackowania eventów w Supabase
 * Bezpiecznie działa nawet jeśli Supabase nie jest skonfigurowany
 */
export async function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Nie trackuj w development (opcjonalnie)
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "true") {
    console.log("Analytics (disabled):", eventName, properties);
    return;
  }

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        properties: properties || {},
      }),
    });
  } catch (error) {
    // Silent fail - nie przerywaj działania aplikacji
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics tracking failed:", error);
    }
  }
}

/**
 * Trackowanie uploadu pliku
 */
export async function trackFileUpload(fileName: string, fileType: string, fileSize: number) {
  await trackEvent("file_uploaded", {
    file_name: fileName,
    file_type: fileType,
    file_size: fileSize,
    file_extension: fileName.split(".").pop()?.toLowerCase(),
  });
}

/**
 * Trackowanie błędu parsowania
 */
export async function trackParseError(error: string, fileName?: string) {
  await trackEvent("parse_error", {
    error_message: error,
    file_name: fileName,
  });
}

/**
 * Trackowanie eksportu CSV
 */
export async function trackCsvExport(properties: {
  convertToPln?: boolean;
  currency?: string;
  exchangeRate?: number;
  rowCount?: number;
}) {
  await trackEvent("csv_exported", properties);
}

/**
 * Trackowanie zmiany nagłówka
 */
export async function trackHeaderRowChange(newHeaderRowIndex: number) {
  await trackEvent("header_row_changed", {
    header_row_index: newHeaderRowIndex,
  });
}

/**
 * Trackowanie pageview
 */
export async function trackPageView(path: string) {
  await trackEvent("pageview", {
    path,
  });
}

