"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "../components/button";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { cn } from "../lib/cn";
import { Calendar } from "./calendar";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  className,
  onChange,
  placeholder = "Select date",
  value,
}: DatePickerProps): React.JSX.Element {
  const calendarProps = {
    mode: "single" as const,
    ...(value ? { selected: value } : {}),
    ...(onChange ? { onSelect: onChange } : {}),
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-gray-500",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4" aria-hidden="true" />
          {value
            ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value)
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar {...calendarProps} />
      </PopoverContent>
    </Popover>
  );
}
