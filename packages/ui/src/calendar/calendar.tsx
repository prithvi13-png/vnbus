"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "../lib/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, ...props }: CalendarProps): React.JSX.Element {
  return (
    <DayPicker
      className={cn("rounded-md bg-white p-3 text-sm dark:bg-gray-950", className)}
      classNames={{
        root: "grid gap-3",
        months: "grid gap-4 sm:grid-cols-2",
        month: "space-y-3",
        month_caption:
          "flex justify-center pt-1 text-sm font-semibold text-gray-950 dark:text-gray-50",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900",
        button_next:
          "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "w-9 rounded-md text-[0.8rem] font-medium text-gray-500",
        week: "mt-2 flex w-full",
        day: "h-9 w-9 p-0 text-center text-sm",
        day_button:
          "h-9 w-9 rounded-md p-0 font-normal text-gray-700 hover:bg-blue-50 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-gray-300 dark:hover:bg-blue-400/10 dark:hover:text-blue-100",
        selected:
          "rounded-md bg-blue-700 text-white hover:bg-blue-700 hover:text-white dark:bg-blue-500",
        today: "rounded-md bg-gray-100 text-gray-950 dark:bg-gray-800 dark:text-gray-50",
        outside: "text-gray-400 opacity-50",
        disabled: "text-gray-400 opacity-50",
        ...classNames,
      }}
      {...props}
    />
  );
}
