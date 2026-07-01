"use client";

import { api } from "@/convex/_generated/api";
import { EmergencyContactCard } from "@/components/PatientDetail/EmergencyContactCard";
import { PatientInfoCard } from "@/components/PatientDetail/PatientInfoCard";
import { SessionHistoryTab } from "@/components/PatientDetail/SessionHistoryTab";
import { MedicalNotesTable } from "@/components/MedicalNotesTable";
import { AddRecordModal } from "@/components/modals/AddRecordModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { medicalHistoryLabels } from "@/lib/utils";
import { useQuery } from "convex/react";
import { ArrowLeft, CheckCircle2, Clock3, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const mockGoals = [
  "Reduce symptom frequency and intensity",
  "Build a consistent coping practice",
  "Re-engage with supportive activities",
];

export default function PatientDetailClient({ id }: { id: string }) {
  const patient = useQuery(api.patients.get, { id });
  const notes = useQuery(api.medical_history_notes.listByPatient, { patientId: id });
  const [activeTab, setActiveTab] = useState("overview");
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState({ expectations: "", mainTopic: "", symptoms: "", familyInfo: "", diagnosis: "" });

  useEffect(() => {
    if (!patient?.medical_history) return;
    const history = typeof patient.medical_history === "string" ? JSON.parse(patient.medical_history) : patient.medical_history;
    setMedicalHistory({
      expectations: history.expectations || "",
      mainTopic: history.mainTopic || "",
      symptoms: history.symptoms || "",
      familyInfo: history.familyInfo || "",
      diagnosis: history.diagnosis || "",
    });
  }, [patient]);

  if (patient === undefined) {
    return <div className="mx-auto grid max-w-[1280px] gap-5 px-4 py-6 lg:grid-cols-[280px_1fr]"><Skeleton className="h-[520px] rounded-[18px]" /><Skeleton className="h-[620px] rounded-[18px]" /></div>;
  }

  if (!patient) {
    return <div className="mx-auto max-w-[1280px] px-6 py-16 text-center text-sm text-muted-foreground">Patient not found.</div>;
  }

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px]">
      <Link href="/patients" className="mb-4 flex w-max items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary"><ArrowLeft size={15} strokeWidth={2.4} />All patients</Link>

      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <PatientInfoCard {...patient} id={id} />
          <EmergencyContactCard emergency_contact={patient.emergency_contact} patientId={id} />
        </aside>

        <main className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 h-auto w-full justify-start overflow-x-auto rounded-xl p-1">
              <TabsTrigger value="overview" className="flex-none px-4 py-2">Overview</TabsTrigger>
              <TabsTrigger value="notes" className="flex-none px-4 py-2">Notes & records</TabsTrigger>
              <TabsTrigger value="sessions" className="flex-none px-4 py-2">Sessions</TabsTrigger>
              <TabsTrigger value="history" className="flex-none px-4 py-2">Medical history</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
              <div className="flex flex-col gap-4">
                <Card className="p-5">
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">Clinical summary</div>
                  <p className="text-[13.5px] leading-6 text-foreground/80">{medicalHistory.mainTopic || medicalHistory.diagnosis || "Add a presenting concern or working formulation in Medical history to build the patient summary."}</p>
                </Card>

                <Card className="p-5">
                  <div className="mb-4 flex items-center justify-between"><h2 className="text-[15px] font-extrabold text-foreground">Treatment goals</h2><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{mockGoals.length} active</span></div>
                  <div className="space-y-3">
                    {mockGoals.map((goal, index) => <div key={goal} className="flex items-start gap-2.5 rounded-[10px] bg-secondary px-3 py-2.5"><CheckCircle2 size={16} className={index === 1 ? "mt-px text-[#be7c16]" : "mt-px text-[#15986a]"} /><span className="text-[12.5px] font-semibold text-foreground/80">{goal}</span></div>)}
                  </div>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <div className="border-b border-border px-5 py-4"><h2 className="text-[15px] font-extrabold text-foreground">Patient timeline</h2></div>
                <div className="p-3">
                  {notes === undefined ? <div className="space-y-3 p-2"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div> : notes.length ? notes.slice(0, 6).map((note) => (
                    <button key={note.id} type="button" onClick={() => setActiveTab("notes")} className="flex w-full items-start gap-3 rounded-[10px] px-2 py-3 text-left hover:bg-secondary">
                      <span className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-primary/10 text-primary"><FileText size={14} /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-bold text-foreground">{note.title || "Clinical note"}</span><span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{note.description || "Patient record updated"}</span></span>
                      <span className="flex items-center gap-1 whitespace-nowrap font-mono text-[10.5px] text-[var(--nv-faint)]"><Clock3 size={11} />{note.date || "—"}</span>
                    </button>
                  )) : <div className="px-4 py-10 text-center text-[12.5px] text-muted-foreground">No timeline activity yet.</div>}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><h2 className="text-[20px] font-extrabold tracking-[-.02em] text-foreground">Notes & records</h2><p className="text-[12.5px] text-muted-foreground">Clinical documentation for {patient.name}</p></div>
                <Button onClick={() => setAddRecordOpen(true)}><Plus size={15} />New note</Button>
              </div>
              <MedicalNotesTable notes={notes || []} patientId={id} loading={notes === undefined} />
            </TabsContent>

            <TabsContent value="sessions"><SessionHistoryTab patientId={id} /></TabsContent>

            <TabsContent value="history">
              <Card className="p-5">
                <div className="mb-5"><h2 className="text-[18px] font-extrabold text-foreground">Medical history</h2><p className="mt-1 text-[12.5px] text-muted-foreground">Presenting concerns, symptoms, context, and working formulation.</p></div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {Object.entries(medicalHistory).map(([key, value]) => (
                    <div key={key} className={key === "familyInfo" || key === "diagnosis" ? "lg:col-span-2" : ""}>
                      <Label htmlFor={`history-${key}`} className="mb-1.5 block text-[12px] font-bold">{medicalHistoryLabels[key] || key}</Label>
                      <Textarea id={`history-${key}`} value={value} onChange={(event) => setMedicalHistory((current) => ({ ...current, [key]: event.target.value }))} rows={4} />
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-end"><Button onClick={() => toast.info("Medical-history saving will be connected to the patient mutation next")}>Save changes</Button></div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <AddRecordModal open={addRecordOpen} onOpenChange={setAddRecordOpen} patientId={id} />
    </div>
  );
}
