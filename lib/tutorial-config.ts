import { DriveStep } from "driver.js";

// Dashboard tour steps
export const dashboardTourSteps: DriveStep[] = [
  {
    popover: {
      title: "👋 Welcome to Neurova!",
      description: "Let's take a quick tour to help you get started. This will only take a minute!",
      side: "over" as const,
      align: "center" as const,
    },
  },
  {
    element: "#stats-overview",
    popover: {
      title: "📊 Your Practice Overview",
      description: "Here you can see key metrics at a glance: total patients, sessions conducted, monthly sessions, and currently active sessions.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: "#quick-actions",
    popover: {
      title: "⚡ Quick Actions",
      description: "Use these buttons to quickly schedule a new appointment or add a new patient to your practice.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#upcoming-appointments",
    popover: {
      title: "📅 Upcoming Appointments",
      description: "View your upcoming sessions here. Click on any appointment to see details or join the video call.",
      side: "left" as const,
      align: "start" as const,
    },
  },
  {
    element: "#recent-patients",
    popover: {
      title: "👥 Recent Patients",
      description: "See your newest patients here. Click on any patient to view their full profile and medical records.",
      side: "left" as const,
      align: "start" as const,
    },
  },
  {
    element: "#nav-patients",
    popover: {
      title: "📋 Patients Page",
      description: "Let's continue to the Patients page where you can manage all your patients. Click Next to continue!",
      side: "right" as const,
      align: "center" as const,
    },
  },
];

// Patients page tour steps
export const patientsTourSteps: DriveStep[] = [
  {
    popover: {
      title: "📋 Patient Management",
      description: "This is where you manage all your patients. Let's see what you can do here!",
      side: "over" as const,
      align: "center" as const,
    },
  },
  {
    element: "#patients-search",
    popover: {
      title: "🔍 Search Patients",
      description: "Quickly find any patient by searching their name, email, or phone number.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#add-patient-btn",
    popover: {
      title: "➕ Add New Patient",
      description: "Click here to add a new patient to your practice. You can enter their details and medical history.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#patients-table",
    popover: {
      title: "📋 Patient List",
      description: "Here you see all your patients. Each row has action buttons on the right side. Let me explain each one...",
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#action-view",
    popover: {
      title: "👁️ View Patient Info",
      description: "Click this eye icon to view detailed patient information like contact details, medical history, and notes.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#action-edit",
    popover: {
      title: "✏️ Edit Patient",
      description: "Click the pencil icon to edit patient details like name, phone number, or email address.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#action-records",
    popover: {
      title: "📂 Patient Records",
      description: "Click the folder icon to access the patient's medical records. We'll visit this page next!",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#action-print",
    popover: {
      title: "🖨️ Print Medical History",
      description: "Click the printer icon to generate a PDF of the patient's complete medical history for printing or download.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#action-delete",
    popover: {
      title: "🗑️ Delete Patient",
      description: "Click the trash icon to move a patient to trash. Don't worry, you can recover them within 30 days!",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#view-trash-btn",
    popover: {
      title: "🗑️ View Trash",
      description: "Now let's check the Trash page where you can recover deleted items. Click Next to continue!",
      side: "left" as const,
      align: "center" as const,
    },
  },
];

// Trash page tour steps
export const trashTourSteps: DriveStep[] = [
  {
    popover: {
      title: "🗑️ Trash Management",
      description: "Welcome to the Trash. Deleted items stay here for 30 days before permanent deletion.",
      side: "over" as const,
      align: "center" as const,
    },
  },
  {
    element: "#trash-tabs",
    popover: {
      title: "📑 Tabs",
      description: "Switch between deleted Patients and deleted Medical Records using these tabs.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#trash-table",
    popover: {
      title: "📋 Deleted Items",
      description: "See all deleted items here with their deletion date and remaining days before permanent deletion.",
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#trash-restore-btn",
    popover: {
      title: "♻️ Restore Item",
      description: "Click Restore to bring back a deleted patient or record to your active list.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#trash-delete-btn",
    popover: {
      title: "⚠️ Delete Forever",
      description: "Click Delete Forever to permanently remove an item. This action cannot be undone!",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#trash-back-btn",
    popover: {
      title: "📂 Records Page",
      description: "Now let's check out the medical Records page. Click the button to go back and we'll continue!",
      side: "right" as const,
      align: "center" as const,
    },
  },
];

// Records page tour steps
export const recordsTourSteps: DriveStep[] = [
  {
    popover: {
      title: "📂 Medical Records",
      description: "This is where you manage a patient's medical records and clinical notes.",
      side: "over" as const,
      align: "center" as const,
    },
  },
  {
    element: "#records-back-btn",
    popover: {
      title: "⬅️ Back to Patients",
      description: "Click here to go back to the patients list anytime.",
      side: "right" as const,
      align: "center" as const,
    },
  },
  {
    element: "#add-record-btn",
    popover: {
      title: "➕ Add New Record",
      description: "Click here to add a new medical record, clinical note, or session summary for this patient.",
      side: "left" as const,
      align: "center" as const,
    },
  },
  {
    element: "#records-table",
    popover: {
      title: "📋 Records List",
      description: "All medical records are listed here with date, title, and description. Click any row to view or edit.",
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    popover: {
      title: "🎉 You're All Set!",
      description: "That's everything! You now know how to navigate Neurova. Replay this tutorial anytime using the ❓ button. Happy practicing!",
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
  stagePadding: 10,
  stageRadius: 8,
  popoverClass: "neurova-popover",
  showProgress: true,
  progressText: "{{current}} of {{total}}",
  nextBtnText: "Next →",
  prevBtnText: "← Back",
  doneBtnText: "Finish! 🎉",
};
