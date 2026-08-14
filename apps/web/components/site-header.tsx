"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, LogIn, Menu, Search, UserPlus } from "lucide-react";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  NavigationMenu,
  type NavigationMenuItem,
  cn,
} from "@vnbus/ui";

import { useAuthStore } from "../lib/auth-store";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";

const navigation: NavigationMenuItem[] = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/booking-history", label: "Bookings" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const items = navigation.map((item) => ({
    ...item,
    active: pathname === item.href,
  }));

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-gray-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700 text-white">
            <Bus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>Vriddhi Nexus Pvt Ltd</span>
        </Link>
        <NavigationMenu items={items} className="hidden md:flex" />
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {user ? (
            <ProfileMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Register
                </Link>
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle className="text-base font-semibold text-gray-950 dark:text-gray-50">
              Vriddhi Nexus
            </DrawerTitle>
          </DrawerHeader>
          <nav className="grid gap-1 p-4" aria-label="Mobile navigation">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-50",
                  item.active && "bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200",
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {!user ? (
            <div className="mt-auto grid gap-2 border-t border-gray-200 p-4 dark:border-gray-800">
              <Button asChild variant="outline">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Register
                </Link>
              </Button>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </header>
  );
}
