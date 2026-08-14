"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { Input } from "./input";

export interface AutocompleteOption {
  label: string;
  value: string;
  description?: string;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Autocomplete({
  className,
  onChange,
  options,
  placeholder,
  value = "",
}: AutocompleteProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const filtered = options.filter((option) =>
    `${option.label} ${option.description ?? ""}`.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <div className={cn("relative", className)}>
      <Input
        value={value}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
      />
      {open ? (
        <div className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-800 dark:bg-gray-950">
          {filtered.length ? (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className="grid w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none dark:hover:bg-blue-400/10 dark:focus:bg-blue-400/10"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="font-medium text-gray-950 dark:text-gray-50">{option.label}</span>
                {option.description ? (
                  <span className="text-xs text-gray-500">{option.description}</span>
                ) : null}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-500">No results</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
