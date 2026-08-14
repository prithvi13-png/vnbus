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
        "inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          aria-label="Remove tag"
          className="rounded-sm text-gray-500 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
          onClick={onRemove}
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}
