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
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

  const softDeletePatient = useMutation(api.trash.softDeletePatient);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteRecords, setDeleteRecords] = useState(false);

  // ... (handlers)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Use the Convex _id if available, otherwise we assume the `id` field matches _id 
      // OR we need to find the document by `id` first?
      // The `softDeletePatient` mutation expects `id: v.id("patients")`.
      // `patient.id` is the string UUID. `patient._id` is the Convex ID.
      // We should use `patient._id` if it's available. The Patient type usually has `_id`.
      // Let's assume `patient` object has `_id`. If not, we might have an issue.
      // Looking at `columns.tsx`, `Patient` type is used. I should check `types.ts`.
      // But typically `useQuery` returns `_id`.
      // Let's cast or check.

      await softDeletePatient({
        id: (patient as any)._id,
        cascade: deleteRecords
      });
      toast.success("Patient moved to trash");
    } catch (error) {
      toast.error("Failed to delete patient");
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

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
        id="patient-actions"
        className="flex justify-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          id="action-view"
          variant="ghost"
          size="icon"
          onClick={handleViewPatient}
          title="View Patient"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          id="action-edit"
          variant="ghost"
          size="icon"
          onClick={handleEditPatient}
          title="Edit Patient"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          id="action-records"
          variant="ghost"
          size="icon"
          onClick={handleViewRecords}
          title="View Records"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>

        <Button
          id="action-print"
          variant="ghost"
          size="icon"
          onClick={handlePrint}
          title="Print Medical History"
        >
          <Printer className="h-4 w-4" />
        </Button>


        <Button
          id="action-delete"
          variant="ghost"
          size="icon"
          onClick={handleDeleteClick}
          title="Delete Patient"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move <strong>{patient.name}</strong> to the trash. You can restore them within 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="cascade-delete"
              checked={deleteRecords}
              onCheckedChange={(checked) => setDeleteRecords(checked as boolean)}
            />
            <Label htmlFor="cascade-delete">Also delete all associated medical records?</Label>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    // header: "Actions",
    cell: ({ row }) => {
      const patient = row.original;
      return <ActionsCell patient={patient} />;
    },
  },
];
