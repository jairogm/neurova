"use client";

import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
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
    title: "Your appointments and patient records.",
    body: "See your agenda and patient records. Connect Google Calendar from your workspace.",
    previewLabel: "Today · 6 sessions",
    rows: [
      { tag: "DO", color: "#8FE3F2", title: "David Okafor", sub: "Therapy session", meta: "10:00" },
      { tag: "SM", color: "#9AD3E6", title: "Sofia Marin", sub: "Intake assessment", meta: "11:30" },
      { tag: "JL", color: "#C3B5E0", title: "James Lee", sub: "Progress review", meta: "14:00" },
    ],
  },
  {
    icon: Sparkles,
    title: "Write the note. Review the summary.",
    body: "Draft a summary from your clinical note, then review it before adding it to the record.",
    previewLabel: "AI summary · draft",
    rows: [
      { tag: "AI", color: "#8FE3F2", title: "Summary draft ready", sub: "Progress note · Maya T.", meta: "review" },
      { tag: "TP", color: "#9AD3E6", title: "Treatment plan", sub: "Updated Jun 04", meta: "saved" },
      { tag: "FU", color: "#C3B5E0", title: "Follow-up note", sub: "Autosaved", meta: "now" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Keep patient records together.",
    body: "Keep consent forms, session notes, and patient history in the same workspace.",
    previewLabel: "Patient records",
    rows: [
      { tag: "✓", color: "#8FE3F2", title: "Documents", sub: "Signed consent forms", meta: "files" },
      { tag: "✓", color: "#9AD3E6", title: "Clinical notes", sub: "Session records", meta: "notes" },
      { tag: "✓", color: "#C3B5E0", title: "Patient timeline", sub: "Notes, sessions, and documents", meta: "history" },
    ],
  },
];

function NeurovaMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={compact ? 30 : 34} height={compact ? 30 : 34} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="url(#login-logo-gradient)" />
        <path d="M10 22.5V10.5L22 21.5V9.5" stroke="#EAFBF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="10.5" r="2" fill="#A7E9F6" />
        <circle cx="22" cy="21.5" r="2" fill="#A7E9F6" />
        <defs>
          <linearGradient id="login-logo-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0E96B8" />
            <stop offset="1" stopColor="#0B7693" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[17px] font-extrabold tracking-[.18em] text-white">NEUROVA</span>
    </div>
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

export function CustomSignIn({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const isSignUp = mode === "signup";
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [authError, setAuthError] = useState("");
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
    const authFlow = isSignUp ? signUp : signIn;
    if (!authFlow) return;
    setAuthError("");
    setIsLoading(true);

    try {
      await authFlow.authenticateWithRedirect({
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
      setAuthError("Unable to continue with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const slide = slides[activeIndex];
  const SlideIcon = slide.icon;

  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-[#eff3f4] text-[#36474f] md:h-dvh md:flex-row">
      <section className="relative flex h-[78px] flex-none flex-col overflow-hidden bg-[linear-gradient(150deg,#0d2933,#081d25)] px-5 py-5 text-white md:h-auto md:flex-[1.15] md:px-14 md:py-12">
        <div className="absolute -right-28 -top-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(63,182,214,.16),transparent_70%)]" />
        <div className="absolute -bottom-28 -left-20 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(44,143,176,.12),transparent_70%)]" />
        <div className="relative"><NeurovaMark compact /></div>

        <div className="relative mt-auto hidden max-w-[460px] md:block">
          <div className="mb-6 flex size-[46px] items-center justify-center rounded-[14px] border border-white/15 bg-white/10">
            <SlideIcon size={22} strokeWidth={1.8} className="text-[#a7e9f6]" />
          </div>
          <h2 className="m-0 text-[30px] font-extrabold leading-[1.18] tracking-[-.02em]">{slide.title}</h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-[#a2bac1]">{slide.body}</p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[.06] p-3.5 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="size-[9px] rounded-full bg-[#3fb6d6]" />
              <span className="text-[11px] font-bold uppercase tracking-[.06em] text-[#a2bac1]">{slide.previewLabel}</span>
            </div>
            {slide.rows.map((row) => (
              <div key={row.title} className="flex items-center gap-3 border-t border-white/[.07] py-2.5">
                <div className="flex size-[30px] flex-none items-center justify-center rounded-[9px] text-[11px] font-bold text-[#062623]" style={{ background: row.color }}>{row.tag}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-white">{row.title}</div>
                  <div className="text-[11px] text-[#a2bac1]">{row.sub}</div>
                </div>
                <span className="font-mono text-[11.5px] text-[#a2bac1]">{row.meta}</span>
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
                className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-[26px] bg-[#3fb6d6]" : "w-1.5 bg-white/25 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-[calc(100dvh-78px)] w-full flex-none flex-col overflow-auto bg-white px-[18px] py-5 md:min-h-0 md:w-[520px] md:max-w-[46vw] md:px-[52px] md:py-10">
        <div className="flex justify-end">
          <Link href="/" className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#6c828c] transition-colors hover:text-[#0e96b8]">
            <ArrowLeft size={14} /> Back to site
          </Link>
        </div>

        <div className="my-auto w-full max-w-[340px] self-center py-8">
          <div className="mb-[22px] flex size-[46px] items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,#0e96b8,#0b7693)]">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M10 22.5V10.5L22 21.5V9.5" stroke="#EAFBF8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="10.5" r="2.1" fill="#A7E9F6" /><circle cx="22" cy="21.5" r="2.1" fill="#A7E9F6" />
            </svg>
          </div>
          <h1 className="text-[26px] font-extrabold tracking-[-.02em] text-[#15252c]">{isSignUp ? "Create your NEUROVA account" : "Welcome back"}</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-[#6c828c]">{isSignUp ? "Set up your workspace for patients, appointments, and clinical notes." : "Sign in to your NEUROVA practice workspace."}</p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!(isSignUp ? signUpLoaded : isLoaded) || isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#cfdadd] bg-white px-3 py-[13px] text-sm font-bold text-[#15252c] shadow-[0_1px_2px_rgba(16,40,46,.04),0_6px_20px_-8px_rgba(16,40,46,.12)] transition-colors hover:border-[#0e96b8] hover:bg-[#f4f7f8] disabled:cursor-wait disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={19} className="animate-spin text-[#0e96b8]" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div id="clerk-captcha" />
          {authError && <p role="alert" className="mt-3 text-sm text-red-700">{authError}</p>}
          <div className="mt-3.5 flex items-start gap-2.5 rounded-[11px] border border-[#8acfe0] bg-[#e0f1f6] px-3.5 py-3">
            <CalendarDays size={16} strokeWidth={1.8} className="mt-px flex-none text-[#0e96b8]" />
            <p className="m-0 text-[11.5px] leading-[1.5] text-[#36474f]">Use Google to access your account. You can connect <strong className="text-[#15252c]">Google Calendar</strong> from your workspace.</p>
          </div>

          <div className="my-[22px] flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e2e9eb]" />
            <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#93a6ae]">More options soon</span>
            <div className="h-px flex-1 bg-[#e2e9eb]" />
          </div>

          <div aria-disabled="true" className="relative flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-[#e2e9eb] bg-[#f4f7f8] px-3 py-[13px] text-sm font-bold text-[#93a6ae]">
            <Mail size={18} strokeWidth={1.8} /> Continue with Outlook
            <span className="absolute right-3 rounded-full border border-[#e2e9eb] bg-white px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[.06em] text-[#6c828c]">Soon</span>
          </div>

          <p className="mt-7 text-center text-[11.5px] leading-[1.6] text-[#93a6ae]">
            By continuing you agree to NEUROVA&apos;s <Link href="/terms" className="font-semibold text-[#6c828c] hover:text-[#0e96b8]">Terms</Link> and <Link href="/privacy" className="font-semibold text-[#6c828c] hover:text-[#0e96b8]">Privacy</Link>.
          </p>
        </div>

        <div className="text-center text-[11.5px] text-[#93a6ae]">{isSignUp ? "Already have an account?" : "New to NEUROVA?"} <Link href={isSignUp ? "/auth/login" : "/auth/signup"} className="font-bold text-[#0e96b8]">{isSignUp ? "Sign in" : "Create an account"}</Link></div>
      </section>
    </main>
  );
}
