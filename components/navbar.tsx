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
import { ThemeSwitcher } from "./theme-switcher";
import { useUser, useClerk } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

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

  return (
    <div className="sticky top-0 z-50 mb-4 px-4 border-b-2 lg:flex lg:items-center lg:justify-between lg:max-w-[1920px] lg:mx-auto">
      <div className="flex gap-8">
        <div className="h-12 flex items-center justify-center">
          <Link href={"/"} className="text-2xl text-sky-600 font-bold">
            NEUROVA
          </Link>
        </div>

        <NavigationMenu className="h-12">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/patients" className={linkClass("/patients")}>
                Patients
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center">
        <ThemeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full">
            <Avatar>
              <AvatarImage
                src={user?.imageUrl}
                alt={user?.fullName || user?.primaryEmailAddress?.emailAddress || "User avatar"}
              />
              <AvatarFallback>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              {user?.fullName || user?.primaryEmailAddress?.emailAddress || "My Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
