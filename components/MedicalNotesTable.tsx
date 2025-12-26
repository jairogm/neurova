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
  const deleteNote = useMutation(api.medical_history_notes.remove);

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
      await deleteNote({ id: noteToDelete });
      toast.success("Record deleted successfully");
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
    // Remove HTML tags and decode HTML entities
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "—";
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableHead>Date</TableHead>
              <TableHead>Name Record</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-center">Actions</TableHead>
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
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              sortedNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{formatDate(note.date)}</TableCell>
                  <TableCell className="font-medium">{note.title || "Untitled"}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {stripHtmlTags(note.description)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleView(note)}
                        title="View record"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(note)}
                        title="Edit record"
                      >
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setNoteToDelete(note.id)}
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
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
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
