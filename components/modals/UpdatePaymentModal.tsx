"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Session, PaymentStatus } from "@/lib/types";

interface UpdatePaymentModalProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdatePaymentModal({
  session,
  open,
  onOpenChange,
}: UpdatePaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePayment = useMutation(api.sessions.updatePayment);

  // Load session data when modal opens
  useEffect(() => {
    if (open && session && session.payment_status) {
      setPaymentStatus(session.payment_status);
    }
  }, [open, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session.id) {
      toast.error("Session ID is missing");
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePayment({
        id: session.id,
        payment_status: paymentStatus,
      });

      toast.success("Payment updated successfully");
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to update payment: " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Payment</DialogTitle>
          <DialogDescription>
            Update payment status for this session
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Status */}
          <div className="space-y-2">
            <Label>Payment Status *</Label>
            <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
