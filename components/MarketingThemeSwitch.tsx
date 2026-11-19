"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function MarketingThemeSwitch({ spanish }: { spanish: boolean }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => setSlot(document.getElementById("marketing-theme")), []);
  useEffect(() => {
    const menu = document.querySelector<HTMLDetailsElement>(".mobile-links");
    if (!menu) return;
    const close = (event: MouseEvent) => {
      if (event.target instanceof Element && !event.target.closest(".mobile-links summary")) menu.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", escape);
    };
  }, [spanish]);
  const dark = resolvedTheme === "dark";
  const label = spanish ? "Modo oscuro" : "Dark mode";
  return slot && createPortal(
    <button type="button" aria-label={label} aria-pressed={dark} title={label}
      onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>, slot);
}
