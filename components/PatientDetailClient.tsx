"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DeletePatientModal } from "@/components/modals/DeletePatientModal";
import { ScheduleAppointment } from "@/components/modals/ScheduleAppointment";
import { Skeleton } from "@/components/ui/skeleton";
import {
  apptToneFor,
  avatarColorFor,
  formatCOP,
  goalColorFor,
  initialsFor,
  modeLabel,
  payToneFor,
  statusToneFor,
} from "@/lib/nv";
import type { PatientGoal } from "@/lib/types";
import { useTutorial } from "@/hooks/useTutorial";
import { EDITOR_TOOLS, editorPlainText } from "@/lib/tool";
import EditorJS, { type OutputData } from "@editorjs/editorjs";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  ClipboardCheck,
  DollarSign,
  FileDown,
  FileText,
  Loader2,
  Mail,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "notes", label: "Notes & records" },
  { key: "sessions", label: "Sessions" },
  { key: "history", label: "Medical history" },
] as const;

type TabKey = typeof TABS[number]["key"];

const HISTORY_FIELDS = [
  { key: "expectations", label: "Expectations of therapy" },
  { key: "mainTopic", label: "Main presenting topic" },
  { key: "symptoms", label: "Reported symptoms" },
  { key: "familyInfo", label: "Family & social history" },
  { key: "diagnosis", label: "Working formulation" },
] as const;

type Draft = {
  name: string;
  pronouns: string;
  age: string;
  focus: string;
  summary: string;
  phone: string;
  email: string;
  location: string;
  ecName: string;
  ecRel: string;
  ecPhone: string;
  goals: PatientGoal[];
};

const inputClass = "w-full rounded-[9px] border border-border bg-secondary px-[11px] py-2 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const cardClass = "rounded-2xl border border-border bg-card shadow-sm";

function noteDateLabel(iso?: string) {
  if (!iso) return "—";
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PatientWorkbench({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patient = useQuery(api.patients.get, { id });
  const notes = useQuery(api.medical_history_notes.listByPatient, { patientId: id });
  const sessions = useQuery(api.sessions.listByPatient, { patientId: id });
  const updatePatient = useMutation(api.patients.update);
  const createNote = useMutation(api.medical_history_notes.create);
  const updateNote = useMutation(api.medical_history_notes.update);
  const softDeleteRecord = useMutation(api.trash.softDeleteRecord);
  const softDeletePatient = useMutation(api.trash.softDeletePatient);
  const updatePayment = useMutation(api.sessions.updatePayment);

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tab = searchParams.get("tab");
    return (TABS.some((item) => item.key === tab) ? tab : "overview") as TabKey;
  });
  const { startRecordsTour, currentTourPage } = useTutorial();

  // The profile rail tucks itself away on Notes & records so the editor gets
  // the full width; the panel toggle next to the tabs brings it back anytime.
  const [railHidden, setRailHidden] = useState(activeTab === "notes");
  useEffect(() => {
    setRailHidden(activeTab === "notes");
  }, [activeTab]);

  useEffect(() => {
    if (currentTourPage !== "pre-records" || patient === undefined) return;
    setActiveTab("notes");
    const timer = window.setTimeout(startRecordsTour, 800);
    return () => window.clearTimeout(timer);
  }, [currentTourPage, patient, startRecordsTour]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const emergency = (patient?.emergency_contact ?? {}) as { name?: string; relationship?: string; phone?: string };
  const goals: PatientGoal[] = useMemo(() => (patient?.goals as PatientGoal[]) ?? [], [patient?.goals]);

  const startDraft = useCallback((): Draft => ({
    name: patient?.name ?? "",
    pronouns: patient?.pronouns ?? "",
    age: patient?.age ?? "",
    focus: patient?.focus ?? "",
    summary: patient?.summary ?? "",
    phone: patient?.phone_number ?? "",
    email: patient?.email ?? "",
    location: patient?.city ?? "",
    ecName: emergency.name ?? "",
    ecRel: emergency.relationship ?? "",
    ecPhone: emergency.phone ?? "",
    goals: goals.map((goal) => ({ ...goal })),
  }), [emergency.name, emergency.phone, emergency.relationship, goals, patient]);

  const toggleEdit = async () => {
    if (!editing) {
      setDraft(startDraft());
      setEditing(true);
      return;
    }
    setEditing(false);
    if (!draft) return;
    try {
      await updatePatient({
        id,
        updates: {
          name: draft.name || patient?.name,
          pronouns: draft.pronouns,
          age: draft.age,
          focus: draft.focus,
          summary: draft.summary,
          phone_number: draft.phone,
          email: draft.email,
          city: draft.location,
          goals: JSON.stringify(draft.goals),
          emergency_contact: JSON.stringify({ name: draft.ecName, relationship: draft.ecRel, phone: draft.ecPhone }),
        },
      });
      toast.success("Patient updated");
    } catch {
      toast.error("Failed to update patient");
    }
  };

  const setDraftField = (key: keyof Omit<Draft, "goals">) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const confirmDelete = async () => {
    if (!patient?._id) return;
    setDeleting(true);
    try {
      await softDeletePatient({ id: patient._id as Id<"patients"> });
      toast.success("Patient moved to trash");
      router.push("/patients");
    } catch {
      toast.error("Failed to delete patient");
      setDeleting(false);
    }
  };

  if (patient === undefined) {
    return <div className="mx-auto grid max-w-[1280px] gap-5 px-4 py-6 lg:grid-cols-[280px_1fr]"><Skeleton className="h-[520px] rounded-[18px]" /><Skeleton className="h-[620px] rounded-[18px]" /></div>;
  }

  if (!patient) {
    return <div className="mx-auto max-w-[1280px] px-6 py-16 text-center text-sm text-muted-foreground">Patient not found.</div>;
  }

  const tone = statusToneFor(patient.status);
  const color = avatarColorFor(patient.avatar_color, 0);
  const viewGoals = editing && draft ? draft.goals : goals;

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-5 sm:py-[22px] wide:px-[30px]">
      <Link href="/patients" className="mb-4 flex w-max items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary"><ArrowLeft size={15} strokeWidth={2.4} />All patients</Link>

      <div className={`grid items-start gap-5 transition-[grid-template-columns,column-gap] duration-500 ease-[cubic-bezier(.25,1,.3,1)] ${railHidden ? "lg:grid-cols-[0px_minmax(0,1fr)] lg:gap-x-0" : "lg:grid-cols-[280px_minmax(0,1fr)]"}`}>
        {/* ===== Profile rail ===== */}
        <aside
          inert={railHidden}
          className={`flex-col gap-4 overflow-hidden transition-opacity duration-300 ${railHidden ? "hidden opacity-0 lg:flex" : "flex opacity-100"}`}
        >
          <div id="patient-rail" className={`${cardClass} p-5 text-center`}>
            <div className="mx-auto mb-3 flex size-[72px] items-center justify-center rounded-[20px] text-[26px] font-extrabold text-white" style={{ background: color }}>
              {initialsFor(patient.name)}
            </div>
            {editing && draft ? (
              <div className="mb-2.5 flex flex-col gap-2">
                <input value={draft.name} onChange={setDraftField("name")} placeholder="Patient name" className={`${inputClass} text-center text-[13px] font-bold text-foreground`} />
                <div className="grid grid-cols-[1fr_78px] gap-2">
                  <input value={draft.pronouns} onChange={setDraftField("pronouns")} placeholder="Pronouns" className={inputClass} />
                  <input value={draft.age} onChange={setDraftField("age")} placeholder="Age" className={inputClass} />
                </div>
              </div>
            ) : (
              <>
                <div className="text-[18px] font-extrabold text-foreground">{patient.name}</div>
                <div className="mb-2.5 text-[12.5px] text-muted-foreground">{patient.pronouns || "—"} · {patient.age || "—"} yrs</div>
              </>
            )}
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${tone.className}`}>{tone.label}</span>

            <div className="mt-4"><ScheduleAppointment variant="rail" defaultPatientId={id} /></div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => router.push(`/patients/${id}/records`)} className="flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-border bg-card px-2 text-[12.5px] font-bold text-foreground/80 transition-colors hover:border-primary">
                <FileDown size={13} />Export PDF
              </button>
              <button type="button" onClick={toggleEdit} className="flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-border bg-card px-2 text-[12.5px] font-bold text-foreground/80 transition-colors hover:border-primary">
                {editing ? <Check size={13} /> : <Pencil size={13} />}{editing ? "Done" : "Edit details"}
              </button>
            </div>
            <button type="button" onClick={() => setDeleteOpen(true)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-border bg-transparent px-2 py-2 text-xs font-bold text-[#d2574f] transition-colors hover:border-[#d2574f] hover:bg-[#f8e5e3] dark:text-[#e0726a] dark:hover:bg-[#3a1f1d]">
              <Trash2 size={13} strokeWidth={2} />Delete patient
            </button>
          </div>

          <div className={`${cardClass} p-[18px]`}>
            <div className="mb-[13px] text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">Contact</div>
            {editing && draft ? (
              <div className="flex flex-col gap-2">
                <input value={draft.phone} onChange={setDraftField("phone")} placeholder="Phone" className={inputClass} />
                <input value={draft.email} onChange={setDraftField("email")} placeholder="Email" className={inputClass} />
                <input value={draft.location} onChange={setDraftField("location")} placeholder="Location" className={inputClass} />
              </div>
            ) : (
              <div className="flex flex-col gap-[11px] text-[12.5px]">
                <div className="flex items-center gap-2.5"><Phone size={15} strokeWidth={1.8} className="flex-none text-[var(--nv-faint)]" /><span className="font-mono text-foreground/80">{patient.phone_number || "—"}</span></div>
                <div className="flex items-center gap-2.5"><Mail size={15} strokeWidth={1.8} className="flex-none text-[var(--nv-faint)]" /><span className="break-all text-foreground/80">{patient.email || "—"}</span></div>
                <div className="flex items-center gap-2.5"><MapPin size={15} strokeWidth={1.8} className="flex-none text-[var(--nv-faint)]" /><span className="text-foreground/80">{patient.city || "—"}</span></div>
              </div>
            )}
          </div>

          <div className={`${cardClass} p-[18px]`}>
            <div className="mb-[13px] flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">Emergency contact</div>
              <AlertTriangle size={15} strokeWidth={1.8} className="text-[#d2574f] dark:text-[#e0726a]" />
            </div>
            {editing && draft ? (
              <div className="flex flex-col gap-2">
                <input value={draft.ecName} onChange={setDraftField("ecName")} placeholder="Contact name" className={inputClass} />
                <input value={draft.ecRel} onChange={setDraftField("ecRel")} placeholder="Relationship" className={inputClass} />
                <input value={draft.ecPhone} onChange={setDraftField("ecPhone")} placeholder="Phone" className={inputClass} />
              </div>
            ) : emergency.name || emergency.phone ? (
              <>
                <div className="text-[13.5px] font-bold text-foreground">{emergency.name}</div>
                <div className="mb-1.5 text-xs text-muted-foreground">{emergency.relationship}</div>
                <div className="font-mono text-[12.5px] text-foreground/80">{emergency.phone}</div>
              </>
            ) : (
              <div className="text-[12.5px] text-[var(--nv-faint)]">No emergency contact on file.</div>
            )}
          </div>
        </aside>

        {/* ===== Main column ===== */}
        <main className="min-w-0">
          <div className="mb-[18px] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRailHidden((current) => !current)}
              title={railHidden ? "Show patient info" : "Hide patient info"}
              aria-label={railHidden ? "Show patient info" : "Hide patient info"}
              className="hidden size-9 flex-none items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary lg:flex"
            >
              {railHidden ? <PanelLeftOpen size={16} strokeWidth={2} /> : <PanelLeftClose size={16} strokeWidth={2} />}
            </button>
            <div id="patient-tabs" className="flex w-max max-w-full gap-1 overflow-auto rounded-xl border border-border bg-secondary p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap rounded-[9px] px-4 py-2 text-[13px] font-bold transition-colors ${activeTab === tab.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <OverviewTab
              patient={patient}
              goals={viewGoals}
              notes={notes}
              sessions={sessions}
              editing={editing}
              draft={draft}
              setDraftField={setDraftField}
              setDraft={setDraft}
              toggleEdit={toggleEdit}
            />
          )}

          {activeTab === "notes" && (
            <NotesTab
              patientId={id}
              notes={notes}
              createNote={createNote}
              updateNote={updateNote}
              softDeleteRecord={softDeleteRecord}
            />
          )}

          {activeTab === "sessions" && <SessionsTab sessions={sessions} updatePayment={updatePayment} />}

          {activeTab === "history" && <HistoryTab patient={patient} updatePatient={updatePatient} />}
        </main>
      </div>

      <DeletePatientModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        patientName={patient.name}
        onConfirm={confirmDelete}
        isDeleting={deleting}
      />
    </div>
  );
}

/* ===================== Overview ===================== */

type OverviewProps = {
  patient: NonNullable<ReturnType<typeof useQuery<typeof api.patients.get>>>;
  goals: PatientGoal[];
  notes: ReturnType<typeof useQuery<typeof api.medical_history_notes.listByPatient>>;
  sessions: ReturnType<typeof useQuery<typeof api.sessions.listByPatient>>;
  editing: boolean;
  draft: Draft | null;
  setDraftField: (key: keyof Omit<Draft, "goals">) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setDraft: React.Dispatch<React.SetStateAction<Draft | null>>;
  toggleEdit: () => void;
};

function OverviewTab({ patient, goals, notes, sessions, editing, draft, setDraftField, setDraft, toggleEdit }: OverviewProps) {
  const timeline = useMemo(() => {
    type TimelineEvent = { key: string; type: "note" | "session" | "payment" | "intake"; title: string; desc: string; sort: string; date: string };
    const events: TimelineEvent[] = [];
    const label = (value: string) => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString([], { month: "short", day: "numeric" });
    };
    (notes ?? []).forEach((note) => {
      const sort = note.date || note.created_at;
      events.push({ key: `n-${note._id}`, type: "note", title: `${note.title || "Clinical note"} added`, desc: note.description || "Patient record updated", sort, date: label(sort) });
    });
    const total = (sessions ?? []).length;
    (sessions ?? []).forEach((session, index) => {
      const number = total - index;
      const status = session.session_status?.toLowerCase() || "scheduled";
      if (["completed", "complete"].includes(status)) {
        events.push({ key: `s-${session._id}`, type: "session", title: `Session ${number} · ${session.session_type || "Therapy"}`, desc: `${session.duration || 50} min · ${modeLabel(session.mode)} · Completed`, sort: session.scheduled_date, date: label(session.scheduled_date) });
        if (session.payment_status?.toLowerCase() === "paid") {
          events.push({ key: `p-${session._id}`, type: "payment", title: "Payment received", desc: `${formatCOP(Number(session.payment_amount) || 0)} · Card on file`, sort: session.scheduled_date, date: label(session.scheduled_date) });
        }
      }
    });
    if (patient.created_at) {
      events.push({ key: "intake", type: "intake", title: "Intake completed", desc: patient.focus || "Collaborative goals established.", sort: patient.created_at, date: label(patient.created_at) });
    }
    return events.sort((a, b) => b.sort.localeCompare(a.sort)).slice(0, 6);
  }, [notes, patient.created_at, patient.focus, sessions]);

  const timelineIcon = (type: string) => {
    if (type === "session") return { className: "bg-[#e2eef3] text-[#2c8fb0] dark:bg-[#12262e] dark:text-[#4faacb]", icon: <CheckCheck size={15} strokeWidth={2} /> };
    if (type === "payment") return { className: "bg-[#e2f1ea] text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]", icon: <DollarSign size={15} strokeWidth={2} /> };
    if (type === "intake") return { className: "bg-[#f6ecd8] text-[#be7c16] dark:bg-[#33280f] dark:text-[#d29a3a]", icon: <ClipboardCheck size={15} strokeWidth={2} /> };
    return { className: "bg-primary/10 text-primary", icon: <FileText size={15} strokeWidth={2} /> };
  };

  const updateGoal = (index: number, text: string) => {
    setDraft((current) => current ? { ...current, goals: current.goals.map((goal, i) => (i === index ? { ...goal, text } : goal)) } : current);
  };
  const removeGoal = (index: number) => {
    setDraft((current) => current ? { ...current, goals: current.goals.filter((_, i) => i !== index) } : current);
  };
  const addGoal = () => {
    setDraft((current) => current ? { ...current, goals: [...current.goals, { text: "New goal", tone: "primary" }] } : current);
  };

  return (
    <>
      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <div className={`${cardClass} p-[18px]`}>
          <div className="mb-[9px] flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">Presenting focus</div>
            <button type="button" onClick={toggleEdit} className="text-[11.5px] font-bold text-primary">{editing ? "Done" : "Edit details"}</button>
          </div>
          {editing && draft ? (
            <>
              <input value={draft.focus} onChange={setDraftField("focus")} placeholder="Presenting focus" className={`${inputClass} mb-2 text-[13.5px] font-bold text-foreground`} />
              <textarea value={draft.summary} onChange={setDraftField("summary")} placeholder="Summary / formulation" className={`${inputClass} min-h-[84px] resize-y leading-normal`} />
            </>
          ) : (
            <>
              <div className="mb-1.5 text-sm font-bold text-foreground">{patient.focus || "General care"}</div>
              <p className="text-[13px] leading-[1.55] text-foreground/80">{patient.summary || "Add a clinical summary from Edit details."}</p>
            </>
          )}
        </div>

        <div className={`${cardClass} p-[18px]`}>
          <div className="mb-[9px] flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">Active goals</div>
            <button type="button" onClick={toggleEdit} className="text-[11.5px] font-bold text-primary">{editing ? "Done" : "Edit details"}</button>
          </div>
          {editing && draft ? (
            <div className="flex flex-col gap-[7px]">
              {draft.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-[7px]">
                  <span className="size-[7px] flex-none rounded-full" style={{ background: goalColorFor(goal.tone) }} />
                  <input value={goal.text} onChange={(event) => updateGoal(index, event.target.value)} className={`${inputClass} flex-1 py-[7px]`} />
                  <button type="button" onClick={() => removeGoal(index)} aria-label="Remove goal" className="flex size-[26px] flex-none items-center justify-center rounded-[7px] text-[var(--nv-faint)] hover:bg-[#f8e5e3] hover:text-[#d2574f]"><X size={13} strokeWidth={2} /></button>
                </div>
              ))}
              <button type="button" onClick={addGoal} className="mt-[3px] flex w-max items-center gap-1.5 rounded-lg border border-dashed border-[#cfdadd] px-[11px] py-1.5 text-xs font-bold text-primary dark:border-[#294852]"><Plus size={13} strokeWidth={2.4} />Add goal</button>
            </div>
          ) : goals.length ? (
            <div className="flex flex-col gap-[9px]">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-[9px] text-[13px] text-foreground/80">
                  <span className="size-[7px] flex-none rounded-full" style={{ background: goalColorFor(goal.tone) }} />
                  {goal.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12.5px] text-[var(--nv-faint)]">No active goals yet.</div>
          )}
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-extrabold text-foreground">Patient timeline</h2></div>
        <div className="px-5 pb-4 pt-1.5">
          {timeline.length ? timeline.map((event, index) => {
            const icon = timelineIcon(event.type);
            return (
              <div key={event.key} className="flex gap-3.5 py-[11px]">
                <div className="flex flex-none flex-col items-center">
                  <div className={`flex size-[30px] items-center justify-center rounded-[9px] ${icon.className}`}>{icon.icon}</div>
                  {index < timeline.length - 1 && <div className="mt-1 min-h-2 w-0.5 flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-bold text-foreground">{event.title}</span>
                    <span className="font-mono text-[11px] text-[var(--nv-faint)]">{event.date}</span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-muted-foreground">{event.desc}</div>
                </div>
              </div>
            );
          }) : <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">No timeline activity yet.</div>}
        </div>
      </div>
    </>
  );
}

/* ===================== Notes ===================== */

type NotesTabProps = {
  patientId: string;
  notes: ReturnType<typeof useQuery<typeof api.medical_history_notes.listByPatient>>;
  createNote: ReturnType<typeof useMutation<typeof api.medical_history_notes.create>>;
  updateNote: ReturnType<typeof useMutation<typeof api.medical_history_notes.update>>;
  softDeleteRecord: ReturnType<typeof useMutation<typeof api.trash.softDeleteRecord>>;
};

function toEditorData(note: { content?: unknown; plainText?: string }): OutputData {
  const content = note.content;
  if (content && typeof content === "object" && Array.isArray((content as OutputData).blocks)) {
    return content as OutputData;
  }
  const text = note.plainText || "";
  return {
    time: Date.now(),
    blocks: text
      ? text.split(/\n+/).filter(Boolean).map((paragraph) => ({ type: "paragraph", data: { text: paragraph } }))
      : [],
  };
}

function NotesTab({ patientId, notes, createNote, updateNote, softDeleteRecord }: NotesTabProps) {
  const sorted = useMemo(
    () => [...(notes ?? [])].sort((a, b) => (b.date || b.created_at).localeCompare(a.date || a.created_at)),
    [notes],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = sorted.find((note) => String(note._id) === activeId) ?? sorted[0];

  const [title, setTitle] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [words, setWords] = useState(0);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [aiState, setAiState] = useState<"idle" | "busy" | "ready">("idle");
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedId = useRef<string | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  // (Re)mount the EditorJS instance whenever the selected note changes.
  useEffect(() => {
    if (!active) {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      loadedId.current = null;
      return;
    }
    if (String(active._id) === loadedId.current) return;
    loadedId.current = String(active._id);
    setTitle(active.title || "");
    setDateISO((active.date || "").slice(0, 10));
    setWords(active.wordCount ?? 0);
    setSaveState("saved");
    setAiState("idle");

    if (editorRef.current?.destroy) {
      editorRef.current.destroy();
      editorRef.current = null;
    }
    const noteKey = String(active.id ?? active._id);
    const editor: EditorJS = new EditorJS({
      holder: "editorjs",
      tools: EDITOR_TOOLS,
      placeholder: "Write the session note… Type / for blocks",
      data: toEditorData(active),
      minHeight: 240,
      onChange: () => {
        setSaveState("saving");
        if (contentTimer.current) clearTimeout(contentTimer.current);
        contentTimer.current = setTimeout(async () => {
          try {
            const output = await editor.save();
            const text = editorPlainText(output).trim();
            setWords(text ? text.split(/\s+/).filter(Boolean).length : 0);
            await updateNote({ id: noteKey, content: output, description: text.slice(0, 120) });
            setSaveState("saved");
          } catch {
            toast.error("Failed to save note");
          }
        }, 800);
      },
    });
    editorRef.current = editor;
  }, [active, updateNote]);

  useEffect(() => () => {
    if (metaTimer.current) clearTimeout(metaTimer.current);
    if (contentTimer.current) clearTimeout(contentTimer.current);
    if (aiTimer.current) clearTimeout(aiTimer.current);
    if (editorRef.current?.destroy) {
      editorRef.current.destroy();
      editorRef.current = null;
    }
  }, []);

  const scheduleSave = (next: { title?: string; dateISO?: string }) => {
    if (!active) return;
    setSaveState("saving");
    if (metaTimer.current) clearTimeout(metaTimer.current);
    const noteKey = String(active.id ?? active._id);
    const payload = {
      title: next.title ?? title,
      dateISO: next.dateISO ?? dateISO,
    };
    metaTimer.current = setTimeout(async () => {
      try {
        await updateNote({
          id: noteKey,
          title: payload.title || "Untitled note",
          date: payload.dateISO,
        });
        setSaveState("saved");
      } catch {
        toast.error("Failed to save note");
      }
    }, 800);
  };

  const addNote = async () => {
    try {
      const created = await createNote({
        patient_id: patientId,
        title: "Untitled note",
        description: "New note - start writing the session record...",
        date: new Date().toISOString().slice(0, 10),
        content: "",
      });
      if (created?._id) setActiveId(String(created._id));
    } catch {
      toast.error("Failed to create note");
    }
  };

  const removeNote = async (noteId: string) => {
    try {
      await softDeleteRecord({ id: noteId as Id<"medical_history_notes"> });
      toast.success("Note moved to trash");
      loadedId.current = null;
      setActiveId(null);
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const runAi = () => {
    setAiState("busy");
    if (aiTimer.current) clearTimeout(aiTimer.current);
    aiTimer.current = setTimeout(() => setAiState("ready"), 1500);
  };

  const aiDraft = "Summary draft. Client reported reduced anticipatory anxiety and no panic episodes this week. Engaged well with exposure homework. Cognitive restructuring progressing. Suggested focus: graded exposure to crowded transit, continue thought records.";

  const approveAi = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      await editor.isReady;
      editor.blocks.insert("paragraph", { text: aiDraft }, undefined, editor.blocks.getBlocksCount(), true);
    } catch {
      toast.error("Failed to insert the draft");
    }
    setAiState("idle");
  };

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <div id="records-list" className={`${cardClass} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-border px-4 py-[13px]">
          <span className="text-[13px] font-extrabold text-foreground">Records</span>
          <button type="button" onClick={addNote} className="flex items-center gap-1.5 rounded-[9px] bg-primary px-[11px] py-1.5 text-[11.5px] font-bold text-primary-foreground transition-colors hover:bg-[#0b7693]">
            <Plus size={13} strokeWidth={2.6} />New note
          </button>
        </div>
        {notes === undefined ? (
          <div className="space-y-2 p-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
        ) : sorted.length ? sorted.map((note) => {
          const selected = active && String(note._id) === String(active._id);
          return (
            <div key={String(note._id)} className={`flex items-stretch border-b border-border border-l-[3px] last:border-b-0 ${selected ? "border-l-primary bg-primary/10" : "border-l-transparent hover:bg-secondary"}`}>
              <button type="button" onClick={() => setActiveId(String(note._id))} className="min-w-0 flex-1 px-3.5 py-3 text-left">
                <div className="truncate text-[13px] font-bold text-foreground">{note.title || "Untitled note"}</div>
                <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{noteDateLabel(note.date)} · {note.wordCount ?? 0} words</div>
              </button>
              <button type="button" onClick={() => removeNote(String(note._id))} aria-label="Delete note" className="flex w-[34px] flex-none items-center justify-center text-[var(--nv-faint)] hover:text-[#d2574f]">
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          );
        }) : (
          <div className="px-4 py-10 text-center text-[12.5px] text-muted-foreground">No records yet — create the first note.</div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* No overflow-hidden here: the EditorJS block popover must be able to
            overlay the card edge instead of being clipped. */}
        <div id="note-editor" className={cardClass}>
          <div className="flex items-center gap-2 rounded-t-[15px] border-b border-border bg-secondary px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <kbd className="rounded-[7px] border border-border bg-card px-2 py-1 font-mono text-[11px] font-bold text-muted-foreground">/</kbd>
              <span className="hidden text-[11.5px] text-muted-foreground sm:inline">for blocks · select text to format</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[11.5px] font-bold text-[#15986a] dark:text-[#2ba378]">
              {saveState === "saving" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} strokeWidth={2.5} />}
              {saveState === "saving" ? "Saving…" : "Saved · just now"}
            </div>
            {active && (
              <button type="button" onClick={() => removeNote(String(active._id))} aria-label="Delete note" className="flex size-[30px] items-center justify-center rounded-lg border border-border bg-card text-[var(--nv-faint)] transition-colors hover:border-[#d2574f] hover:text-[#d2574f]">
                <Trash2 size={14} strokeWidth={2} />
              </button>
            )}
          </div>
          {active ? (
            <div className="px-[26px] py-[22px]">
              <input
                value={title}
                onChange={(event) => { setTitle(event.target.value); scheduleSave({ title: event.target.value }); }}
                placeholder="Note title"
                className="mb-2 w-full border-0 bg-transparent text-[21px] font-extrabold tracking-[-.01em] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[.06em] text-muted-foreground">Date</span>
                <input
                  type="date"
                  value={dateISO}
                  onChange={(event) => { setDateISO(event.target.value); scheduleSave({ dateISO: event.target.value }); }}
                  className="rounded-lg border border-border bg-secondary px-2.5 py-1.5 font-mono text-[12.5px] text-foreground outline-none focus:border-primary"
                />
                <span className="font-mono text-xs text-[var(--nv-faint)]">{words} words</span>
              </div>
              {/* Scroll long notes inside the card; the small horizontal padding
                  keeps the left-side block actions from being clipped. */}
              <div className="-mx-3 max-h-[440px] overflow-y-auto px-3">
                <div id="editorjs" className="nv-editor min-h-[320px] text-sm leading-[1.65] text-foreground/80" />
              </div>
            </div>
          ) : (
            <div className="px-6 py-14 text-center text-sm text-muted-foreground">Select or create a note to start writing.</div>
          )}
        </div>

        <div id="ai-assist" className="rounded-2xl border border-[#8acfe0] bg-[linear-gradient(180deg,rgba(14,150,184,.08),transparent)] p-[18px] shadow-sm dark:border-[#1f5664]">
          <div className="flex items-start gap-3">
            <div className="flex size-[34px] flex-none items-center justify-center rounded-[10px] bg-primary text-white"><Sparkles size={18} strokeWidth={1.8} /></div>
            <div className="flex-1">
              <div className="text-sm font-extrabold text-foreground">
                AI session summary
                <span className="ml-1.5 rounded-full border border-[#8acfe0] bg-card px-[7px] py-0.5 align-middle text-[10.5px] font-bold text-primary dark:border-[#1f5664]">Draft · review required</span>
              </div>
              <p className="mt-[5px] text-[12.5px] leading-normal text-muted-foreground">
                Generates a structured draft from session notes. Clinician review and sign-off required before saving. Not a diagnostic tool.
              </p>

              {aiState === "idle" && (
                <button type="button" onClick={runAi} className="mt-[13px] flex items-center gap-[7px] rounded-[9px] bg-primary px-[15px] py-[9px] text-[12.5px] font-bold text-primary-foreground transition-colors hover:bg-[#0b7693]">
                  <Sparkles size={14} strokeWidth={2} />Generate draft
                </button>
              )}
              {aiState === "busy" && (
                <div className="mt-3.5 flex items-center gap-[9px] text-[12.5px] font-bold text-primary">
                  <Loader2 size={15} strokeWidth={2.4} className="animate-spin" />Drafting summary from session notes…
                </div>
              )}
              {aiState === "ready" && (
                <div className="mt-[13px] rounded-[11px] border border-border bg-card p-3.5">
                  <div className="text-[12.5px] leading-[1.6] text-foreground/80"><strong className="text-foreground">Summary draft.</strong> {aiDraft.replace("Summary draft. ", "")}</div>
                  <div className="mt-[13px] flex flex-wrap gap-2">
                    <button type="button" onClick={approveAi} className="flex items-center gap-1.5 rounded-lg bg-[#15986a] px-[13px] py-2 text-xs font-bold text-white">
                      <Check size={13} strokeWidth={2.6} />Approve &amp; insert
                    </button>
                    <button type="button" onClick={approveAi} className="rounded-lg border border-border bg-card px-[13px] py-2 text-xs font-bold text-foreground/80">Edit</button>
                    <button type="button" onClick={() => setAiState("idle")} className="rounded-lg border border-border bg-card px-[13px] py-2 text-xs font-bold text-muted-foreground">Discard</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Sessions ===================== */

type SessionsTabProps = {
  sessions: ReturnType<typeof useQuery<typeof api.sessions.listByPatient>>;
  updatePayment: ReturnType<typeof useMutation<typeof api.sessions.updatePayment>>;
};

function SessionsTab({ sessions, updatePayment }: SessionsTabProps) {
  const rows = sessions ?? [];
  const total = rows.length;

  const sessionStatusTone = (status?: string) => {
    const normalized = status?.toLowerCase().replace("-", "_") || "scheduled";
    if (["completed", "complete"].includes(normalized)) return { label: "Completed", className: "bg-[#e2f1ea] text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]" };
    if (["no_show", "missed"].includes(normalized)) return { label: "No-show", className: "bg-[#eaeff0] text-[#6c828c] dark:bg-[#1a2a2f] dark:text-[#85a0a4]" };
    if (["cancelled", "canceled"].includes(normalized)) return { label: "Cancelled", className: "bg-[#f8e5e3] text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]" };
    return apptToneFor(status);
  };

  const setPayment = async (session: typeof rows[number], nextStatus: string) => {
    const currentAmount = Number(session.payment_amount) || 0;
    try {
      await updatePayment({
        id: String(session.id ?? session._id),
        payment_status: nextStatus,
        payment_amount: nextStatus === "waived" ? 0 : currentAmount || 120000,
      });
    } catch {
      toast.error("Failed to update payment");
    }
  };

  if (sessions === undefined) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  return (
    <div className={`${cardClass} overflow-x-auto`}>
      <div className="grid min-w-[640px] grid-cols-[.5fr_1.2fr_.9fr_.7fr_1fr_2fr] gap-2.5 border-b border-border bg-secondary px-4 py-[11px] text-[11px] font-bold uppercase tracking-[.06em] text-muted-foreground wide:grid-cols-[.6fr_1.3fr_1fr_.8fr_1fr_1.8fr] wide:gap-3 wide:px-5">
        <div>#</div><div>Date</div><div>Mode</div><div>Duration</div><div>Status</div><div className="text-right">Payment</div>
      </div>
      {rows.length ? rows.map((session, index) => {
        const status = sessionStatusTone(session.session_status);
        const payStatus = session.payment_status?.toLowerCase() || "unpaid";
        const pay = payToneFor(payStatus);
        const waived = payStatus === "waived";
        const amount = waived ? 0 : Number(session.payment_amount) || 0;
        return (
          <div key={String(session._id)} className="grid min-w-[640px] grid-cols-[.5fr_1.2fr_.9fr_.7fr_1fr_2fr] items-center gap-2.5 border-b border-border px-4 py-3.5 last:border-b-0 wide:grid-cols-[.6fr_1.3fr_1fr_.8fr_1fr_1.8fr] wide:gap-3 wide:px-5">
            <div className="font-mono text-[13px] font-semibold text-foreground">{total - index}</div>
            <div className="font-mono text-[12.5px] text-foreground/80">{new Date(session.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
            <div className="text-[12.5px] text-foreground/80">{modeLabel(session.mode)}</div>
            <div className="font-mono text-[12.5px] text-muted-foreground">{session.duration || 50} min</div>
            <div><span className={`rounded-full px-2.5 py-[3px] text-[11px] font-bold ${status.className}`}>{status.label}</span></div>
            <div className="flex items-center justify-end gap-2">
              <span className="font-mono text-xs font-bold text-foreground">{formatCOP(amount)}</span>
              <div className="relative">
                <select
                  aria-label="Payment status"
                  title="Payment status"
                  value={["paid", "unpaid", "waived", "overdue"].includes(payStatus) ? payStatus : "unpaid"}
                  onChange={(event) => setPayment(session, event.target.value)}
                  className={`cursor-pointer appearance-none rounded-full border border-transparent py-1.5 pl-3 pr-[26px] text-[11px] font-bold outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary ${pay.className}`}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="waived">Waived</option>
                  {payStatus === "overdue" && <option value="overdue">Overdue</option>}
                </select>
                <ChevronDown size={12} strokeWidth={2.4} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        );
      }) : (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">No sessions recorded yet. Sessions appear when you schedule appointments.</div>
      )}
    </div>
  );
}

/* ===================== Medical history ===================== */

type HistoryTabProps = {
  patient: NonNullable<ReturnType<typeof useQuery<typeof api.patients.get>>>;
  updatePatient: ReturnType<typeof useMutation<typeof api.patients.update>>;
};

function HistoryTab({ patient, updatePatient }: HistoryTabProps) {
  const [history, setHistory] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = (patient.medical_history ?? {}) as Record<string, string>;
    setHistory({
      expectations: stored.expectations || "",
      mainTopic: stored.mainTopic || "",
      symptoms: stored.symptoms || "",
      familyInfo: stored.familyInfo || "",
      diagnosis: stored.diagnosis || "",
    });
  }, [patient.medical_history]);

  const save = async (next: Record<string, string>) => {
    try {
      await updatePatient({ id: patient.id, updates: { medical_history: JSON.stringify(next) } });
      toast.success("Medical history updated");
    } catch {
      toast.error("Failed to update medical history");
    }
  };

  return (
    <div className="flex flex-col gap-[13px]">
      {HISTORY_FIELDS.map((field) => {
        const isEditing = editingKey === field.key;
        return (
          <div key={field.key} className="rounded-[14px] border border-border bg-card px-[18px] py-4 shadow-sm">
            <div className="mb-[7px] flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-[.06em] text-muted-foreground">{field.label}</div>
              <button
                type="button"
                aria-label={isEditing ? `Save ${field.label}` : `Edit ${field.label}`}
                onClick={() => {
                  if (isEditing) {
                    setEditingKey(null);
                    save(history);
                  } else {
                    setEditingKey(field.key);
                  }
                }}
                className="p-0.5 text-[var(--nv-faint)] transition-colors hover:text-primary"
              >
                {isEditing ? <Check size={14} strokeWidth={2} /> : <Pencil size={14} strokeWidth={2} />}
              </button>
            </div>
            {isEditing ? (
              <textarea
                autoFocus
                value={history[field.key] || ""}
                onChange={(event) => setHistory((current) => ({ ...current, [field.key]: event.target.value }))}
                rows={3}
                className={`${inputClass} resize-y text-[13.5px] leading-[1.55]`}
              />
            ) : (
              <p className="text-[13.5px] leading-[1.55] text-foreground/80">{history[field.key] || <span className="text-[var(--nv-faint)]">Not recorded yet — use the pencil to add it.</span>}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PatientDetailClient({ id }: { id: string }) {
  return (
    <Suspense>
      <PatientWorkbench id={id} />
    </Suspense>
  );
}
