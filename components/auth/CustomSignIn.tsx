"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PreviewRow = {
  tag: string;
  color: string;
  title: string;
  sub: string;
  meta: string;
};

type Slide = {
  icon: LucideIcon;
  title: string;
  body: string;
  previewLabel: string;
  rows: PreviewRow[];
};

const slides: Slide[] = [
  {
    icon: CalendarDays,
    title: "Your whole day, calm and in view.",
    body: "Today’s agenda, your next session, and Google Calendar sync — the moment you sign in.",
    previewLabel: "Today · 6 sessions",
    rows: [
      { tag: "DO", color: "#8FE3F2", title: "David Okafor", sub: "Therapy session", meta: "10:00" },
      { tag: "SM", color: "#9AD3E6", title: "Sofia Marin", sub: "Intake assessment", meta: "11:30" },
      { tag: "JL", color: "#C3B5E0", title: "James Lee", sub: "Progress review", meta: "14:00" },
    ],
  },
  {
    icon: Sparkles,
    title: "Notes written up in seconds — reviewed by you.",
    body: "Draft structured session summaries with AI, then review and sign off. Always clinician-approved, never automated diagnosis.",
    previewLabel: "AI summary · draft",
    rows: [
      { tag: "AI", color: "#8FE3F2", title: "Summary draft ready", sub: "Progress note · Maya T.", meta: "review" },
      { tag: "TP", color: "#9AD3E6", title: "Treatment plan", sub: "Updated Jun 04", meta: "saved" },
      { tag: "FU", color: "#C3B5E0", title: "Follow-up note", sub: "Autosaved", meta: "now" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Built for trust, private by default.",
    body: "PHI encrypted in transit and at rest, with clear data controls. Your patients’ records stay yours.",
    previewLabel: "Security",
    rows: [
      { tag: "✓", color: "#8FE3F2", title: "Encryption", sub: "In transit & at rest", meta: "on" },
      { tag: "✓", color: "#9AD3E6", title: "BAA & DPA", sub: "Signed agreements", meta: "on" },
      { tag: "✓", color: "#C3B5E0", title: "Access controls", sub: "Revoke anytime", meta: "on" },
    ],
  },
];

function NeurovaMark() {
  return (
    <Link href="/" className="inline-flex items-center gap-[11px] text-[#15252c]">
      <Image src="/icon.svg" width={30} height={30} alt="" unoptimized />
      <span className="text-[15px] font-extrabold tracking-[.16em]">NEUROVA</span>
    </Link>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C39.9 36.5 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function CustomSignIn() {
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % slides.length),
      5000,
    );
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSignedIn) router.replace("/dashboard");
  }, [isSignedIn, router]);

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    setIsLoading(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error: unknown) {
      const clerkError = error as { errors?: Array<{ code?: string }> };
      if (clerkError.errors?.some((item) => item.code === "session_exists")) {
        router.replace("/dashboard");
        return;
      }
      console.error("Error signing in with Google", error);
      setIsLoading(false);
    }
  };

  const slide = slides[activeIndex];
  const SlideIcon = slide.icon;

  return (
    <main style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }} className="grid min-h-dvh place-items-center bg-[#f4f8f9] text-[#36474f] md:p-6 xl:p-12">
      <div className="flex w-full max-w-[1200px] flex-col overflow-hidden bg-white md:min-h-[min(780px,calc(100dvh-48px))] md:flex-row md:rounded-[24px] md:border md:border-[#d6e5e6] md:shadow-[0_18px_60px_-40px_#17465366]">
      <section className="relative hidden flex-none flex-col md:flex overflow-hidden bg-[linear-gradient(135deg,#edf7f6,#c4e5e8)] px-5 py-5 text-[#163b45] md:h-auto md:flex-[1.1] md:px-8 lg:px-14 md:py-12">
        <div className="absolute -right-28 -top-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(63,182,214,.16),transparent_70%)]" />
        <div className="absolute -bottom-28 -left-20 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(44,143,176,.12),transparent_70%)]" />


        <div className="relative mx-auto my-auto hidden w-full max-w-[460px] md:block">
          <div className="mb-6 flex size-[46px] items-center justify-center rounded-[14px] border border-[#c9dcdf] bg-white/80">
            <SlideIcon size={22} strokeWidth={1.8} className="text-[#0b7693]" />
          </div>
          <h2 className="m-0 text-[34px] font-extrabold leading-[1.18] tracking-[-.02em]">{slide.title}</h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-[#526770]">{slide.body}</p>

          <div className="mt-8 rounded-2xl border border-[#d6e5e6] bg-white/95 p-3.5 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="size-[9px] rounded-full bg-[#3fb6d6]" />
              <span className="text-[11px] font-bold uppercase tracking-[.06em] text-[#526770]">{slide.previewLabel}</span>
            </div>
            {slide.rows.map((row) => (
              <div key={row.title} className="flex items-center gap-3 border-t border-[#e2e9eb] py-2.5">
                <div className="flex size-[30px] flex-none items-center justify-center rounded-[9px] text-[11px] font-bold text-[#062623]" style={{ background: row.color }}>{row.tag}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-[#163b45]">{row.title}</div>
                  <div className="text-[11px] text-[#526770]">{row.sub}</div>
                </div>
                <span className="font-mono text-[11.5px] text-[#526770]">{row.meta}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-[26px] bg-[#3fb6d6]" : "w-1.5 bg-[#94b7be] hover:bg-[#709aa2]"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh w-full flex-none flex-col overflow-auto bg-white px-[18px] py-5 md:min-h-0 md:w-auto md:flex-1 md:px-8 lg:px-12 md:py-10">
        <div className="flex justify-end">
          <Link href="/" className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#6c828c] transition-colors hover:text-[#0e96b8]">
            <ArrowLeft size={14} /> Back to site
          </Link>
        </div>

        <div className="my-auto w-full max-w-[380px] self-center py-8">
          <div className="mb-7"><NeurovaMark /></div>
          <h1 className="text-[34px] leading-[1.2] font-extrabold tracking-[-.02em] text-[#15252c]">Welcome back</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-[#6c828c]">Sign in to your NEUROVA practice workspace.</p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!isLoaded || isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#cfdadd] bg-white px-3 py-[13px] text-sm font-bold text-[#15252c] shadow-[0_1px_2px_rgba(16,40,46,.04),0_6px_20px_-8px_rgba(16,40,46,.12)] transition-colors hover:border-[#0e96b8] hover:bg-[#f4f7f8] disabled:cursor-wait disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={19} className="animate-spin text-[#0e96b8]" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="mt-3.5 flex items-start gap-2.5 rounded-[11px] border border-[#8acfe0] bg-[#e0f1f6] px-3.5 py-3">
            <CalendarDays size={16} strokeWidth={1.8} className="mt-px flex-none text-[#0e96b8]" />
            <p className="m-0 text-[13px] leading-[1.6] text-[#36474f]">Google sign-in lets NEUROVA sync your <strong className="text-[#15252c]">Google Calendar</strong> so appointments and sessions stay in one place. You can revoke access anytime.</p>
          </div>

          <div className="my-[22px] flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e2e9eb]" />
            <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#60757d]">More options soon</span>
            <div className="h-px flex-1 bg-[#e2e9eb]" />
          </div>

          <div aria-disabled="true" className="relative flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-[#e2e9eb] bg-[#f4f7f8] px-3 py-[13px] text-sm font-bold text-[#60757d]">
            <Mail size={18} strokeWidth={1.8} /> Continue with Outlook
            <span className="absolute right-3 rounded-full border border-[#e2e9eb] bg-white px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[.06em] text-[#6c828c]">Soon</span>
          </div>

          <p className="mt-7 text-center text-xs leading-[1.6] text-[#60757d]">
            By continuing you agree to NEUROVA&apos;s <Link href="/terms" className="font-semibold text-[#6c828c] hover:text-[#0e96b8]">Terms</Link>, <Link href="/privacy" className="font-semibold text-[#6c828c] hover:text-[#0e96b8]">Privacy</Link> &amp; <Link href="/baa" className="font-semibold text-[#6c828c] hover:text-[#0e96b8]">BAA</Link>. Protected health information is encrypted in transit and at rest.
          </p>
        </div>

        <div className="text-center text-xs text-[#60757d]">New to NEUROVA? <Link href="/#workflow" className="font-bold text-[#0b7693]">See how it works</Link></div>
      </section>
      </div>
    </main>
  );
}
