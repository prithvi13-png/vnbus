import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Loader2, Wrench } from "lucide-react";

import { cn } from "../lib/cn";
import { Button } from "../components/button";

export interface StateBlockProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function ErrorState(props: Omit<StateBlockProps, "icon">): React.JSX.Element {
  return <StateBlock {...props} icon={AlertTriangle} tone="danger" />;
}

export function SuccessState(props: Omit<StateBlockProps, "icon">): React.JSX.Element {
  return <StateBlock {...props} icon={CheckCircle2} tone="success" />;
}

export function MaintenanceState(props: Omit<StateBlockProps, "icon">): React.JSX.Element {
  return <StateBlock {...props} icon={Wrench} tone="warning" />;
}

export function LoadingState({
  className,
  description = "Loading",
  title = "Please wait",
}: Partial<StateBlockProps>): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
    >
      <Loader2
        className="h-6 w-6 animate-spin text-gold-600 dark:text-gold-100"
        aria-hidden="true"
      />
      <div>
        <h3 className="text-sm font-semibold tracking-normal text-gray-950 dark:text-gray-50">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function StateBlock({
  actionLabel,
  className,
  description,
  icon: Icon,
  onAction,
  title,
  tone,
}: Omit<StateBlockProps, "icon"> & {
  icon: LucideIcon;
  tone: "success" | "warning" | "danger";
}): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-md",
          tone === "success" &&
            "bg-brand-50 text-brand-700 dark:bg-brand-600/10 dark:text-brand-100",
          tone === "warning" && "bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-100",
          tone === "danger" && "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-200",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold tracking-normal text-gray-950 dark:text-gray-50">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
        {description}
      </p>
      {actionLabel ? (
        <Button type="button" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
