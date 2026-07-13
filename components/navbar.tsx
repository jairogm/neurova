"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { ScheduleAppointment } from "@/components/modals/ScheduleAppointment";
import { useBillingPrototype } from "@/components/BillingPrototypeProvider";
import { useCommandPalette } from "@/components/CommandPalette";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./theme-switcher";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const workspaceNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, activePath: "/dashboard" },
  { href: "/patients", label: "Patients", icon: Users, activePath: "/patients" },
  { href: "/schedule", label: "Schedule", icon: CalendarDays, activePath: "/schedule" },
  { href: "/notes", label: "Notes & records", icon: FileText, activePath: "/notes" },
];

function BrandMark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-[11px]" aria-label="NEUROVA dashboard">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="url(#app-logo-gradient)" />
        <path d="M10 22.5V10.5L22 21.5V9.5" stroke="#EAFBF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="10.5" r="2" fill="#A7E9F6" />
        <circle cx="22" cy="21.5" r="2" fill="#A7E9F6" />
        <defs><linearGradient id="app-logo-gradient" x1="2" y1="2" x2="30" y2="30"><stop stopColor="#0E96B8" /><stop offset="1" stopColor="#0B7693" /></linearGradient></defs>
      </svg>
      <span className="text-[15px] font-extrabold tracking-[.16em] text-foreground">NEUROVA</span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { open: openPalette } = useCommandPalette();
  const { subscriptionActive, hasRealSubscription, complimentary, toggleSubscription } = useBillingPrototype();

  const therapist = useQuery(api.users.getCurrentUser);
  const displayName = therapist?.full_name || user?.fullName || user?.primaryEmailAddress?.emailAddress || "Your practice";
  const userRole = therapist?.title || therapist?.specialization || "Mental-health professional";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const current = workspaceNavigation.find(
    (item) => item.activePath && (pathname === item.activePath || pathname.startsWith(`${item.activePath}/`)),
  );
  const isPatientDetail = pathname.startsWith("/patients/");
  const pageTitle = isPatientDetail
    ? "Patient workspace"
    : current?.label || (pathname === "/profile" ? "Therapist profile" : pathname === "/billing" ? "Billing" : pathname === "/trash" ? "Trash" : "NEUROVA");
  const pageSubtitle = isPatientDetail
    ? "Clinical details and records"
    : pageTitle === "Dashboard"
      ? "Today overview"
      : pageTitle === "Patients"
        ? "Manage your caseload"
        : pageTitle === "Trash"
          ? "Restore or permanently remove items"
          : pageTitle === "Schedule"
            ? "Week calendar and appointments"
            : pageTitle === "Notes & records"
              ? "All clinical records"
              : pageTitle === "Billing"
                ? "Plan, payment methods, and invoices"
                : "Professional information";

  const logout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <>
      <aside className="hidden h-dvh w-[250px] flex-none flex-col border-r border-[#e6edee] bg-[linear-gradient(180deg,#fbfcfc,#f2f6f6)] px-3.5 py-[18px] dark:border-[#233e47] dark:bg-[linear-gradient(180deg,#0e2025,#09171b)] lg:flex">
        <div className="px-2 pb-[18px] pt-1.5"><BrandMark /></div>

        <button
          type="button"
          onClick={openPalette}
          className="mb-4 flex w-full items-center gap-2.5 rounded-[10px] border border-[#e6edee] bg-primary/10 px-[11px] py-[9px] text-left text-[13px] text-[#5a6f77] transition-colors hover:border-primary dark:border-[#233e47] dark:text-[#a9bec2]"
        >
          <Search size={15} strokeWidth={2} />
          <span className="flex-1">Search…</span>
          <kbd className="rounded-[5px] border border-[#e6edee] bg-white/60 px-1.5 py-px font-mono text-[10px] dark:border-[#233e47] dark:bg-white/[.06]">⌘K</kbd>
        </button>

        <div className="px-2.5 pb-2 text-[10.5px] font-bold uppercase tracking-[.13em] text-[#90a4ab]">Workspace</div>
        <nav className="flex flex-col gap-[3px]" aria-label="Primary navigation">
          {workspaceNavigation.map((item) => {
            const Icon = item.icon;
            const active = Boolean(item.activePath && (pathname === item.activePath || pathname.startsWith(`${item.activePath}/`)));
            return (
              <Link
                key={item.label}
                id={item.label === "Patients" ? "nav-patients" : undefined}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${active ? "bg-primary/10 text-primary" : "text-[#5a6f77] hover:bg-primary/5 hover:text-foreground dark:text-[#a9bec2]"}`}
              >
                {active && <span className="absolute -left-3.5 inset-y-[9px] w-[3px] rounded-r bg-primary" />}
                <Icon size={17} strokeWidth={1.8} className={active ? "text-primary" : "text-[#90a4ab] dark:text-[#748c91]"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-[3px]">
          <Link href="/billing" className={`relative flex items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-[13px] font-semibold transition-colors ${pathname === "/billing" ? "bg-primary/10 text-primary" : "text-[#5a6f77] hover:bg-primary/5 hover:text-foreground dark:text-[#a9bec2]"}`}>
            {pathname === "/billing" && <span className="absolute -left-3.5 inset-y-[9px] w-[3px] rounded-r bg-primary" />}
            <CreditCard size={16} strokeWidth={1.8} className={pathname === "/billing" ? "text-primary" : "text-[#90a4ab] dark:text-[#748c91]"} />Billing
          </Link>
          <Link id="nav-trash" href="/trash" className={`relative flex items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-[13px] font-semibold transition-colors ${pathname === "/trash" ? "bg-primary/10 text-primary" : "text-[#5a6f77] hover:bg-primary/5 hover:text-foreground dark:text-[#a9bec2]"}`}>
            {pathname === "/trash" && <span className="absolute -left-3.5 inset-y-[9px] w-[3px] rounded-r bg-primary" />}
            <Trash2 size={16} strokeWidth={1.8} className={pathname === "/trash" ? "text-primary" : "text-[#90a4ab] dark:text-[#748c91]"} />Trash
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="mt-2 flex w-full items-center gap-2.5 rounded-xl border border-[#e6edee] px-2.5 py-2 text-left outline-none transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary dark:border-[#233e47]">
              <Avatar className="size-[34px] border border-primary/20">
                <AvatarImage src={user?.imageUrl} alt="" />
                <AvatarFallback className="bg-[linear-gradient(135deg,#0e96b8,#0b7693)] text-xs font-bold text-white">{initials || "NV"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-foreground">{displayName}</div>
                <div className="truncate text-[11px] text-[#90a4ab] dark:text-[#748c91]">{userRole}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <DropdownMenuItem asChild><Link href="/profile"><UserRound className="mr-2 size-4" />Profile</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}><LogOut className="mr-2 size-4" />Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 flex h-[58px] items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur lg:left-[250px] lg:h-16 lg:gap-4 lg:px-[26px]">
        <div className="lg:hidden"><BrandMark /></div>
        <div className="hidden min-w-0 lg:block">
          <div className="truncate text-[17px] font-extrabold tracking-[-.01em] text-foreground">{pageTitle}</div>
          <div className="truncate text-[12.5px] text-muted-foreground">{pageSubtitle}</div>
        </div>

        <button type="button" onClick={openPalette} className="ml-auto hidden w-[280px] items-center gap-2.5 rounded-[10px] border border-border bg-secondary px-[13px] py-[9px] text-left text-[13px] text-muted-foreground transition-colors hover:border-primary xl:flex">
          <Search size={15} strokeWidth={2} />
          <span className="flex-1">Search patients, notes…</span>
          <kbd className="rounded-[5px] border border-border bg-card px-1.5 py-px font-mono text-[10px]">⌘K</kbd>
        </button>

        <div className="ml-auto hidden lg:block xl:ml-0"><LanguageSwitcher variant="segmented" /></div>

        <button
          type="button"
          onClick={() => {
            // With a real Mercado Pago subscription (or a comp account) the
            // pill is a shortcut to billing; the prototype paid/unpaid toggle
            // only applies before one exists.
            if (hasRealSubscription || complimentary) {
              router.push("/billing");
              return;
            }
            toggleSubscription();
          }}
          title={hasRealSubscription || complimentary ? "Manage your plan" : "Preview paid vs unpaid account"}
          className={`hidden items-center gap-[7px] rounded-[10px] border px-[11px] py-2 text-xs font-extrabold lg:flex ${subscriptionActive ? "border-[#15986a] bg-[#e2f1ea] text-[#15986a] dark:border-[#2ba378] dark:bg-[#11302a] dark:text-[#2ba378]" : "border-[#be7c16] bg-[#f6ecd8] text-[#be7c16] dark:border-[#d29a3a] dark:bg-[#33280f] dark:text-[#d29a3a]"}`}
        >
          <span className={`size-[7px] rounded-full ${subscriptionActive ? "bg-[#15986a] dark:bg-[#2ba378]" : "bg-[#be7c16] dark:bg-[#d29a3a]"}`} />
          {subscriptionActive ? "Plan Active" : "Payment Required"}
        </button>
        <ThemeSwitcher dashboard />
        <div id="quick-actions"><ScheduleAppointment variant="topbar" /></div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[68px] grid-cols-5 border-t border-border bg-card/95 px-2 pb-1 pt-1.5 shadow-[0_-8px_28px_-20px_rgba(6,24,30,.45)] backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {workspaceNavigation.map((item) => {
          const Icon = item.icon;
          const active = Boolean(item.activePath && (pathname === item.activePath || pathname.startsWith(`${item.activePath}/`)));
          return <Link key={item.label} href={item.href} className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[10px] text-[9px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}><Icon size={18} strokeWidth={1.8} /><span className="max-w-full truncate">{item.label === "Notes & records" ? "Notes" : item.label}</span></Link>;
        })}
        <Link href="/profile" className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[10px] text-[9px] font-bold ${pathname === "/profile" ? "text-primary" : "text-muted-foreground"}`}><UserRound size={18} strokeWidth={1.8} />Profile</Link>
      </nav>
    </>
  );
}
