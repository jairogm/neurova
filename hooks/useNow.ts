"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current timestamp, refreshed on an interval, so time-derived
 * UI (countdowns, "up next" selection) stays live without a page refresh.
 */
export function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, intervalMs);
    // Re-sync immediately when the tab becomes visible again — intervals
    // are throttled in background tabs, so the countdown could be stale.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return now;
}
