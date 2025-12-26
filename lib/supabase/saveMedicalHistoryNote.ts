// lib/supabase/saveMedicalHistoryNote.ts
import { createClient } from "@/lib/supabase/client";
import { OutputData } from "@editorjs/editorjs";

export async function saveMedicalHistoryNote({
  patient_id,
  title,
  description,
  date,
  content,
}: {
  patient_id: string;
  title: string;
  description?: string;
  date: string;
  content: OutputData;
}) {
  const supabase = createClient();

  const insertData: {
    patient_id: string;
    title: string;
    date: string;
    content: OutputData;
    description?: string;
  } = {
    patient_id,
    title,
    date,
    content,
  };

  // Only include description if it's provided
  if (description) {
    insertData.description = description;
  }

  const { data, error } = await supabase
    .from("medical_history_notes")
    .insert([insertData])
    .select("id") // important to return the id
    .single();    // ensures we get a single row, not an array

  if (error) throw error;

  return { id: data.id };
}
