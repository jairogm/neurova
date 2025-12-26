import { Patient } from "../types";
import { createClient } from "./client";

export async function getPatients(): Promise<Patient[]> {
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
    .select(
      "id, profile_img, date_of_birth, name, gender, email, country_code, phone_number, city"
    )
    .eq("therapist_id", therapist.id);

  if (error) throw new Error(error.message);
  return data as Patient[];
}
