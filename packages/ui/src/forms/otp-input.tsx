"use client";

import * as React from "react";

import { cn } from "../lib/cn";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function OtpInput({
  className,
  length = 6,
  onChange,
  value,
}: OtpInputProps): React.JSX.Element {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  return (
    <div className={cn("flex gap-2", className)} role="group" aria-label="One-time password">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          inputMode="numeric"
          maxLength={1}
          value={value[index] ?? ""}
          className="h-11 w-10 rounded-md border border-gray-300 bg-white text-center text-sm font-semibold text-gray-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500 dark:border-brand-900 dark:bg-brand-950 dark:text-gray-50"
          onChange={(event) => {
            const next = value.split("");
            next[index] = event.target.value.slice(-1);
            onChange(next.join("").slice(0, length));
            refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index]) {
              refs.current[index - 1]?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}
