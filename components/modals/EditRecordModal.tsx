"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import { createEditor, destroyEditor } from "@/lib/tool";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { formatLocalDateTime } from "@/lib/utils";

interface EditRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: {
    id: string;
    title?: string;
    date?: string;
    content?: unknown;
    description?: string;
  };
  patientId: string;
}

export function EditRecordModal({ open, onOpenChange, note }: EditRecordModalProps) {
  const [title, setTitle] = useState(note.title || "");
  const [date, setDate] = useState<Date>(note.date ? new Date(note.date) : new Date());
  const editorRef = useRef<EditorJS | null>(null);
  const updateNote = useMutation(api.medical_history_notes.update);

  useEffect(() => {
    if (!open || editorRef.current) return;
    // EditorJS only loads in the browser, so guard against the modal closing
    // before the dynamic import resolves.
    let cancelled = false;
    createEditor({
      holder: "edit-record-editor",
      placeholder: "Start writing your notes...",
      data: (note.content as OutputData) || { time: new Date().getTime(), blocks: [] },
    })
      .then((editor) => {
        if (cancelled) {
          destroyEditor(editor);
          return;
        }
        editorRef.current = editor;
      })
      .catch(() => toast.error("Failed to load the editor"));

    return () => {
      cancelled = true;
      destroyEditor(editorRef.current);
      editorRef.current = null;
    };
  }, [open, note.content]);

  const handleSave = async () => {
    if (!editorRef.current) return;

    try {
      const content = await editorRef.current.save();

      // Extract description from first paragraph
      const firstParagraph = content.blocks.find(block => block.type === "paragraph");
      const description = firstParagraph?.data?.text || "";

      await updateNote({
        id: note.id,
        title: title || "Untitled Record",
        description,
        date: formatLocalDateTime(date),
        content,
      });

      toast.success("Record updated successfully");
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to update record: " + message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="flex items-center gap-3 text-[17px] font-extrabold">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Pencil size={17} /></span>
            Edit note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6">
          {/* Title and Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Name Record</Label>
              <Input
                id="title"
                placeholder="Give a name to this record..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setDate(new Date(e.target.value));
                  }
                }}
              />
            </div>
          </div>

          {/* Editor */}
          <div>
            <Label>Notes</Label>
            <div
              id="edit-record-editor"
              className="mt-2 rounded-xl border border-border bg-secondary p-4"
              style={{
                height: '400px',
                maxHeight: '400px',
                overflowY: 'auto',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
