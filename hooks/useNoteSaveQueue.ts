"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Write = () => Promise<unknown>;

// Keep writes ordered across note changes. Failed writes stay at the front
// until the clinician retries, preserving the order of subsequent edits.
export function useNoteSaveQueue() {
  const queue = useRef<{ key: string; write: Write }[]>([]);
  const running = useRef<Promise<boolean> | null>(null);
  const [state, setState] = useState<"saved" | "saving" | "failed">("saved");
  const flush = useCallback(function drain(): Promise<boolean> {
    if (running.current) return running.current;
    if (!queue.current.length) return Promise.resolve(true);
    setState("saving");
    running.current = Promise.resolve().then(async () => {
      try {
        while (queue.current.length) {
          await queue.current[0].write();
          queue.current.shift();
        }
        setState("saved");
        return true;
      } catch {
        setState("failed");
        toast.error("Couldn’t save note", { action: { label: "Retry", onClick: () => { void drain(); } } });
        return false;
      } finally {
        running.current = null;
      }
    });
    return running.current;
  }, []);
  const enqueue = useCallback((key: string, write: Write) => {
    // While one snapshot saves, keep just the latest pending snapshot of
    // each field on each record. Never replace the write already in flight.
    const pending = queue.current.find((item, index) => index > 0 && item.key === key);
    if (pending) pending.write = write;
    else queue.current.push({ key, write });
    void flush();
  }, [flush]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (queue.current.length) { event.preventDefault(); event.returnValue = ""; }
    };
    const beforeAction = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("a,button") : null;
      if (!queue.current.length || !target || target.closest("#note-editor") || event.defaultPrevented) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void flush().then(saved => { if (saved && target.isConnected) target.click(); });
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeAction, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", beforeAction, true);
    };
  }, [flush]);
  return { state, enqueue, retry: flush };
}
