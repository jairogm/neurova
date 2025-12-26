"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, FolderOpen, Printer, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Patient } from "./types";
import { formatDateOfBirth } from "./utils";
import { ViewPatientModal } from "@/components/modals/ViewPatientModal";
import { PDFViewerModal } from "@/components/modals/PDFViewerModal";
import { generatePatientMedicalHistoryPDF } from "./pdf-generator";

// Actions cell component
function ActionsCell({ patient }: { patient: Patient }) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const router = useRouter();

  // Fetch patient's medical records
  const medicalNotes = useQuery(
    api.medical_history_notes.listByPatient,
    isPDFViewerOpen ? { patientId: patient.id } : "skip"
  );

  const handleViewPatient = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(false);
    setIsViewModalOpen(true);
  };

  const handleEditPatient = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setIsViewModalOpen(true);
  };

  const handleViewRecords = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/patients/${patient.id}/records`);
  };

  const handlePrint = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Open modal first to trigger data fetch
    setIsPDFViewerOpen(true);

    // Wait for data to load, then generate PDF
    // This will be handled by useEffect when medicalNotes loads
  };

  // Generate PDF when modal opens and data is loaded
  if (isPDFViewerOpen && medicalNotes && !pdfUrl) {
    const url = generatePatientMedicalHistoryPDF(patient, medicalNotes);
    setPdfUrl(url);
  }

  // Cleanup PDF URL when modal closes
  const handlePDFModalClose = (open: boolean) => {
    setIsPDFViewerOpen(open);
    if (!open && pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  return (
    <>
      <div
        className="flex justify-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleViewPatient}
          title="View Patient"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleEditPatient}
          title="Edit Patient"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleViewRecords}
          title="View Records"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrint}
          title="Print Medical History"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>

      <ViewPatientModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        patient={patient}
        isEditMode={isEditMode}
      />

      <PDFViewerModal
        open={isPDFViewerOpen}
        onOpenChange={handlePDFModalClose}
        pdfUrl={pdfUrl}
        patientName={patient.name}
      />
    </>
  );
}

// Patient columns definition
export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const patient = row.original;
      const initials = patient.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={patient.profile_img} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{patient.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
  },
  {
    accessorKey: "date_of_birth",
    header: "Date of Birth",
    cell: ({ row }) => {
      return formatDateOfBirth(row.getValue("date_of_birth"));
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const patient = row.original;
      return <ActionsCell patient={patient} />;
    },
  },
];
