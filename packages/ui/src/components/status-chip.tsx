import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm",
  {
    variants: {
      tone: {
        neutral:
          "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
        success:
          "border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-600/30 dark:bg-brand-600/10 dark:text-brand-100",
        warning:
          "border-gold-200 bg-gold-50 text-gold-700 dark:border-gold-500/30 dark:bg-gold-500/10 dark:text-gold-100",
        danger:
          "border-red-200 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200",
        info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-100",
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
