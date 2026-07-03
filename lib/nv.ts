// Shared NEUROVA design tokens and helpers (mirrors NEUROVA.dc.html).

export const avatarPalette = [
  "#0E96B8", "#2C8FB0", "#5C8A7A", "#8A6BA8",
  "#B5803A", "#3F7E8C", "#9A6470", "#5677A8",
];

export function avatarColorFor(color: string | undefined, index: number) {
  return color || avatarPalette[index % avatarPalette.length];
}

export function initialsFor(name?: string) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export type PatientStatus = "active" | "intake" | "paused" | "discharged";

// Patient status pills — success / accent / warning / muted soft tones.
export const statusTone: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[#e2f1ea] text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]" },
  intake: { label: "Intake", className: "bg-[#e2eef3] text-[#2c8fb0] dark:bg-[#12262e] dark:text-[#4faacb]" },
  paused: { label: "Paused", className: "bg-[#f6ecd8] text-[#be7c16] dark:bg-[#33280f] dark:text-[#d29a3a]" },
  discharged: { label: "Discharged", className: "bg-[#eaeff0] text-[#6c828c] dark:bg-[#1a2a2f] dark:text-[#85a0a4]" },
};

export function statusToneFor(status?: string) {
  return statusTone[status?.toLowerCase() || "active"] ?? statusTone.active;
}

// Appointment / session status pills.
export const apptTone: Record<string, { label: string; className: string; barColor: string }> = {
  completed: { label: "Completed", className: "bg-[#eaeff0] text-[#6c828c] dark:bg-[#1a2a2f] dark:text-[#85a0a4]", barColor: "#6c828c" },
  next: { label: "Up next", className: "bg-primary/10 text-primary", barColor: "var(--primary)" },
  upcoming: { label: "Scheduled", className: "bg-[#e2eef3] text-[#2c8fb0] dark:bg-[#12262e] dark:text-[#4faacb]", barColor: "#2c8fb0" },
  confirmed: { label: "Confirmed", className: "bg-[#e2f1ea] text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]", barColor: "#15986a" },
  no_show: { label: "No-show", className: "bg-[#f8e5e3] text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]", barColor: "#d2574f" },
};

export function apptToneFor(status?: string, isNext = false) {
  if (isNext) return apptTone.next;
  const normalized = status?.toLowerCase().replace("-", "_") || "upcoming";
  if (["completed", "complete"].includes(normalized)) return apptTone.completed;
  if (["confirmed", "active"].includes(normalized)) return apptTone.confirmed;
  if (["no_show", "missed", "cancelled", "canceled"].includes(normalized)) return apptTone.no_show;
  return apptTone.upcoming;
}

// Payment status pills (patient sessions table).
export const payTone: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-[#e2f1ea] text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]" },
  unpaid: { label: "Unpaid", className: "bg-[#f6ecd8] text-[#be7c16] dark:bg-[#33280f] dark:text-[#d29a3a]" },
  overdue: { label: "Overdue", className: "bg-[#f8e5e3] text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]" },
  waived: { label: "Waived", className: "bg-[#eaeff0] text-[#6c828c] dark:bg-[#1a2a2f] dark:text-[#85a0a4]" },
};

export function payToneFor(status?: string) {
  const normalized = status?.toLowerCase() || "unpaid";
  if (["paid", "collected", "complete", "completed"].includes(normalized)) return payTone.paid;
  if (["overdue", "late"].includes(normalized)) return payTone.overdue;
  if (normalized === "waived") return payTone.waived;
  return payTone.unpaid;
}

// Goal bullet tones.
export const goalToneColor: Record<string, string> = {
  success: "#15986a",
  primary: "#0e96b8",
  warning: "#be7c16",
  danger: "#d2574f",
};

export function goalColorFor(tone?: string) {
  if (tone && tone.startsWith("#")) return tone;
  if (tone && tone.startsWith("var(")) {
    const key = tone.replace(/var\(--nv-|\)/g, "");
    return goalToneColor[key] ?? goalToneColor.primary;
  }
  return goalToneColor[tone || "primary"] ?? goalToneColor.primary;
}

export function modeLabel(mode?: string) {
  const normalized = mode?.toLowerCase() || "";
  if (normalized === "inperson" || normalized === "in-person") return "In-person";
  if (normalized === "video") return "Video";
  if (normalized === "phone") return "Phone";
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "Video";
}

export function formatCOP(value = 0) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
