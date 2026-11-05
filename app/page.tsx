import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const metadata: Metadata = {
  title: "NEUROVA | A calmer command center for your practice",
  description:
    "Practice management for mental-health clinicians: scheduling, patients, notes, payments, and clinician-reviewed AI assistance.",
};

function getLandingMarkup() {
  const source = readFileSync(
    join(process.cwd(), "NEUROVA Landing.dc.html"),
    "utf8",
  )
    .replaceAll("NEUROVA Login.dc.html", "/auth/login")
    .replaceAll(
      'href="NEUROVA.dc.html"',
      'href="/demo" target="_blank" rel="noreferrer"',
    )
    .replace(
      '<a href="#" style="text-decoration:none; color:var(--nv-text);">Privacy</a>',
      '<a href="/privacy" style="text-decoration:none; color:var(--nv-text);">Privacy</a>',
    )
    .replace(
      '<a href="#" style="text-decoration:none; color:var(--nv-text);">Terms</a>',
      '<a href="/terms" style="text-decoration:none; color:var(--nv-text);">Terms</a>',
    )
    .replace(
      '<a href="#" style="text-decoration:none; color:var(--nv-text);">BAA &amp; DPA</a>',
      '<a href="/baa" style="text-decoration:none; color:var(--nv-text);">BAA &amp; DPA</a>',
    );

  const match = source.match(/<x-dc>([\s\S]*?)<\/x-dc>/);

  if (!match) {
    throw new Error("Could not read the NEUROVA landing design export.");
  }

  return match[1];
}

export default function Home() {
  return (
    <div
      className="neurova-marketing-page"
      dangerouslySetInnerHTML={{ __html: getLandingMarkup() }}
    />
  );
}
