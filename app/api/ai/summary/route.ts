import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Claude Haiku 4.5 — fast, inexpensive, and strong on clinical language.
// Swapping providers later only means changing this file.
const MODEL = 'claude-haiku-4-5';

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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI summaries are not configured (missing ANTHROPIC_API_KEY)' },
      { status: 503 }
    );
  }

  const { noteText, noteTitle, patientFocus } = await req.json().catch(() => ({}));
  if (typeof noteText !== 'string' || !noteText.trim()) {
    return NextResponse.json({ error: 'Note is empty — write the session record first' }, { status: 400 });
  }

  const context = [
    noteTitle ? `Note title: ${noteTitle}` : null,
    patientFocus ? `Presenting focus: ${patientFocus}` : null,
    `Session note:\n${noteText.slice(0, 24_000)}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Draft a summary of this session note.\n\n${context}` }],
    });

    const draft = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    if (!draft) {
      return NextResponse.json({ error: 'The model returned an empty draft' }, { status: 502 });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'Invalid Anthropic API key' }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'AI is busy right now — try again in a moment' }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error:', error.status, error.message);
      return NextResponse.json({ error: 'AI summary failed' }, { status: 502 });
    }
    console.error('AI summary error:', error);
    return NextResponse.json({ error: 'AI summary failed' }, { status: 500 });
  }
}
