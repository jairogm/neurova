"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Trash2, Pencil } from "lucide-react";
import { useState, useMemo } from "react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
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
import { EditRecordModal } from "./modals/EditRecordModal";
import { ViewRecordModal } from "./modals/ViewRecordModal";

interface MedicalNote {
  id: string;
  title?: string;
  date?: string;
  description?: string;
  content?: unknown;
}

interface MedicalNotesTableProps {
  notes: MedicalNote[];
  patientId: string;
  loading?: boolean;
}

export function MedicalNotesTable({ notes, patientId, loading = false }: MedicalNotesTableProps) {
  const [selectedNote, setSelectedNote] = useState<MedicalNote | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<MedicalNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const deleteNote = useMutation(api.trash.softDeleteRecord);

  // Sort notes from newest to latest
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });
  }, [notes]);

  const handleView = (note: MedicalNote) => {
    setSelectedNote(note);
  };

  const handleEdit = (note: MedicalNote) => {
    setNoteToEdit(note);
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote({ id: noteToDelete as Id<"medical_history_notes"> });
      toast.success("Record moved to trash");
      setNoteToDelete(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to delete record: " + message);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Strip HTML tags from description to show plain text only
  const stripHtmlTags = (html?: string) => {
    if (!html) return "—";
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "—";
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table className="min-w-[720px]">
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="h-14">
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full max-w-md" /></TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : sortedNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              sortedNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-mono text-[12px] text-muted-foreground">{formatDate(note.date)}</TableCell>
                  <TableCell className="font-bold text-foreground">{note.title || "Untitled"}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">
                    {stripHtmlTags(note.description)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-[30px] rounded-lg p-0 text-[var(--nv-faint)] shadow-none hover:border-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleView(note)}
                        title="View record"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-[30px] rounded-lg p-0 text-[var(--nv-faint)] shadow-none hover:border-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(note)}
                        title="Edit record"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-[30px] rounded-lg p-0 text-[var(--nv-faint)] shadow-none hover:border-[#d2574f] hover:bg-[#f8e5e3] hover:text-[#d2574f]"
                        onClick={() => setNoteToDelete(note.id)}
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Record Modal */}
      {selectedNote && (
        <ViewRecordModal
          open={!!selectedNote}
          onOpenChange={(open) => !open && setSelectedNote(null)}
          note={selectedNote}
        />
      )}

      {/* Edit Record Modal */}
      {noteToEdit && (
        <EditRecordModal
          open={!!noteToEdit}
          onOpenChange={(open) => !open && setNoteToEdit(null)}
          note={noteToEdit}
          patientId={patientId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move record to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This record will remain recoverable for 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#d2574f] text-white hover:bg-[#b94741]">
              Move to trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
