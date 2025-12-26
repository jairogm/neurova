"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ViewRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: {
    title?: string;
    date?: string;
    content?: unknown;
    description?: string;
  };
}

export function ViewRecordModal({ open, onOpenChange, note }: ViewRecordModalProps) {
  const renderContent = () => {
    if (!note.content || !(note.content as { blocks?: unknown[] }).blocks) {
      return <p className="text-gray-500">No content available</p>;
    }

    return (note.content as { blocks: unknown[] }).blocks.map((block: unknown, index: number) => {
      const typedBlock = block as { type: string; data: { level?: number; text?: string; style?: string; items?: string[] } };
      switch (typedBlock.type) {
        case "header":
          const level = typedBlock.data.level;
          const HeaderTag = `h${level}`;
          return (
            <div
              key={index}
              className="font-bold mb-2"
              dangerouslySetInnerHTML={{ __html: `<${HeaderTag}>${typedBlock.data.text}</${HeaderTag}>` }}
            />
          );
        case "paragraph":
          return (
            <p
              key={index}
              className="mb-3"
              dangerouslySetInnerHTML={{ __html: typedBlock.data.text || "" }}
            />
          );
        case "list":
          const ListTag = typedBlock.data.style === "ordered" ? "ol" : "ul";
          return (
            <ListTag key={index} className="list-disc list-inside mb-3">
              {(typedBlock.data.items || []).map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ListTag>
          );
        default:
          return null;
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note.title || "Untitled Record"}</DialogTitle>
          {note.date && (
            <p className="text-sm text-gray-500">
              {format(new Date(note.date), "MMMM dd, yyyy")}
            </p>
          )}
        </DialogHeader>

        <div className="prose max-w-none">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
