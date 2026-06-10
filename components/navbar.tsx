"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ThemeSwitcher } from "./theme-switcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useUser, useClerk } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const t = useTranslations("nav");

  const logout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  // Get user initials for fallback
  const getUserInitials = () => {
    if (!user?.fullName && !user?.primaryEmailAddress?.emailAddress) return "U";

    const name = user.fullName || user.primaryEmailAddress?.emailAddress || "";
    const parts = name.split(" ");

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };


  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === path
      ? "text-sky-600 font-semibold border-b-2 border-sky-600"
      : "text-gray-600 hover:text-sky-600"
    }`;

  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress;

  return (
    <header className="sticky top-0 z-50 mb-4 flex items-center justify-between gap-2 border-b-2 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:mx-auto lg:max-w-[1920px]">
      <div className="flex items-center gap-3 sm:gap-8">
        <Link
          href={"/"}
          className="flex h-12 items-center text-xl font-bold text-sky-600 sm:text-2xl"
        >
          NEUROVA
        </Link>

        <NavigationMenu className="h-12">
          <NavigationMenuList aria-label={t("primary")}>
            <NavigationMenuItem>
              <Link
                href="/dashboard"
                aria-current={pathname === "/dashboard" ? "page" : undefined}
                className={linkClass("/dashboard")}
              >
                {t("dashboard")}
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                id="nav-patients"
                href="/patients"
                aria-current={pathname === "/patients" ? "page" : undefined}
                className={linkClass("/patients")}
              >
                {t("patients")}
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t("userMenu")}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            <Avatar>
              <AvatarImage
                src={user?.imageUrl}
                alt={
                  displayName
                    ? t("userAvatarAlt", { name: displayName })
                    : t("userMenu")
                }
              />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {displayName || t("myAccount")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">{t("profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>{t("logOut")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
