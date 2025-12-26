import { createClient } from "./client";
import type { OutputData } from "@editorjs/editorjs";

interface UpdateMedicalHistoryNoteParams {
  id: string;
  title: string;
  date: string;
  content: OutputData;
  description: string;
}

export async function updateMedicalHistoryNote(
  params: UpdateMedicalHistoryNoteParams
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("medical_history_notes")
    .update({
      title: params.title,
      date: params.date,
      content: params.content,
      description: params.description,
    })
    .eq("id", params.id);

  if (error) throw error;
}
