import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../lib/cn";
import { Button } from "./button";

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  className,
  onPageChange,
  page,
  pageCount,
}: PaginationProps): React.JSX.Element {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav
      className={cn("flex items-center justify-between gap-3", className)}
      aria-label="Pagination"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </Button>
      <div className="hidden items-center gap-1 sm:flex">
        {pages.slice(0, 7).map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={item === page ? "default" : "ghost"}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <span className="text-sm text-gray-600 sm:hidden dark:text-gray-400">
        {page} / {pageCount}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
