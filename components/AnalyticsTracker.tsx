"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Komponent do automatycznego trackowania pageview
 * Używa Next.js App Router hooks
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let path = pathname;
      if (searchParams && searchParams.toString()) {
        path = `${path}?${searchParams.toString()}`;
      }
      trackPageView(path);
    }
  }, [pathname, searchParams]);

  return null;
}

