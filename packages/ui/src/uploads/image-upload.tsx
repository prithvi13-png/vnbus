"use client";

import * as React from "react";
import { ImagePlus } from "lucide-react";

import { cn } from "../lib/cn";

export interface ImageUploadProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "accept" | "type"
> {
  previewUrl?: string;
  label?: string;
}

export const ImageUpload = React.forwardRef<HTMLInputElement, ImageUploadProps>(
  ({ className, label = "Upload image", previewUrl, ...props }, ref) => (
    <label
      className={cn(
        "group grid aspect-video cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-white text-center transition-colors hover:border-gold-200 dark:border-brand-900 dark:bg-brand-950",
        className,
      )}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="grid gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <ImagePlus
            className="mx-auto h-6 w-6 text-gold-600 dark:text-gold-100"
            aria-hidden="true"
          />
          {label}
        </span>
      )}
      <input ref={ref} type="file" accept="image/*" className="sr-only" {...props} />
    </label>
  ),
);

ImageUpload.displayName = "ImageUpload";
