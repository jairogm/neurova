import { OutputData } from "@editorjs/editorjs";
import { Country } from "./constants/countries";

export type EmergencyContact = {
  name: string;
  country_code: Country;
  phone: string;
  relationship: string;
};

export type MedicalHistory = {
  expectations?: string;
  mainTopic?: string;
  symptoms?: string;
  familyInfo?: string;
  diagnosis?: string;
};

export type Patient = {
  id: string;
  name: string;
  profile_img?: string;
  date_of_birth?: string; // ISO format (e.g. "1990-05-14")
  gender?: "male" | "female" | "other";
  national_id: number;
  country_code?: Country; // Changed to store full country object as JSONB
  phone_number?: string;
  email?: string;
  city?: string;
  language?: string;
  height?: number;
  occupation?: string;
  emergency_contact?: EmergencyContact; // stored as JSONB in Supabase
  medical_history?: MedicalHistory; // stored as JSONB in Supabase
  created_at?: string;
  updated_at?: string;
};

export type MedicalHistoryNote = {
  id: string; // UUID (primary key)
  patient_id: string; // UUID referencing patients table
  title: string;
  description?: string; // Optional description field
  date: string; // ISO date string (YYYY-MM-DD or full ISO timestamp)
  content: OutputData; // JSONB data from EditorJS
  created_at?: string; // ISO timestamp
  updated_at?: string | null; // optional if you track updates
};

export type TherapistProfile = {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  license_number?: string;
  years_of_experience?: number;
  bio?: string;
  profile_image?: string;
  office_address?: string;
  country_code?: Country;
  emergency_contact?: EmergencyContact;
  occupation?: string;
  created_at?: string;
  updated_at?: string;
};

export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export type Appointment = {
  id: string;
  patient_id: string;
  therapist_id: string;
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  notes?: string;
  is_recurring: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string; // ISO date string for when recurrence ends
  created_at?: string;
  updated_at?: string;
};

export type SessionStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
export type PaymentStatus = "pending" | "paid" | "partially_paid" | "refunded";

export type Session = {
  id: string;
  patient_id: string;
  event_id?: string; // Google Calendar event ID
  scheduled_date: string; // ISO timestamp
  duration: number; // duration in minutes
  session_status: SessionStatus;
  payment_status: PaymentStatus;
  payment_amount?: number; // payment amount in dollars
  notes?: string; // session notes
  created_at?: string;
  updated_at?: string;
};
