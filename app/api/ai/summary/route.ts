import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a clinical documentation assistant for NEUROVA, a platform used by licensed mental-health professionals. You draft concise summaries of therapy session notes.

Rules:
- Write a single paragraph of 3-5 sentences in a professional clinical register, matching the language of the note (e.g. reply in Spanish if the note is in Spanish).
- Summarize only what is in the note: reported symptoms and progress, interventions used, homework/plan, and suggested focus for the next session when present.
- Never invent clinical details, diagnoses, or recommendations that are not supported by the note.
- Do not include any preamble like "Here is the summary" — return only the summary text itself.
- The draft will be reviewed by the treating clinician before being added to the record.`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.CLINICAL_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI summaries are not configured for this workspace' },
      { status: 503 }
    );
  }

  const { noteText, noteTitle, patientFocus } = (await req.json().catch(() => null)) ?? {};
  if (typeof noteText !== 'string' || !noteText.trim()) {
    return NextResponse.json({ error: 'Note is empty — write the session record first' }, { status: 400 });
  }

  const context = [
    typeof noteTitle === 'string' ? `Note title: ${noteTitle.slice(0, 300)}` : null,
    typeof patientFocus === 'string' ? `Presenting focus: ${patientFocus.slice(0, 1000)}` : null,
    `Session note:\n${noteText.slice(0, 24_000)}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(25000),
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: context }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    });

    if (response.status === 429) {
      return NextResponse.json({ error: "AI is busy. Please try again shortly." }, { status: 429 });
    }
    if (!response.ok) throw new Error("Generation unavailable");
    const result = await response.json();
    const candidate = result.candidates?.[0];
    const parts: { text?: string; thought?: boolean }[] = candidate?.content?.parts ?? [];
    const draft = parts.filter(part => !part.thought).map(part => part.text ?? "").join("").trim();
    if (candidate?.finishReason !== "STOP" || !draft) throw new Error("Incomplete draft");

    return NextResponse.json({ draft }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not generate a summary. Please try again." }, { status: 502 });
  }
}
