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
      <DialogContent className="w-[90vw] h-[80vh] p-0 gap-0">
        <div className="p-4">

        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <DialogTitle>Medical History - {patientName}</DialogTitle>
        </VisuallyHidden>

        {/* PDF Viewer */}
        <div className="max-w-5xl w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-950 rounded-lg">
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
