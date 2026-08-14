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
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-blue-400/60 dark:hover:bg-blue-400/10",
        className,
      )}
    >
      <UploadCloud className="h-6 w-6 text-blue-700 dark:text-blue-300" aria-hidden="true" />
      <span className="mt-3 text-sm font-medium text-gray-950 dark:text-gray-50">{label}</span>
      {helperText ? (
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</span>
      ) : null}
      <input ref={ref} type="file" className="sr-only" {...props} />
    </label>
  ),
);

FileUpload.displayName = "FileUpload";
