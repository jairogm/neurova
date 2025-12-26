"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MedicalNotesTable } from "@/components/MedicalNotesTable";
import { useState } from "react";
import { AddRecordModal } from "@/components/modals/AddRecordModal";

export default function PatientRecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Unwrap params
  const [patientId, setPatientId] = useState<string | null>(null);

  params.then(p => setPatientId(p.id));

  const patient = useQuery(api.patients.get, patientId ? { id: patientId } : "skip");
  const notes = useQuery(
    api.medical_history_notes.listByPatient,
    patientId ? { patientId } : "skip"
  );

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
            variant="ghost"
            size="icon"
            onClick={() => router.push("/patients")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Records - {patient.name}</h1>
            <p className="text-sm text-gray-500">Cuidadat tempore a</p>
          </div>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      {/* Medical Notes Table */}
      <MedicalNotesTable
        notes={notes || []}
        patientId={patientId}
        loading={notes === undefined}
      />

      {/* Add Record Modal */}
      <AddRecordModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        patientId={patientId}
      />
    </div>
  );
}
