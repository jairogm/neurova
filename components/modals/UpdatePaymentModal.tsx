"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { updatePaymentStatus } from "@/lib/supabase/sessions";
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
  const queryClient = useQueryClient();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");

  // Load session data when modal opens
  useEffect(() => {
    if (open && session) {
      setPaymentStatus(session.payment_status);
    }
  }, [open, session]);

  const updateMutation = useMutation({
    mutationFn: () => {
      return updatePaymentStatus(
        session.id,
        paymentStatus
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", session.patient_id] });
      toast.success("Payment updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update payment: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
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
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
