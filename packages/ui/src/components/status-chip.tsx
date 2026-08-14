import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
        success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200",
        danger: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-200",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof chipVariants> {}

export function StatusChip({
  className,
  tone,
  children,
  ...props
}: StatusChipProps): React.JSX.Element {
  return (
    <span className={cn(chipVariants({ tone, className }))} {...props}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
