"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Lock } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Billing gate. Accounts with a real Mercado Pago subscription are gated by
// its actual status; accounts without one keep the prototype-review toggle
// from NEUROVA.dc.html (paid vs unpaid preview, persisted in localStorage).

type BillingPrototypeValue = {
  subscriptionActive: boolean;
  hasRealSubscription: boolean;
  toggleSubscription: () => void;
  activatePlan: () => void;
};

const BillingPrototypeContext = createContext<BillingPrototypeValue>({
  subscriptionActive: true,
  hasRealSubscription: false,
  toggleSubscription: () => {},
  activatePlan: () => {},
});

export function useBillingPrototype() {
  return useContext(BillingPrototypeContext);
}

const STORAGE_KEY = "nv-billing-prototype";

export function BillingPrototypeProvider({ children }: { children: React.ReactNode }) {
  const subscription = useQuery(api.billing.getSubscription);
  const [prototypeActive, setPrototypeActive] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { subscriptionActive?: boolean };
        if (typeof parsed.subscriptionActive === "boolean") setPrototypeActive(parsed.subscriptionActive);
      }
    } catch {
      // Ignore unparsable stored state
    }
  }, []);

  const persist = useCallback((subscriptionState: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ subscriptionActive: subscriptionState }));
    } catch {
      // Storage unavailable — state stays in memory
    }
  }, []);

  // Only a stored Mercado Pago preapproval id counts as a real subscription.
  // Migrated therapist docs can carry stale payment_provider /
  // subscription_status values that must not be trusted on their own.
  const hasRealSubscription = Boolean(subscription?.subscriptionId);
  // past_due keeps access: Mercado Pago retries the charge on its own, and a
  // clinician shouldn't be locked out of patient records mid-dunning.
  const subscriptionActive = hasRealSubscription
    ? subscription!.status === "active" || subscription!.status === "past_due"
    : prototypeActive;

  const toggleSubscription = useCallback(() => {
    setPrototypeActive((current) => {
      persist(!current);
      return !current;
    });
  }, [persist]);

  // "Pay and enter app": start a real Mercado Pago checkout. If payments
  // aren't configured yet (no MP credentials), fall back to the prototype
  // unlock so local review keeps working.
  const activatePlan = useCallback(async () => {
    setRedirecting(true);
    try {
      const res = await fetch("/api/billing/subscribe", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 503) {
        setPrototypeActive(true);
        persist(true);
        toast.info("Payments are not configured yet — unlocked in prototype mode");
        return;
      }
      throw new Error(data.error || "Could not start the checkout");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the checkout");
    } finally {
      setRedirecting(false);
    }
  }, [persist]);

  const value = useMemo(
    () => ({ subscriptionActive, hasRealSubscription, toggleSubscription, activatePlan }),
    [activatePlan, hasRealSubscription, subscriptionActive, toggleSubscription],
  );

  // Don't flash the paywall while the subscription query is still loading.
  const loaded = subscription !== undefined;

  return (
    <BillingPrototypeContext.Provider value={value}>
      {children}
      {loaded && !subscriptionActive && (
        <PaywallOverlay
          onActivate={activatePlan}
          busy={redirecting}
          pending={hasRealSubscription && subscription!.status === "pending"}
        />
      )}
    </BillingPrototypeContext.Provider>
  );
}

function PaywallOverlay({ onActivate, busy, pending }: { onActivate: () => void; busy: boolean; pending: boolean }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[rgba(6,17,21,.72)] p-[26px] backdrop-blur-lg" role="dialog" aria-modal="true" aria-label="Payment required">
      <div className="w-[900px] max-w-[94vw] overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_24px_60px_-20px_rgba(12,30,36,.35)]">
        <div className="grid max-h-[92dvh] min-h-0 overflow-auto sm:min-h-[440px] sm:grid-cols-[.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0e96b8,#0b7693)] p-6 text-white sm:p-[30px] dark:bg-[linear-gradient(150deg,#0d2933,#081d25)]">
            <div className="absolute -right-[60px] -top-[70px] size-[230px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.24),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(63,182,214,.22),transparent_70%)]" />
            <div className="relative flex h-full flex-col">
              <div className="flex size-12 items-center justify-center rounded-[15px] border border-white/[.28] bg-white/[.16] text-white dark:border-white/[.16] dark:bg-white/10 dark:text-[#3fb6d6]">
                <Lock size={23} strokeWidth={1.9} />
              </div>
              <div className="mt-7 text-[11px] font-extrabold uppercase tracking-[.1em] text-white dark:text-[#3fb6d6]">Payment required</div>
              <h2 className="mt-2.5 text-[28px] font-extrabold leading-[1.12] tracking-[-.02em]">Choose a plan to continue.</h2>
              <p className="mt-3.5 text-sm leading-[1.65] text-white/[.88] dark:text-[#a2bac1]">
                This workspace has been created, but access to patients, notes, schedule, and records unlocks after an active NEUROVA plan is attached.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 text-[12.5px] text-white/[.94] sm:mt-auto dark:text-[#eaf5f7]">
                <div className="flex gap-[9px]"><span className="font-extrabold text-white dark:text-[#3fb6d6]">✓</span><span>Plan required before clinical workspace access</span></div>
                <div className="flex gap-[9px]"><span className="font-extrabold text-white dark:text-[#3fb6d6]">✓</span><span>Cancel anytime from the billing page</span></div>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 sm:p-[30px]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[19px] font-extrabold text-foreground">Activate billing</h3>
                <p className="mt-[5px] text-[13px] leading-normal text-muted-foreground">Start the individual therapist plan to unlock this workspace.</p>
              </div>
              <span className="rounded-full bg-[#f6ecd8] px-2.5 py-[5px] text-[11px] font-extrabold text-[#be7c16] dark:bg-[#33280f] dark:text-[#d29a3a]">Locked</span>
            </div>
            <div className="max-w-[300px]">
              <div className="rounded-2xl border-[1.5px] border-[#8acfe0] bg-card p-[18px] dark:border-[#1f5664]">
                <div className="text-[11px] font-extrabold uppercase tracking-[.08em] text-primary">Individual</div>
                <div className="mt-3.5 flex items-baseline gap-[5px]">
                  <span className="text-[31px] font-extrabold tracking-[-.04em] text-foreground">50.000</span>
                  <span className="text-xs font-extrabold text-muted-foreground">COP/mo</span>
                </div>
                <p className="mb-4 mt-2.5 text-[12.5px] leading-[1.55] text-muted-foreground">
                  For one therapist managing their own patients, calendar, notes, and billing status.
                </p>
                <button
                  type="button"
                  onClick={onActivate}
                  disabled={busy}
                  className="w-full rounded-[10px] bg-primary px-3 py-2.5 text-[12.5px] font-extrabold text-primary-foreground transition-colors hover:bg-[#0b7693] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Redirecting…" : pending ? "Resume payment" : "Pay and enter app"}
                </button>
              </div>
            </div>
            <div className="mt-[18px] border-t border-border pt-4 text-[11.5px] leading-[1.55] text-[var(--nv-faint)]">
              Payments are processed securely by Mercado Pago — you&apos;ll be redirected to authorize the subscription and returned here when it&apos;s done.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
