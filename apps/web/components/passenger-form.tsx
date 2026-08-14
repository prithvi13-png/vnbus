"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Input } from "@vnbus/ui";

const passengerSchema = z.object({
  fullName: z.string().min(2),
  age: z.number().int().min(1).max(110),
  email: z.string().email(),
  phone: z.string().min(10),
});

type PassengerFormValues = z.infer<typeof passengerSchema>;

export function PassengerForm(): React.JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      fullName: "Aarav Sharma",
      age: 32,
      email: "traveller@example.com",
      phone: "+919876543210",
    },
  });

  return (
    <form
      className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5"
      onSubmit={(event) => {
        void handleSubmit(() => undefined)(event);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.fullName?.message}>
          <Input placeholder="Full name" {...register("fullName")} />
        </Field>
        <Field error={errors.age?.message}>
          <Input type="number" placeholder="Age" {...register("age", { valueAsNumber: true })} />
        </Field>
        <Field error={errors.email?.message}>
          <Input type="email" placeholder="Email" {...register("email")} />
        </Field>
        <Field error={errors.phone?.message}>
          <Input placeholder="Phone" {...register("phone")} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
        <span className="text-sm text-gray-600">
          {isSubmitSuccessful ? "Passenger details validated" : "Seat 1A selected"}
        </span>
        <Button asChild>
          <Link href="/booking-confirmation">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Review booking
          </Link>
        </Button>
      </div>
    </form>
  );
}

function Field({
  error,
  children,
}: {
  error: string | undefined;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <label className="grid gap-1">
      {children}
      <span className="min-h-4 text-xs text-red-600">{error}</span>
    </label>
  );
}
