"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MedicalNotesTable } from "@/components/MedicalNotesTable";
import { useState, useEffect } from "react";
import { AddRecordModal } from "@/components/modals/AddRecordModal";
import { useTutorial } from "@/hooks/useTutorial";

export default function PatientRecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { startRecordsTour, currentTourPage } = useTutorial();

  // Unwrap params
  const [patientId, setPatientId] = useState<string | null>(null);

  params.then(p => setPatientId(p.id));

  const patient = useQuery(api.patients.get, patientId ? { id: patientId } : "skip");
  const notes = useQuery(
    api.medical_history_notes.listByPatient,
    patientId ? { patientId } : "skip"
  );

  // Start records tour if coming from trash page
  useEffect(() => {
    if (currentTourPage === "pre-records" || currentTourPage === "records") {
      const timer = setTimeout(() => {
        startRecordsTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentTourPage, startRecordsTour]);

  if (!patientId || patient === undefined) {
    return <div>Loading...</div>;
  }

  if (patient === null) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            id="records-back-btn"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/patients")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Records - {patient.name}</h1>
            <p className="text-sm text-gray-500">Medical history and clinical notes</p>
          </div>
        </div>

        <Button id="add-record-btn" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      {/* Medical Notes Table */}
      <div id="records-table">
        <MedicalNotesTable
          notes={notes || []}
          patientId={patientId}
          loading={notes === undefined}
        />
      </div>

      {/* Add Record Modal */}
      <AddRecordModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        patientId={patientId}
      />
    </div>
  );
}
