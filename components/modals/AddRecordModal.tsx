"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import EditorJS from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "@/lib/tool";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { formatLocalDateTime } from "@/lib/utils";

interface AddRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export function AddRecordModal({ open, onOpenChange, patientId }: AddRecordModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const editorRef = useRef<EditorJS | null>(null);
  const createNote = useMutation(api.medical_history_notes.create);

  useEffect(() => {
    if (open && !editorRef.current) {
      editorRef.current = new EditorJS({
        holder: "add-record-editor",
        tools: EDITOR_TOOLS,
        placeholder: "Start writing your notes...",
        data: { time: new Date().getTime(), blocks: [] },
      });
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [open]);

  const handleSave = async () => {
    if (!editorRef.current) return;

    try {
      const content = await editorRef.current.save();

      // Extract description from first paragraph
      const firstParagraph = content.blocks.find(block => block.type === "paragraph");
      const description = firstParagraph?.data?.text || "";

      await createNote({
        patient_id: patientId,
        title: title || "Untitled Record",
        description,
        date: formatLocalDateTime(date),
        content,
      });

      toast.success("Record created successfully");
      setTitle("");
      setDate(new Date());
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to create record: " + message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="flex items-center gap-3 text-[17px] font-extrabold">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><FolderPlus size={18} /></span>
            New note
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
              id="add-record-editor"
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
              Save note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
