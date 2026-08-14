import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
        success: "bg-brand-100 text-brand-900 dark:bg-brand-600/20 dark:text-brand-100",
        warning: "bg-gold-100 text-gold-700 dark:bg-gold-500/10 dark:text-gold-100",
        danger: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-200",
        info: "bg-brand-100 text-brand-900 dark:bg-brand-600/20 dark:text-brand-100",
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
