
"use client";
import { useEffect } from "react";

export function usePageView(eventName: string = "page_view") {
  useEffect(() => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: eventName, path: window.location.pathname })
    }).catch(() => {});
  }, [eventName]);
}
