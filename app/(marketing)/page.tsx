import { getLanding } from "@/lib/landing";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NEUROVA | A calmer command center for your practice",
  description:
    "Practice management for mental-health clinicians: scheduling, patients, notes, payments, and clinical records.",
};

export default async function Home() {
  const { content } = getLanding(await getLocale());
  return <main className="landing-home" dangerouslySetInnerHTML={{ __html: content }} />;
}
