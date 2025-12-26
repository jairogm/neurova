import { createClient } from "./client";
import { TherapistProfile } from "../types";

export async function getTherapistProfile(): Promise<TherapistProfile | null> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  if (error) {
    if (error.code === "PGRST116") {
      // No therapist profile found, return null to create one
      return null;
    }
    throw new Error(error.message);
  }
  
  return data as TherapistProfile;
}