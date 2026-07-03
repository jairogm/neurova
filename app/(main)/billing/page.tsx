"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useBillingPrototype } from "@/components/BillingPrototypeProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { CreditCard, Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
  const { subscriptionActive } = useBillingPrototype();
  const profile = useQuery(api.billing.getProfile);
  const paymentMethods = useQuery(api.billing.listPaymentMethods);
  const invoices = useQuery(api.billing.listInvoices);
  const updateProfile = useMutation(api.billing.updateProfile);
  const addPaymentMethod = useMutation(api.billing.addPaymentMethod);
  const setPrimary = useMutation(api.billing.setPrimaryPaymentMethod);
  const removeMethod = useMutation(api.billing.removePaymentMethod);

  const [methodOpen, setMethodOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!profile) return;
    setBillingEmail(profile.billing_email);
    setTaxId(profile.tax_id);
    setAddress(profile.billing_address);
  }, [profile]);

  const renewalLabel = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 23);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const saveProfile = async () => {
    try {
      await updateProfile({ billing_email: billingEmail, tax_id: taxId, billing_address: address });
      toast.success("Billing information saved");
    } catch {
      toast.error("Failed to save billing information");
    }
  };

  const addMethod = async () => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 4) {
      toast.error("Enter a card number");
      return;
    }
    const brand = digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Amex";
    try {
      await addPaymentMethod({ brand, last4: digits.slice(-4), exp: cardExp || "03/29", name: cardName || "New card" });
      toast.success("Payment method added");
      setMethodOpen(false);
      setCardNumber(""); setCardExp(""); setCardName("");
    } catch {
      toast.error("Failed to add payment method");
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-[26px]">
      <div className="mb-[18px] flex items-center gap-[13px]">
        <span className="flex size-[42px] flex-none items-center justify-center rounded-[13px] bg-primary/10 text-primary"><CreditCard size={20} strokeWidth={1.9} /></span>
        <div><h1 className="text-[24px] font-extrabold tracking-[-.02em] text-foreground">Billing</h1><p className="mt-1 text-[13.5px] text-muted-foreground">Manage your NEUROVA plan, payment methods, and billing history.</p></div>
      </div>

      <div className="grid items-start gap-[18px] lg:grid-cols-[1.05fr_.95fr]">
        <div className="flex flex-col gap-[18px]">
          <section className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#0e96b8,#0b7693)] p-[22px] text-white shadow-[0_16px_40px_-16px_rgba(11,118,147,.5)]">
            <span className="absolute -right-10 -top-12 size-[190px] rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between gap-[18px]">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[.1em] opacity-80">Current plan</div>
                <div className="mt-2 text-[24px] font-extrabold tracking-[-.02em]">Individual therapist</div>
                <div className="mt-1 text-[13px] opacity-85">50.000 COP / Monthly</div>
              </div>
              <span className="rounded-full border border-white/25 bg-white/15 px-[11px] py-1 text-[11px] font-extrabold">{subscriptionActive ? "Active" : "Payment required"}</span>
            </div>
            <div className="relative mt-[22px] grid grid-cols-3 gap-2.5">
              {[["Renews", subscriptionActive ? renewalLabel() : "Activate to start"], ["Seats", "1 therapist"], ["Currency", "COP"]].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/15 bg-white/10 p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-[.08em] opacity-70">{label}</div>
                  <div className="mt-1 font-mono text-[12.5px] font-bold">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h2 className="text-[15px] font-extrabold text-foreground">Payment methods</h2><p className="mt-1 text-[12.5px] text-muted-foreground">Choose which card NEUROVA uses for monthly billing.</p></div>
              <Button onClick={() => setMethodOpen(true)} className="h-9 px-3"><Plus size={14} />Add method</Button>
            </div>
            <div className="space-y-2.5">
              {paymentMethods === undefined ? (
                <><Skeleton className="h-[68px] w-full rounded-[13px]" /><Skeleton className="h-[68px] w-full rounded-[13px]" /></>
              ) : paymentMethods.length ? paymentMethods.map((method) => (
                <div key={method._id} className="flex flex-wrap items-center gap-[13px] rounded-[13px] border border-border bg-secondary p-[13px]">
                  <span className={`flex size-[42px] items-center justify-center rounded-xl text-xs font-extrabold ${method.is_primary ? "bg-[linear-gradient(135deg,#0e96b8,#0b7693)] text-white" : "bg-card text-muted-foreground"}`}>{method.brand.slice(0, 4)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-extrabold text-foreground">{method.brand} •••• {method.last4}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${method.is_primary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{method.is_primary ? "Default" : "Backup"}</span>
                    </div>
                    <div className="mt-1 text-[11.5px] text-muted-foreground">{method.name} · expires {method.exp}</div>
                  </div>
                  {method.is_primary ? (
                    <span className="rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-bold text-muted-foreground">Default</span>
                  ) : (
                    <>
                      <button type="button" onClick={() => setPrimary({ id: method._id as Id<"payment_methods"> })} className="rounded-lg border border-border bg-card px-2.5 py-[7px] text-[11.5px] font-extrabold text-primary transition-colors hover:border-primary">Set default</button>
                      <button type="button" onClick={() => removeMethod({ id: method._id as Id<"payment_methods"> })} className="rounded-lg border border-[#d2574f] bg-[#f8e5e3] px-2.5 py-[7px] text-[11.5px] font-extrabold text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]">Remove</button>
                    </>
                  )}
                </div>
              )) : (
                <div className="rounded-[13px] border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">No payment methods yet — add your first card.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-[18px]">
          <Card className="p-5">
            <h2 className="mb-4 text-[15px] font-extrabold text-foreground">Billing information</h2>
            <div className="space-y-[13px]">
              <div><Label htmlFor="billing-email" className="mb-1.5 block text-xs font-bold">Billing email</Label><Input id="billing-email" value={billingEmail} onChange={(event) => setBillingEmail(event.target.value)} placeholder="billing@email.com" /></div>
              <div><Label htmlFor="tax-id" className="mb-1.5 block text-xs font-bold">Tax ID / NIT</Label><Input id="tax-id" value={taxId} onChange={(event) => setTaxId(event.target.value)} placeholder="CC or NIT" /></div>
              <div><Label htmlFor="billing-address" className="mb-1.5 block text-xs font-bold">Billing address</Label><Textarea id="billing-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Billing address" /></div>
              <div className="flex justify-end"><Button onClick={saveProfile}>Save changes</Button></div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-[17px]">
              <div><h2 className="text-[15px] font-extrabold text-foreground">Billing history</h2><p className="mt-1 text-[12.5px] text-muted-foreground">Invoices and receipts for your account.</p></div>
              <Button variant="outline" className="h-8 px-2.5 text-[11.5px]"><Download size={13} />Download all</Button>
            </div>
            {invoices === undefined ? (
              <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
            ) : invoices.length ? invoices.map((invoice) => (
              <div key={invoice._id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-5 py-3.5 last:border-0 sm:grid-cols-[1fr_.9fr_.7fr_auto]">
                <div className="min-w-0"><div className="text-[13px] font-extrabold text-foreground">{invoice.invoice}</div><div className="mt-0.5 text-[11.5px] text-muted-foreground">{invoice.description}</div></div>
                <div className="hidden sm:block"><div className="font-mono text-xs text-foreground/80">{invoice.date}</div><div className="mt-0.5 text-[11px] text-[var(--nv-faint)]">{invoice.method}</div></div>
                <div className="hidden text-right font-mono text-[12.5px] font-extrabold text-foreground sm:block">{invoice.amount}</div>
                <span className={`rounded-full px-[9px] py-1 text-[11px] font-extrabold ${invoice.status === "Paid" ? "bg-[#e2f1ea] text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]" : "bg-[#f6ecd8] text-[#be7c16] dark:bg-[#33280f] dark:text-[#d29a3a]"}`}>{invoice.status}</span>
              </div>
            )) : (
              <div className="px-6 py-10 text-center text-[13px] text-muted-foreground">No invoices yet.</div>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={methodOpen} onOpenChange={setMethodOpen}>
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5 pr-12"><DialogTitle className="text-[17px] font-extrabold">Add payment method</DialogTitle><DialogDescription>Card data is mocked until the payment provider is connected.</DialogDescription></DialogHeader>
          <div className="space-y-4 p-6">
            <div><Label htmlFor="card-number" className="mb-1.5 block">Card number</Label><Input id="card-number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="4242 4242 4242 4242" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="expiry" className="mb-1.5 block">Expiry</Label><Input id="expiry" value={cardExp} onChange={(event) => setCardExp(event.target.value)} placeholder="MM / YY" /></div>
              <div><Label htmlFor="card-name" className="mb-1.5 block">Name on card</Label><Input id="card-name" value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Cardholder" /></div>
            </div>
          </div>
          <DialogFooter className="border-t border-border px-6 py-4"><Button variant="outline" onClick={() => setMethodOpen(false)}>Cancel</Button><Button onClick={addMethod}>Add method</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
