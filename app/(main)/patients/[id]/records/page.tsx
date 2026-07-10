"use client";

import { api } from "@/convex/_generated/api";
import { MedicalNotesTable } from "@/components/MedicalNotesTable";
import { AddRecordModal } from "@/components/modals/AddRecordModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTutorial } from "@/hooks/useTutorial";
import { exportPatientMedicalHistoryPDF } from "@/lib/pdf-generator";
import { useQuery } from "convex/react";
import { ArrowLeft, FileDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function PatientRecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params);
  const router = useRouter();
  const patient = useQuery(api.patients.get, { id: patientId });
  const notes = useQuery(api.medical_history_notes.listByPatient, { patientId });
  const [addOpen, setAddOpen] = useState(false);
  const { startRecordsTour, currentTourPage } = useTutorial();

  useEffect(() => {
    if (currentTourPage !== "pre-records" && currentTourPage !== "records") return;
    const timer = window.setTimeout(startRecordsTour, 800);
    return () => window.clearTimeout(timer);
  }, [currentTourPage, startRecordsTour]);

  if (patient === undefined) return <div className="mx-auto max-w-[1280px] px-6 py-8"><Skeleton className="h-[500px] rounded-[18px]" /></div>;
  if (!patient) return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Patient not found.</div>;

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-[26px]">
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button id="records-back-btn" variant="outline" size="icon" onClick={() => router.push(`/patients/${patientId}`)} className="size-9"><ArrowLeft size={15} /></Button>
          <div><h1 className="text-[22px] font-extrabold tracking-[-.02em] text-foreground">Notes & records</h1><p className="mt-0.5 text-[12.5px] text-muted-foreground">{patient.name} · Clinical documentation</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={notes === undefined} onClick={() => exportPatientMedicalHistoryPDF(patient, notes ?? [])}><FileDown size={15} />Export PDF</Button>
          <Button id="add-record-btn" onClick={() => setAddOpen(true)}><Plus size={15} />New note</Button>
        </div>
      </div>

      <div id="records-table"><MedicalNotesTable notes={notes || []} patientId={patientId} loading={notes === undefined} /></div>
      <AddRecordModal open={addOpen} onOpenChange={setAddOpen} patientId={patientId} />
    </div>
  );
}
