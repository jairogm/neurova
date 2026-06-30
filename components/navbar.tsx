"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./theme-switcher";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

function BrandMark({ onDark = true }: { onDark?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3" aria-label="NEUROVA dashboard">
      <svg width="31" height="31" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="url(#app-logo-gradient)" />
        <path d="M10 22.5V10.5L22 21.5V9.5" stroke="#EAFBF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="10.5" r="2" fill="#A7E9F6" /><circle cx="22" cy="21.5" r="2" fill="#A7E9F6" />
        <defs><linearGradient id="app-logo-gradient" x1="2" y1="2" x2="30" y2="30"><stop stopColor="#0E96B8" /><stop offset="1" stopColor="#0B7693" /></linearGradient></defs>
      </svg>
      <span className={`text-[15px] font-extrabold tracking-[.16em] ${onDark ? "text-[#f0fbfc]" : "text-[#15252c]"}`}>NEUROVA</span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Your practice";
  const userRole = user?.primaryEmailAddress?.emailAddress || "Mental-health professional";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const current = navigation.find((item) => isActive(item.href));
  const isPatientDetail = pathname.startsWith("/patients/");
  const pageTitle = isPatientDetail ? "Patient workspace" : current?.label || (pathname === "/profile" ? "Therapist profile" : "NEUROVA");
  const pageSubtitle = isPatientDetail
    ? "Clinical details and records"
    : pageTitle === "Dashboard"
      ? "Today overview"
      : pageTitle === "Patients"
        ? "Manage your caseload"
        : pageTitle === "Trash"
          ? "Restore recently deleted items"
          : "Professional information";

  const logout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <>
      <aside className="hidden h-dvh w-56 flex-none flex-col bg-[linear-gradient(180deg,#0d2933,#081d25)] px-3.5 py-4 lg:flex">
        <div className="px-1.5 pb-7"><BrandMark /></div>

        <div className="mb-4 flex w-full items-center gap-2.5 rounded-[10px] border border-white/10 bg-white/[.06] px-3 py-2.5 text-left text-[12.5px] text-[#a2bac1]" title="Search">
          <Search size={15} />
          <span className="flex-1">Search</span>
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#6f9099]">⌘K</kbd>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${active ? "bg-white/[.09] text-[#eafbf8]" : "text-[#a2bac1] hover:bg-white/[.05] hover:text-white"}`}
              >
                {active && <span className="absolute -left-3.5 inset-y-2 w-[3px] rounded-r bg-[#3fb6d6]" />}
                <Icon size={17} strokeWidth={1.8} className={active ? "text-[#3fb6d6]" : "text-[#6f9099]"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/[.08] pt-3">
          <Link href="/profile" className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors ${pathname === "/profile" ? "border-[#3fb6d6]/40 bg-white/[.09]" : "border-white/[.08] hover:bg-white/[.05]"}`}>
            <Avatar className="size-[34px] border border-white/15">
              <AvatarImage src={user?.imageUrl} alt="" />
              <AvatarFallback className="bg-[#0e96b8] text-xs font-bold text-white">{initials || "NV"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-white">{displayName}</div>
              <div className="truncate text-[10.5px] text-[#78949c]">View profile</div>
            </div>
            <ChevronRight size={14} className="text-[#6f9099]" />
          </Link>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur lg:left-56 lg:h-16 lg:px-6">
        <div className="lg:hidden"><BrandMark onDark={false} /></div>
        <div className="hidden min-w-0 lg:block">
          <div className="truncate text-[16px] font-extrabold tracking-[-.01em] text-foreground">{pageTitle}</div>
          <div className="truncate text-xs text-muted-foreground">{pageSubtitle}</div>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Open user menu">
              <Avatar className="size-8 border border-border">
                <AvatarImage src={user?.imageUrl} alt={displayName} />
                <AvatarFallback className="bg-primary text-[11px] font-bold text-primary-foreground">{initials || "NV"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="truncate">{displayName}</div>
                <div className="truncate text-xs font-normal text-muted-foreground">{userRole}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile"><UserRound className="mr-2 size-4" />Profile</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={logout}><LogOut className="mr-2 size-4" />Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card/95 px-2 backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {navigation.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return <Link key={item.href} href={item.href} className={`flex min-w-20 flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}><Icon size={19} />{item.label}</Link>;
        })}
        <Link href="/profile" className={`flex min-w-20 flex-col items-center gap-1 text-[10px] font-bold ${pathname === "/profile" ? "text-primary" : "text-muted-foreground"}`}><UserRound size={19} />Profile</Link>
      </nav>
    </>
  );
}
