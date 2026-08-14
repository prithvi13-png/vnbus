"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@vnbus/ui";

import { updateProfile } from "../lib/auth-api";
import { profileSchema, type ProfileFormValues } from "../lib/auth-schemas";
import { useAuthStore } from "../lib/auth-store";

export function ProfileSettings(): React.JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? "Aarav",
      lastName: user?.lastName ?? "Sharma",
      phone: user?.phone ?? "+919876543210",
      avatar: user?.avatar ?? "",
    },
  });

  const onSubmit = async (values: ProfileFormValues): Promise<void> => {
    setMessage(null);
    setError(null);

    if (!accessToken) {
      setMessage("Profile draft validated.");
      return;
    }

    try {
      const updated = await updateProfile(values, accessToken);
      updateUser(updated);
      setMessage("Profile updated.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Profile update failed.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-50 text-gold-700">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
          >
            {message ? (
              <div
                role="status"
                className="flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {message}
              </div>
            ) : null}
            {error ? (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {error}
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" error={errors.firstName?.message}>
                <Input autoComplete="given-name" {...register("firstName")} />
              </Field>
              <Field label="Last name" error={errors.lastName?.message}>
                <Input autoComplete="family-name" {...register("lastName")} />
              </Field>
            </div>
            <Field label="Phone" error={errors.phone?.message}>
              <Input autoComplete="tel" {...register("phone")} />
            </Field>
            <Field label="Avatar URL" error={errors.avatar?.message}>
              <Input autoComplete="url" {...register("avatar")} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold-100 pt-4">
              <Button asChild variant="outline">
                <Link href="/change-password">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  Change password
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4" aria-hidden="true" />
                {isSubmitting ? "Saving profile" : "Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <CardTitle>Access</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <StatusRow label="Email" value={user?.email ?? "traveller@example.com"} />
          <StatusRow label="Role" value={user?.role ?? "CUSTOMER"} />
          <div className="flex flex-wrap gap-2">
            <Badge variant={user?.emailVerified === false ? "warning" : "success"}>
              {user?.emailVerified === false ? "Email pending" : "Email verified"}
            </Badge>
            <Badge variant={user?.forcePasswordChange ? "warning" : "neutral"}>
              {user?.forcePasswordChange ? "Password change required" : "Password current"}
            </Badge>
          </div>
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-gray-600">
              Permissions
            </p>
            <div className="flex flex-wrap gap-2">
              {(user?.permissions ?? ["profile.view", "profile.update", "password.change"]).map(
                (permission) => (
                  <Badge key={permission} variant="neutral">
                    {permission}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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

function StatusRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-md border border-gold-100 p-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-gray-600">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-brand-900">{value}</p>
    </div>
  );
}
