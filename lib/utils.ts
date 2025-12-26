import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .join("")
    .slice(0, 2); // In case of middle names
}

export function calculateAge(dateString: string): number {
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function formatLocalDateTime(date: Date) {
  return date.toISOString();
}

export function formatDateOfBirth(dateString?: string): string {
  if (!dateString) return "--";

  // Parse date as local date to avoid timezone issues
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return "Invalid date";

  const date = new Date(year, month - 1, day); // month is 0-indexed
  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const medicalHistoryLabels: Record<string, string> = {
  expectations: "Expectations with therapy",
  mainTopic: "Why? - Main reason for consultation",
  symptoms: "Symptoms",
  familyInfo: "Family Information",
  diagnosis: "Diagnosis",
};

// Helper function to add 1 hour to a time string (HH:MM format)
export function addOneHour(timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const newTotalMinutes = totalMinutes + 60;
  const newHours = Math.floor(newTotalMinutes / 60) % 24; // Handle overflow past 24:00
  const newMinutes = newTotalMinutes % 60;

  return `${newHours.toString().padStart(2, "0")}:${newMinutes
    .toString()
    .padStart(2, "0")}`;
}
