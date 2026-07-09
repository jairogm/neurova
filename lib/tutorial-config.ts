import { DriveStep } from "driver.js";

// Dashboard tour steps
export const dashboardTourSteps: DriveStep[] = [
  {
    popover: {
      title: "Welcome to NEUROVA",
      description: "Let's take a quick tour of your clinical workspace. It only takes a minute.",
      side: "over" as const,
      align: "center" as const,
    },
  },
  {
    element: "#stats-overview",
    popover: {
      title: "Your practice at a glance",
      description: "Active patients, sessions this week, attendance rate, and outstanding balances — updated live from your caseload.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: "#quick-actions",
    popover: {
      title: "New appointment",
      description: "Schedule a session from anywhere. Pick the patient, session type, and recurrence — it syncs to Google Calendar automatically.",
      side: "bottom" as const,
      align: "end" as const,
    },
  },
  {
    element: "#upcoming-appointments",
    popover: {
      title: "Up next & today's agenda",
      description: "Your next session is highlighted at the top, with the rest of today's agenda below. Click any row to open that patient's chart.",
      side: "right" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tasks-card",
    popover: {
      title: "Tasks",
      description: "Keep track of sign-offs, treatment plans, and reminders. Add a task below, check it off when done, or remove it.",
      side: "left" as const,
      align: "start" as const,
    },
  },
  {
    element: "#payments-card",
    popover: {
      title: "Payments this month",
      description: "A snapshot of collected, unpaid, and overdue amounts across your sessions.",
      side: "left" as const,
      align: "start" as const,
    },
  },
  {
    element: "#nav-patients",
    popover: {
      title: "Patients",
      description: "Next stop: your caseload. Click Next to open the Patients page.",
      side: "right" as const,
      align: "center" as const,
    },
  },
];

// Patients page tour steps
export const patientsTourSteps: DriveStep[] = [
  {
    popover: {
      title: "Patient management",
      description: "Everything about your caseload lives here. Let's look around.",
      side: "over" as const,
      align: "center" as const,
    },
  },
  {
    element: "#patients-search",
    popover: {
      title: "Search your caseload",
      description: "Find any patient by name, presenting focus, or email. You can also press ⌘K anywhere for the global search.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#patients-filters",
    popover: {
      title: "Filter by status",
      description: "Narrow the list to Active, Intake, Paused, or Discharged patients — the counts update as your caseload changes.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#patients-view-toggle",
    popover: {
      title: "Table or cards",
      description: "Switch between the detailed table and a card grid — whichever fits how you work.",
      side: "bottom" as const,
      align: "end" as const,
    },
  },
  {
    element: "#add-patient-btn",
    popover: {
      title: "Add patient",
      description: "Create a patient with their contact details, status, presenting focus, first treatment goal, and emergency contact.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#patients-table",
    popover: {
      title: "Your patient list",
      description: "Status, next session, last seen, session count, and balance for every patient. Each row also has quick actions on the right.",
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#action-records",
    popover: {
      title: "Notes & records",
      description: "The folder icon opens the patient workspace on the Notes & records tab — we'll visit it at the end of the tour.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#action-edit",
    popover: {
      title: "Edit patient",
      description: "The pencil icon opens the patient's details for quick edits.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#action-delete",
    popover: {
      title: "Move to trash",
      description: "The trash icon moves a patient to Trash. Nothing is lost right away — items stay recoverable for 30 days.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#nav-trash",
    popover: {
      title: "Trash",
      description: "Deleted patients and records wait here before permanent removal. Click Next to take a look.",
      side: "right" as const,
      align: "center" as const,
    },
  },
];

// Trash page tour steps
export const trashTourSteps: DriveStep[] = [
  {
    popover: {
      title: "Trash",
      description: "Deleted patients and records stay here before permanent removal, so nothing disappears by accident.",
      side: "over" as const,
      align: "center" as const,
    },
  },
  {
    element: "#trash-tabs",
    popover: {
      title: "Patients and records",
      description: "Deleted items are grouped into two panels — patients on the left, clinical records on the right.",
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#trash-table",
    popover: {
      title: "Restore or delete forever",
      description: "Every item here has two actions: Restore brings it back exactly as it was, and Delete permanently removes it after a confirmation.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    popover: {
      title: "One more stop",
      description: "Finally, let's open a patient's workspace to see clinical notes and records. Click Next to continue.",
      side: "over" as const,
      align: "center" as const,
    },
  },
];

// Patient workspace (Notes & records) tour steps
export const recordsTourSteps: DriveStep[] = [
  {
    popover: {
      title: "The patient workspace",
      description: "Every patient has a workspace with their profile, notes, sessions, and medical history in one place.",
      side: "over" as const,
      align: "center" as const,
    },
  },
  {
    element: "#patient-rail",
    popover: {
      title: "Patient profile",
      description: "The profile rail shows who you're working with — status, contact details, and emergency contact. Use Edit details to update anything in place.",
      side: "right" as const,
      align: "start" as const,
    },
  },
  {
    element: "#patient-tabs",
    popover: {
      title: "Workspace tabs",
      description: "Switch between the Overview, Notes & records, Sessions (with payment tracking), and Medical history.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#records-list",
    popover: {
      title: "Clinical records",
      description: "All of this patient's notes, newest first. Select one to read or edit it, or start a fresh note with New note.",
      side: "right" as const,
      align: "start" as const,
    },
  },
  {
    element: "#note-editor",
    popover: {
      title: "The note editor",
      description: "Write directly here — the title, date, and content save automatically as you type.",
      side: "left" as const,
      align: "start" as const,
    },
  },
  {
    element: "#ai-assist",
    popover: {
      title: "AI session summary",
      description: "This header action drafts a concise session summary from the current note. The draft appears inside the editor for your review, and nothing is inserted until you choose to add it.",
      side: "bottom" as const,
      align: "end" as const,
    },
  },
  {
    popover: {
      title: "You're all set",
      description: "That's the tour. Replay it anytime with the help button on the Dashboard. Happy practicing!",
      side: "over" as const,
      align: "center" as const,
    },
  },
];

// Driver.js theme configuration
export const driverConfig = {
  animate: true,
  smoothScroll: true,
  allowClose: true,
  overlayClickNext: false,
  overlayColor: "rgba(6, 17, 21, .6)",
  stagePadding: 8,
  stageRadius: 14,
  popoverClass: "neurova-popover",
  showProgress: true,
  progressText: "{{current}} of {{total}}",
  nextBtnText: "Next",
  prevBtnText: "Back",
  doneBtnText: "Finish",
};
