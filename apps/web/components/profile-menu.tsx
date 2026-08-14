"use client";

import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@vnbus/ui";

import { useAuthStore } from "../lib/auth-store";

export function ProfileMenu(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const initials = `${user?.firstName?.[0] ?? "V"}${user?.lastName?.[0] ?? "N"}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open profile menu">
          <Avatar className="h-8 w-8">
            {user?.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block text-sm text-gray-950 dark:text-gray-50">
            {user ? `${user.firstName} ${user.lastName}` : "Vriddhi Nexus"}
          </span>
          <span className="block truncate text-xs font-normal text-gray-500">
            {user?.email ?? "workspace@example.com"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={clearSession}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
