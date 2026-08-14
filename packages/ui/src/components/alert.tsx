import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const alertVariants = cva("rounded-md border p-4 text-sm", {
  variants: {
    variant: {
      default:
        "border-gold-200 bg-gold-50 text-brand-900 dark:border-gold-500/30 dark:bg-gold-500/10 dark:text-gold-100",
      neutral:
        "border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
      success:
        "border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-600/30 dark:bg-brand-600/10 dark:text-brand-100",
      warning:
        "border-gold-200 bg-gold-50 text-gold-700 dark:border-gold-500/30 dark:bg-gold-500/10 dark:text-gold-100",
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
