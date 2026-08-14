import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "../lib/cn";
import { Button } from "./button";
import { Input, type InputProps } from "./input";

export interface SearchInputProps extends InputProps {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, ...props }, ref) => (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <Input ref={ref} value={value} className={cn("pl-9 pr-10", className)} {...props} />
      {onClear && value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
          className="absolute right-0 top-0 h-10 w-10 text-gray-500 hover:bg-transparent"
          onClick={onClear}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  ),
);

SearchInput.displayName = "SearchInput";
