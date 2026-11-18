"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function MarketingThemeSwitch({ spanish }: { spanish: boolean }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => setSlot(document.getElementById("marketing-theme")), []);
  const dark = resolvedTheme === "dark";
  const label = spanish ? "Modo oscuro" : "Dark mode";
  return slot && createPortal(
    <button type="button" aria-label={label} aria-pressed={dark} title={label}
      onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>, slot);
}
