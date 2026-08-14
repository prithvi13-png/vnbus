"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { Dialog, DialogContent } from "./dialog";
import { cn } from "../lib/cn";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect: () => void;
}

export function CommandPalette({
  items,
  onOpenChange,
  open,
}: {
  items: CommandItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <CommandPrimitive className="grid">
          <div className="flex items-center border-b border-gray-200 px-3 dark:border-gray-800">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <CommandPrimitive.Input
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
              placeholder="Search commands"
            />
          </div>
          <CommandPrimitive.List className="max-h-80 overflow-y-auto p-2">
            <CommandPrimitive.Empty className="px-3 py-6 text-center text-sm text-gray-500">
              No commands found.
            </CommandPrimitive.Empty>
            {items.map((item) => (
              <CommandPrimitive.Item
                key={item.id}
                value={`${item.label} ${item.description ?? ""}`}
                className={cn(
                  "flex cursor-default select-none items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none aria-selected:bg-blue-50 aria-selected:text-blue-900 dark:aria-selected:bg-blue-400/10 dark:aria-selected:text-blue-100",
                )}
                onSelect={() => {
                  item.onSelect();
                  onOpenChange(false);
                }}
              >
                <span className="grid">
                  <span className="font-medium">{item.label}</span>
                  {item.description ? (
                    <span className="text-xs text-gray-500">{item.description}</span>
                  ) : null}
                </span>
                {item.shortcut ? (
                  <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-500">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
