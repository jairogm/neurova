import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const metadata: Metadata = {
  title: "NEUROVA | Your practice, in one place",
  description:
    "Practice management for mental-health clinicians: scheduling, patients, notes, payments, and clinician-reviewed AI assistance.",
};

function getLandingMarkup() {
  const source = readFileSync(
    join(process.cwd(), "NEUROVA Landing.dc.html"),
    "utf8",
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
