import { cache } from "react";
import spanishCopy from "@/messages/landing-es.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

export const getLanding = cache((locale: string) => {
  const markup = getLandingMarkup(locale);
  const styles = markup.match(/<style>[\s\S]*?<\/style>/)?.[0];
  const header = markup.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  const footer = markup.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  if (!styles || !header || !footer) throw new Error("Incomplete landing page template");
  const content = markup.slice(markup.indexOf(header) + header.length, markup.indexOf(footer));
  const homeLinks = (html: string) => html.replaceAll('href="#', 'href="/#');
  return { styles, header: homeLinks(header), footer: homeLinks(footer), content };
});
