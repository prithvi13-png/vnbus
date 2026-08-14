"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";

import { cn } from "../lib/cn";

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ className, helperText, label = "Upload file", ...props }, ref) => (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center transition-colors hover:border-gold-200 hover:bg-gold-50/60 dark:border-brand-900 dark:bg-brand-950 dark:hover:border-gold-500/60 dark:hover:bg-gold-500/10",
        className,
      )}
    >
      <UploadCloud className="h-6 w-6 text-gold-600 dark:text-gold-100" aria-hidden="true" />
      <span className="mt-3 text-sm font-medium text-gray-950 dark:text-gray-50">{label}</span>
      {helperText ? (
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</span>
      ) : null}
      <input ref={ref} type="file" className="sr-only" {...props} />
    </label>
  ),
);

FileUpload.displayName = "FileUpload";
