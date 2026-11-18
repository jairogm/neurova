// Public demo records use fixed drafts so requests never invoke a model.
const drafts = new Map([
  ["n1", "The client reported less anticipatory anxiety this week and completed all assigned exposure homework."],
  ["n2", "The treatment plan updates goals for social avoidance and introduces a graded exposure hierarchy with weekly tracking."],
  ["n3", "Mood remained stable. The session covered sleep hygiene and continued work on reframing catastrophic thoughts."],
  ["n4", "At intake, the client described generalized anxiety with physical symptoms and reported no prior therapy. Treatment goals were discussed."],
]);

export function GET(request: Request) {
  const draft = drafts.get(new URL(request.url).searchParams.get("sample") ?? "");
  if (!draft) {
    return Response.json({ error: "Choose one of the original sample records." }, { status: 400 });
  }
  return Response.json({ draft });
}
