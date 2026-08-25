import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../lib/cn";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

export function Tag({ children, className, onRemove, ...props }: TagProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border border-gold-100 bg-white/90 px-2.5 text-xs font-semibold text-brand-800 shadow-sm dark:border-brand-800 dark:bg-brand-950/80 dark:text-brand-100",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          aria-label="Remove tag"
          className="rounded-sm text-gray-500 hover:text-brand-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
          onClick={onRemove}
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}
