import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold tracking-normal transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-gold-400 bg-gold-500 text-brand-950 shadow-[0_10px_24px_rgba(184,131,39,0.22)] hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_16px_34px_rgba(184,131,39,0.26)] active:translate-y-0",
        secondary:
          "border border-brand-700 bg-brand-700 text-white shadow-[0_12px_28px_rgba(2,85,62,0.22)] hover:-translate-y-0.5 hover:bg-brand-900 hover:shadow-[0_18px_36px_rgba(2,85,62,0.28)] active:translate-y-0",
        outline:
          "border border-gold-200 bg-white/95 text-brand-900 shadow-sm hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-50 hover:shadow-panel active:translate-y-0 dark:border-brand-800 dark:bg-brand-950/80 dark:text-gold-50 dark:hover:border-gold-500/60 dark:hover:bg-gold-500/10",
        ghost:
          "text-brand-800 hover:bg-brand-50 hover:text-brand-950 dark:text-brand-100 dark:hover:bg-white/10 dark:hover:text-white",
        destructive:
          "border border-red-600 bg-red-600 text-white shadow-[0_10px_24px_rgba(220,38,38,0.18)] hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, disabled, loading = false, variant, size, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    if (asChild) {
      return (
        <Comp
          ref={ref}
          aria-disabled={isDisabled || undefined}
          className={cn(buttonVariants({ variant, size, className }))}
          data-disabled={isDisabled ? "" : undefined}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {children}
      </Comp>
    );
  },
);

Button.displayName = "Button";
