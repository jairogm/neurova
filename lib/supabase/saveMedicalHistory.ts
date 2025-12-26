import { updatePatient } from "./updatePatient";

export async function saveMedicalHistory(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medicalHistory: Record<string, any>
) {
  return await updatePatient(id, { medical_history: medicalHistory });
}
