"use client";

import * as React from "react";
import type { FieldError } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { cn } from "../lib/cn";
import { Label } from "../components/label";

export const Form = FormProvider;
export { zodResolver };
export type FormValues<TSchema extends z.ZodType> = z.infer<TSchema>;

export const validationMessages = {
  required: "This field is required.",
  email: "Enter a valid email address.",
  phone: "Enter a valid phone number.",
  password: "Use at least 12 characters with uppercase, lowercase, number, and symbol.",
  passwordMatch: "Passwords must match.",
} as const;

export function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn("grid gap-1.5", className)} {...props} />;
}

export const FormLabel = Label;

export function FormControl({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn("grid gap-1", className)} {...props} />;
}

export function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return <p className={cn("text-xs text-gray-500 dark:text-gray-400", className)} {...props} />;
}

export function FormMessage({
  className,
  error,
  children,
}: React.HTMLAttributes<HTMLParagraphElement> & {
  error?: FieldError | string;
}): React.JSX.Element {
  const message = typeof error === "string" ? error : error?.message;

  return (
    <p className={cn("min-h-4 text-xs text-red-600 dark:text-red-300", className)}>
      {message ?? children}
    </p>
  );
}

export function FormActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end dark:border-gray-800",
        className,
      )}
      {...props}
    />
  );
}
