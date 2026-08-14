import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const alertVariants = cva("rounded-md border p-4 text-sm", {
  variants: {
    variant: {
      default:
        "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-100",
      neutral:
        "border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
      success:
        "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100",
      warning:
        "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100",
      danger:
        "border-red-200 bg-red-50 text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="status" className={cn(alertVariants({ variant, className }))} {...props} />
  ),
);

Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("mb-1 font-semibold tracking-normal", className)} {...props} />
));

AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("leading-6 opacity-90", className)} {...props} />
));

AlertDescription.displayName = "AlertDescription";
