"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import EditorJS from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "@/lib/tool";
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
    content?: any;
    description?: string;
  };
  patientId: string;
}

export function EditRecordModal({ open, onOpenChange, note, patientId }: EditRecordModalProps) {
  const [title, setTitle] = useState(note.title || "");
  const [date, setDate] = useState<Date>(note.date ? new Date(note.date) : new Date());
  const editorRef = useRef<EditorJS | null>(null);
  const updateNote = useMutation(api.medical_history_notes.update);

  useEffect(() => {
    if (open && !editorRef.current) {
      editorRef.current = new EditorJS({
        holder: "edit-record-editor",
        tools: EDITOR_TOOLS,
        placeholder: "Start writing your notes...",
        data: note.content || { time: new Date().getTime(), blocks: [] },
      });
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
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
    } catch (error: any) {
      toast.error("Failed to update record: " + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-blue-600" />
            Edit Record
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title and Date */}
          <div className="grid grid-cols-2 gap-4">
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
              className="border rounded-md p-4 mt-2"
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
          <div className="flex justify-end gap-2">
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
