import { createClient } from "@/lib/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePatient(id: string, updates: Record<string, any>) {
  const supabase = createClient();

  // Get current therapist ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();
  
  if (!therapist) throw new Error("Therapist profile not found");

  const { data, error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", id)
    .eq("therapist_id", therapist.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
