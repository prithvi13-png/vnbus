import * as React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "../lib/cn";

export function Breadcrumb({ ...props }: React.ComponentProps<"nav">): React.JSX.Element {
  return <nav aria-label="breadcrumb" {...props} />;
}

export function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">): React.JSX.Element {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400",
        className,
      )}
      {...props}
    />
  );
}

export function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<"li">): React.JSX.Element {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

export function BreadcrumbLink({
  className,
  ...props
}: React.ComponentProps<"a">): React.JSX.Element {
  return (
    <a
      className={cn(
        "transition-colors hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:hover:text-gray-50",
        className,
      )}
      {...props}
    />
  );
}

export function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      role="link"
      aria-disabled="true"
      className={cn("font-medium text-gray-950 dark:text-gray-50", className)}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">): React.JSX.Element {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn("text-gray-400", className)}
      {...props}
    >
      {children ?? <ChevronRight className="h-4 w-4" />}
    </li>
  );
}

export function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">More</span>
    </span>
  );
}
