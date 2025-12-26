"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ViewRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: {
    title?: string;
    date?: string;
    content?: any;
    description?: string;
  };
}

export function ViewRecordModal({ open, onOpenChange, note }: ViewRecordModalProps) {
  const renderContent = () => {
    if (!note.content || !note.content.blocks) {
      return <p className="text-gray-500">No content available</p>;
    }

    return note.content.blocks.map((block: any, index: number) => {
      switch (block.type) {
        case "header":
          const level = block.data.level;
          const HeaderTag = `h${level}`;
          return (
            <div
              key={index}
              className="font-bold mb-2"
              dangerouslySetInnerHTML={{ __html: `<${HeaderTag}>${block.data.text}</${HeaderTag}>` }}
            />
          );
        case "paragraph":
          return (
            <p
              key={index}
              className="mb-3"
              dangerouslySetInnerHTML={{ __html: block.data.text }}
            />
          );
        case "list":
          const ListTag = block.data.style === "ordered" ? "ol" : "ul";
          return (
            <ListTag key={index} className="list-disc list-inside mb-3">
              {block.data.items.map((item: string, i: number) => (
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
