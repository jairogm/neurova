import { unstable_cache } from "next/cache";

// Only these fictional excerpts may be sent from the public product demo.
const samples = new Map([
  ["n1", "Client reports a marked reduction in anticipatory anxiety this week. Completed all exposure homework."],
  ["n2", "Updated goals around social avoidance. Introduced graded exposure hierarchy and weekly tracking."],
  ["n3", "Reviewed sleep hygiene. Mood stable. Continued cognitive restructuring on catastrophic thoughts."],
  ["n4", "Presenting concern: generalized anxiety with somatic symptoms. No prior therapy. Goals discussed."],
]);

const summarize = unstable_cache(async (excerpt: string) => {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({ contents: [{ parts: [{ text: "Summarize this fictional product-demo excerpt in one or two sentences. Use only stated facts, without advice or a preamble.\n" + excerpt }] }] }),
  });
  if (!response.ok) throw new Error("Generation unavailable");
  const result = await response.json();
  const draft = result.candidates?.[0]?.content?.parts?.find((part: { text?: string; thought?: boolean }) => part.text && !part.thought)?.text?.trim();
  if (!draft) throw new Error("Empty response");
  return draft as string;
}, ["fictional-demo-summary-v1"], { revalidate: 86400 });

export async function GET(request: Request) {
  const excerpt = samples.get(new URL(request.url).searchParams.get("sample") ?? "");
  if (!excerpt) return Response.json({ error: "Choose one of the original sample records." }, { status: 400 });
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("Missing key");
    return Response.json({ draft: await summarize(excerpt) });
  } catch {
    return Response.json({ error: "The demo summary is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
