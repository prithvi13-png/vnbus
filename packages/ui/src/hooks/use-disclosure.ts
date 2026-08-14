"use client";

import * as React from "react";

export function useDisclosure(defaultOpen = false): {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
} {
  const [open, setOpen] = React.useState(defaultOpen);

  return {
    open,
    setOpen,
    onOpen: React.useCallback(() => setOpen(true), []),
    onClose: React.useCallback(() => setOpen(false), []),
    onToggle: React.useCallback(() => setOpen((current) => !current), []),
  };
}
