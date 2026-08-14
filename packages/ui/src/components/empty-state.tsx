import * as React from "react";

import { Button } from "./button";
import { cn } from "../lib/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-950",
        className,
      )}
    >
      <h3 className="text-base font-semibold tracking-normal text-gray-950 dark:text-gray-50">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">{description}</p>
      {actionLabel ? (
        <Button type="button" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
