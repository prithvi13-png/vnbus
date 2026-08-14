import * as React from "react";

import { cn } from "../lib/cn";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

const toneClasses = {
  neutral: "bg-gray-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-600",
};

export function Timeline({
  className,
  items,
}: {
  className?: string;
  items: TimelineItem[];
}): React.JSX.Element {
  return (
    <ol
      className={cn(
        "relative grid gap-5 border-l border-gray-200 pl-5 dark:border-gray-800",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={cn(
              "absolute -left-[1.58rem] top-1 h-3 w-3 rounded-full ring-4 ring-white dark:ring-gray-950",
              toneClasses[item.tone ?? "neutral"],
            )}
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-normal text-gray-950 dark:text-gray-50">
              {item.title}
            </h3>
            {item.timestamp ? (
              <time className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</time>
            ) : null}
          </div>
          {item.description ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
