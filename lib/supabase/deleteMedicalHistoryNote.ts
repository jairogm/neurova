import { createClient } from "./client";

export async function deleteMedicalHistoryNote(noteId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("medical_history_notes")
    .delete()
    .eq("id", noteId);

  if (error) throw error;
}
