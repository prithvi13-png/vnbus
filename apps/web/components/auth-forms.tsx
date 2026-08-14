"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LogIn,
  Mail,
  RotateCcwKey,
  UserPlus,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Button, Input, cn } from "@vnbus/ui";

import {
  changePassword,
  login,
  registerCustomer,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from "../lib/auth-api";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type ChangePasswordFormValues,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  type RegisterFormValues,
  type ResetPasswordFormValues,
  type VerifyEmailFormValues,
} from "../lib/auth-schemas";
import { useAuthStore } from "../lib/auth-store";
import { getPostLoginPathForUser } from "../lib/role-routes";

type StatusState = {
  type: "success" | "error";
  message: string;
} | null;

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [status, setStatus] = React.useState<StatusState>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setStatus(null);

    try {
      const response = await login(values);
      setSession(response);
      router.push(
        response.user.forcePasswordChange
          ? "/change-password"
          : getPostLoginPathForUser(response.user, searchParams?.get("redirect")),
      );
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <StatusMessage status={status} />
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...register("password")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>
      <AuthLinks
        primary={{ href: "/register", label: "Create account" }}
        secondary={{ href: "/forgot-password", label: "Forgot password" }}
      />
    </form>
  );
}

export function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [status, setStatus] = React.useState<StatusState>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    setStatus(null);

    try {
      const response = await registerCustomer(values);
      setSession(response);
      router.push("/verify-email");
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <StatusMessage status={status} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName?.message}>
          <Input autoComplete="given-name" {...register("firstName")} />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <Input autoComplete="family-name" {...register("lastName")} />
        </Field>
      </div>
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Phone" error={errors.phone?.message}>
        <Input autoComplete="tel" {...register("phone")} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Field label="Confirm password" error={errors.confirmPassword?.message}>
        <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Creating account" : "Create account"}
      </Button>
      <AuthLinks primary={{ href: "/login", label: "Sign in" }} />
    </form>
  );
}

export function ForgotPasswordForm(): React.JSX.Element {
  const [status, setStatus] = React.useState<StatusState>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues): Promise<void> => {
    setStatus(null);

    try {
      const response = await requestPasswordReset(values);
      setStatus({ type: "success", message: response.message });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <StatusMessage status={status} />
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Sending link" : "Send reset link"}
      </Button>
      <AuthLinks primary={{ href: "/login", label: "Back to sign in" }} />
    </form>
  );
}

export function ResetPasswordForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = React.useState<StatusState>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: searchParams?.get("token") ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues): Promise<void> => {
    setStatus(null);

    try {
      const response = await resetPassword(values);
      setStatus({ type: "success", message: response.message });
      router.prefetch("/login");
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <StatusMessage status={status} />
      <Field label="Reset token" error={errors.token?.message}>
        <Input autoComplete="one-time-code" {...register("token")} />
      </Field>
      <Field label="New password" error={errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <RotateCcwKey className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Updating password" : "Update password"}
      </Button>
      <AuthLinks primary={{ href: "/login", label: "Sign in" }} />
    </form>
  );
}

export function VerifyEmailForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<StatusState>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token: searchParams?.get("token") ?? "",
    },
  });

  const onSubmit = async (values: VerifyEmailFormValues): Promise<void> => {
    setStatus(null);

    try {
      const response = await verifyEmail(values);
      setStatus({ type: "success", message: response.message });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <StatusMessage status={status} />
      <Field label="Verification token" error={errors.token?.message}>
        <Input autoComplete="one-time-code" {...register("token")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Verifying email" : "Verify email"}
      </Button>
      <AuthLinks
        primary={{ href: "/dashboard", label: "Open dashboard" }}
        secondary={{ href: "/login", label: "Sign in" }}
      />
    </form>
  );
}

export function ChangePasswordForm(): React.JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [status, setStatus] = React.useState<StatusState>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues): Promise<void> => {
    setStatus(null);

    if (!accessToken) {
      setStatus({ type: "error", message: "Sign in before changing your password." });
      return;
    }

    try {
      const response = await changePassword(values, accessToken);
      reset();
      setStatus({ type: "success", message: response.message });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <StatusMessage status={status} />
      <Field label="Current password" error={errors.currentPassword?.message}>
        <Input type="password" autoComplete="current-password" {...register("currentPassword")} />
      </Field>
      <Field label="New password" error={errors.newPassword?.message}>
        <Input type="password" autoComplete="new-password" {...register("newPassword")} />
      </Field>
      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Changing password" : "Change password"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-normal text-gray-600">{label}</span>
      {children}
      <span className="min-h-4 text-xs text-red-600">{error}</span>
    </label>
  );
}

function StatusMessage({ status }: { status: StatusState }): React.JSX.Element | null {
  if (!status) {
    return null;
  }

  const Icon = status.type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={status.type === "success" ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        status.type === "success"
          ? "border-brand-200 bg-brand-50 text-brand-900"
          : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{status.message}</span>
    </div>
  );
}

function AuthLinks({
  primary,
  secondary,
}: {
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm">
      <Link
        href={primary.href}
        className="inline-flex items-center gap-1 font-medium text-gold-600"
      >
        {primary.label}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
      {secondary ? (
        <Link href={secondary.href} className="font-medium text-gray-600 hover:text-gray-950">
          {secondary.label}
        </Link>
      ) : null}
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed.";
}
