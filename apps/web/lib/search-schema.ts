import { z } from "zod";

const today = new Date().toISOString().slice(0, 10);

export const searchSchema = z
  .object({
    sourceCity: z.string().min(2, "Enter a source city"),
    destinationCity: z.string().min(2, "Enter a destination city"),
    journeyDate: z
      .string()
      .min(1, "Select a journey date")
      .refine((value) => value >= today, "Journey date cannot be in the past"),
    passengerCount: z.number().int().min(1).max(6),
  })
  .refine(
    (value) => value.sourceCity.trim().toLowerCase() !== value.destinationCity.trim().toLowerCase(),
    {
      message: "Choose different source and destination cities",
      path: ["destinationCity"],
    },
  );

export type SearchFormValues = z.infer<typeof searchSchema>;
