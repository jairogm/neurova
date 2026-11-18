import { getLocale } from "next-intl/server";
import spanishCopy from "@/messages/landing-es.json";
import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const metadata: Metadata = {
  title: "NEUROVA | A calmer command center for your practice",
  description:
    "Practice management for mental-health clinicians: scheduling, patients, notes, payments, and clinician-reviewed AI assistance.",
};

function getLandingMarkup(locale: string) {
  const source = readFileSync(
    join(process.cwd(), "NEUROVA Landing.dc.html"),
    "utf8",
  )
    .replaceAll("NEUROVA Login.dc.html", "/auth/login")
    .replaceAll(
      'href="NEUROVA.dc.html"',
      'href="/demo" target="_blank" rel="noreferrer"',
    );

  const match = source.match(/<x-dc>([\s\S]*?)<\/x-dc>/);

  if (!match) {
    throw new Error("Could not read the NEUROVA landing design export.");
  }

  if (locale !== "es") return match[1];
  const translations: Record<string, string> = spanishCopy;
  return match[1]
    .replace(/>([^<>]+)</g, (node, text: string) => {
      const key = text.trim();
      return Object.prototype.hasOwnProperty.call(translations, key) ? node.replace(key, translations[key]) : node;
    })
    .replace('aria-label="Language"', 'aria-label="Idioma"')
    .replace('aria-label="Explore the interactive NEUROVA dashboard"', 'aria-label="Explorar la demo interactiva de NEUROVA"')
    .replace('alt="Demo dashboard with today’s sessions, patient counts, and tasks"', 'alt="Panel de la demo con las sesiones del día, los pacientes y las tareas"');
}

export default async function Home() {
  const locale = await getLocale();
  return (
    <div
      className="neurova-marketing-page"
      dangerouslySetInnerHTML={{ __html: getLandingMarkup(locale) }}
    />
  );
}
