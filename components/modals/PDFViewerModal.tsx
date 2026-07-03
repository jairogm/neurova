"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PDFViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  patientName: string;
}

export function PDFViewerModal({ open, onOpenChange, pdfUrl, patientName }: PDFViewerModalProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[80vh] w-[90vw] max-w-5xl gap-0 overflow-hidden p-0">
        <div className="h-full p-4 pt-12">

        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <DialogTitle>Medical History - {patientName}</DialogTitle>
        </VisuallyHidden>

        {/* PDF Viewer */}
        <div className="h-full w-full overflow-hidden rounded-xl border border-border bg-secondary">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading PDF...</p>
            </div>
          )}
        </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
