"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, cn } from "@vnbus/ui";

import { useAuthStore } from "../lib/auth-store";
import { getDashboardPathForUser } from "../lib/role-routes";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";

interface HeaderNavItem {
  href: string;
  label: string;
  active?: boolean;
}

const publicNavigation: HeaderNavItem[] = [
  { href: "/search", label: "Search" },
  { href: "/track-bus", label: "Track Bus" },
  { href: "/booking-history", label: "Bookings" },
  { href: "/support", label: "Support" },
];

// The landing site's mark is transparent and keeps its own colours, so the
// same asset works on light and dark headers. Aspect ratio 880x758.
const LOGO_HEIGHT = 40;
const LOGO_WIDTH = Math.round((LOGO_HEIGHT * 880) / 758);

/** Nav link styling copied from the landing site's Navbar so both read as one brand. */
const navLinkClass =
  "inline-flex h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors duration-150 ease-out hover:bg-site-primary-light hover:text-site-primary dark:hover:bg-white/10 dark:hover:text-white";

const ctaBaseClass =
  "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

const ctaGhostClass = cn(
  ctaBaseClass,
  "text-site-primary hover:bg-site-primary-light dark:text-brand-100 dark:hover:bg-white/10",
);

const ctaPrimaryClass = cn(
  ctaBaseClass,
  "bg-site-primary text-white shadow-header hover:bg-site-primary-dark",
);

export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const items = React.useMemo<HeaderNavItem[]>(() => {
    const signedInNavigation: HeaderNavItem[] =
      hasHydrated && user ? [{ href: getDashboardPathForUser(user), label: "Dashboard" }] : [];

    return [...publicNavigation, ...signedInNavigation].map((item) => ({
      ...item,
      active: pathname === item.href || (item.label === "Dashboard" && pathname === "/dashboard"),
    }));
  }, [hasHydrated, pathname, user]);

  return (
    <header className="sticky top-0 z-30 border-b border-site-border bg-site-surface/80 shadow-header backdrop-blur-lg dark:border-brand-800 dark:bg-brand-950/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-bold text-site-text dark:text-white"
          aria-label="Vriddhi Nexus home"
        >
          <Image
            src="/images/vriddhi-nexus-mark.png"
            alt=""
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="shrink-0"
            priority
          />
          <span className="text-lg leading-none tracking-tight sm:text-xl">Vriddhi Nexus</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    navLinkClass,
                    item.active
                      ? "text-site-primary dark:text-white"
                      : "text-site-text dark:text-brand-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <ProfileMenu />
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/login" className={ctaGhostClass}>
                Login
              </Link>
              <Link href="/register" className={ctaPrimaryClass}>
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="inline-flex size-11 items-center justify-center rounded-lg text-site-text transition-colors duration-150 ease-out hover:bg-site-primary-light hover:text-site-primary dark:text-brand-100 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle className="text-base font-semibold text-site-text dark:text-white">
              Vriddhi Nexus
            </DrawerTitle>
          </DrawerHeader>
          <nav className="grid gap-1 p-4" aria-label="Mobile navigation">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center rounded-lg px-3 py-3 text-base font-medium text-site-text transition-colors duration-150 ease-out hover:bg-site-primary-light hover:text-site-primary dark:text-brand-100 dark:hover:bg-white/10 dark:hover:text-white",
                  item.active && "text-site-primary dark:text-white",
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {!user ? (
            <div className="mt-auto grid gap-2 border-t border-site-border p-4 dark:border-brand-800">
              <Link
                href="/login"
                className={cn(
                  ctaGhostClass,
                  "w-full border border-site-border dark:border-brand-800",
                )}
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={cn(ctaPrimaryClass, "w-full")}
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </header>
  );
}
