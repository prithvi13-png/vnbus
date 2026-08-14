"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpenText,
  Bus,
  CircleDollarSign,
  ClipboardList,
  Flag,
  FileBarChart,
  History,
  HelpCircle,
  LayoutDashboard,
  Mail,
  MonitorCog,
  Percent,
  PlugZap,
  Search,
  Settings,
  ShieldCheck,
  SquareActivity,
  Ticket,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Badge,
  Button,
  CommandPalette,
  DashboardLayout,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sidebar,
  TopNavigation,
  cn,
  useToast,
  type CommandItem,
  type SidebarItem,
} from "@vnbus/ui";

import { useUiStore } from "../lib/ui-store";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const primaryNavigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Bus },
  { href: "/booking-history", label: "Booking History", icon: History },
  { href: "/profile", label: "Profile", icon: UserCog },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminNavigation: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/agents", label: "Travel Agents", icon: ShieldCheck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: UserCog },
  { href: "/admin/coupons", label: "Coupons", icon: Percent },
  { href: "/admin/offers", label: "Offers", icon: CircleDollarSign },
  { href: "/admin/cms", label: "CMS", icon: BookOpenText },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/email-templates", label: "Email Templates", icon: Mail },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { href: "/admin/activity-logs", label: "Activity Logs", icon: SquareActivity },
  { href: "/admin/platform-settings", label: "Platform Settings", icon: Settings },
  { href: "/admin/feature-flags", label: "Feature Flags", icon: Flag },
  { href: "/admin/system-monitoring", label: "System Monitoring", icon: MonitorCog },
  { href: "/admin/supplier-configuration", label: "Supplier Configuration", icon: PlugZap },
  { href: "/admin/profile", label: "Profile", icon: UserCog },
];

const customerNavigation: NavItem[] = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/customer/profile", label: "Profile", icon: UserCog },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
  { href: "/customer/tickets", label: "Tickets", icon: Ticket },
];

const agentNavigation: NavItem[] = [
  { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/quick-booking", label: "Quick Booking", icon: Ticket },
  { href: "/agent/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/agent/customers", label: "Customers", icon: Users },
  { href: "/agent/reports", label: "Reports", icon: FileBarChart },
  { href: "/agent/notifications", label: "Notifications", icon: Bell },
  { href: "/agent/profile", label: "Profile", icon: UserCog },
  { href: "/agent/settings", label: "Settings", icon: Settings },
  { href: "/agent/help", label: "Help", icon: HelpCircle },
];

const navigationByArea = {
  main: primaryNavigation,
  admin: adminNavigation,
  customer: customerNavigation,
  agent: agentNavigation,
};

export function DashboardShell({
  area = "main",
  children,
}: {
  area?: keyof typeof navigationByArea;
  children: React.ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const navigation = navigationByArea[area];
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const commandOpen = useUiStore((state) => state.commandOpen);
  const notifications = useUiStore((state) => state.notifications);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);
  const markNotificationsRead = useUiStore((state) => state.markNotificationsRead);
  const { notify } = useToast();
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const sidebarItems: SidebarItem[] = navigation.map((item) => ({
    ...item,
    active: pathname === item.href,
  }));
  const commands = React.useMemo<CommandItem[]>(
    () => [
      ...sidebarItems.map((item) => ({
        id: item.href,
        label: item.label,
        description: "Open workspace section",
        onSelect: () => router.push(item.href),
      })),
      {
        id: "search-buses",
        label: "Search buses",
        description: "Open bus search",
        shortcut: "S",
        onSelect: () => router.push("/search"),
      },
    ],
    [router, sidebarItems],
  );

  return (
    <>
      <DashboardLayout
        sidebar={
          <Sidebar
            brand={<Brand />}
            items={sidebarItems}
            footer={
              <div className="grid gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-brand-900 dark:text-brand-100">
                  Vriddhi Nexus Portal
                </span>
                <span>Role-based booking, ticket, report, and customer workflows.</span>
              </div>
            }
          />
        }
        topbar={
          <TopNavigation
            brand={
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 text-sm font-semibold text-gray-950 dark:text-gray-50 lg:flex"
              >
                <span>Workspace</span>
              </Link>
            }
            onMenuClick={() => setMobileNavOpen(true)}
            nav={
              <Button
                type="button"
                variant="outline"
                className="w-80 justify-start border-gold-100 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-100"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search workspace
              </Button>
            }
            actions={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Open command palette"
                  className="md:hidden"
                  onClick={() => setCommandOpen(true)}
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                </Button>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Open notifications"
                    >
                      <span className="relative">
                        <Bell className="h-4 w-4" aria-hidden="true" />
                        {unreadCount ? (
                          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                        ) : null}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between gap-3">
                      <span>Notifications</span>
                      {unreadCount ? <Badge variant="warning">{unreadCount} unread</Badge> : null}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="items-start gap-3 py-2">
                        <span
                          className={cn(
                            "mt-1 h-2 w-2 rounded-full",
                            notification.unread ? "bg-gold-500" : "bg-gray-300 dark:bg-gray-700",
                          )}
                          aria-hidden="true"
                        />
                        <span className="grid gap-0.5">
                          <span className="text-sm font-medium">{notification.title}</span>
                          <span className="text-xs text-gray-500">{notification.description}</span>
                        </span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        markNotificationsRead();
                        notify({
                          title: "Notifications updated",
                          description: "All dashboard notifications are marked read.",
                          tone: "success",
                        });
                      }}
                    >
                      Mark all as read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ProfileMenu />
              </>
            }
          />
        }
      >
        {children}
      </DashboardLayout>
      <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DrawerContent side="left">
          <DrawerHeader>
            <DrawerTitle className="text-base font-semibold text-brand-900 dark:text-white">
              Navigation
            </DrawerTitle>
          </DrawerHeader>
          <nav className="grid gap-1 p-4" aria-label="Mobile workspace navigation">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-brand-700 hover:bg-brand-50 hover:text-brand-900 dark:text-brand-100 dark:hover:bg-brand-900 dark:hover:text-white",
                    item.active &&
                      "bg-gold-50 text-brand-900 ring-1 ring-gold-200 dark:bg-gold-500/10 dark:text-gold-100",
                  )}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </DrawerContent>
      </Drawer>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} items={commands} />
    </>
  );
}

function Brand(): React.JSX.Element {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 text-sm font-semibold text-brand-900 dark:text-white"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-md border border-gold-100 bg-white">
        <Image
          src="/images/vriddhi-nexus-logo.png"
          alt="Vriddhi Nexus logo"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </span>
      <span>Vriddhi Nexus Pvt Ltd</span>
    </Link>
  );
}
