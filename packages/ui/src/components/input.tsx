import * as React from "react";

import { cn } from "../lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-gray-300/90 bg-white/95 px-3.5 py-2 text-sm text-gray-950 shadow-sm transition-all placeholder:text-gray-500 focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-800 dark:bg-brand-950/80 dark:text-gray-50 dark:placeholder:text-gray-400",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
