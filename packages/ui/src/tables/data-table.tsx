"use client";

import * as React from "react";
import { ArrowDownUp, Columns3, Download, FileText } from "lucide-react";

import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { EmptyState } from "../components/empty-state";
import { Pagination } from "../components/pagination";
import { SearchInput } from "../components/search-input";
import { Skeleton } from "../components/skeleton";
import { cn } from "../lib/cn";

export interface DataTableColumn<TData extends Record<string, unknown>> {
  id: Extract<keyof TData, string>;
  header: string;
  cell?: (row: TData) => React.ReactNode;
  sortable?: boolean;
  hideOnMobile?: boolean;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<TData extends Record<string, unknown>> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  rowId?: (row: TData, index: number) => string;
  loading?: boolean;
  searchable?: boolean;
  selectable?: boolean;
  bulkActions?: React.ReactNode | ((selectedRows: TData[]) => React.ReactNode);
  exportable?: boolean;
  exportFileName?: string;
  filterContent?: React.ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

type SortState<TData extends Record<string, unknown>> = {
  key: Extract<keyof TData, string>;
  direction: "asc" | "desc";
} | null;

export function DataTable<TData extends Record<string, unknown>>({
  className,
  columns,
  data,
  emptyDescription = "Records will appear here when they are available.",
  emptyTitle = "No records",
  loading = false,
  pageSize = 8,
  rowId = defaultRowId,
  searchable = true,
  selectable = true,
  bulkActions,
  exportable = false,
  exportFileName = "table-export",
  filterContent,
}: DataTableProps<TData>): React.JSX.Element {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<SortState<TData>>(null);
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(() =>
    columns.map((column) => column.id),
  );
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return data;
    }

    return data.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [data, query]);

  const sorted = React.useMemo(() => {
    if (!sort) {
      return filtered;
    }

    return [...filtered].sort((left, right) => {
      const leftValue = String(left[sort.key] ?? "");
      const rightValue = String(right[sort.key] ?? "");
      const comparison = leftValue.localeCompare(rightValue);

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
  const activeColumns = columns.filter((column) => visibleColumns.includes(column.id));
  const selectedData = sorted.filter((row, index) => selectedRows.has(rowId(row, index)));
  const allSelected =
    paged.length > 0 && paged.every((row, index) => selectedRows.has(rowId(row, index)));

  React.useEffect(() => {
    setPage(1);
  }, [query, sort]);

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchable ? (
          <SearchInput
            value={query}
            placeholder="Search"
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            className="sm:max-w-xs"
          />
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-2">
          {bulkActions && selectedData.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {typeof bulkActions === "function" ? bulkActions(selectedData) : bulkActions}
            </div>
          ) : null}
          {filterContent}
          {exportable ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => exportCsv(sorted, activeColumns, exportFileName)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => exportPdf(sorted, activeColumns, exportFileName)}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                PDF
              </Button>
            </>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                <Columns3 className="h-4 w-4" aria-hidden="true" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={(checked) => {
                    setVisibleColumns((current) =>
                      checked ? [...current, column.id] : current.filter((id) => id !== column.id),
                    );
                  }}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                {selectable ? (
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      aria-label="Select all rows"
                      checked={allSelected}
                      onCheckedChange={(checked) => {
                        setSelectedRows((current) => {
                          const next = new Set(current);
                          paged.forEach((row, index) => {
                            const id = rowId(row, index);
                            if (checked) {
                              next.add(id);
                            } else {
                              next.delete(id);
                            }
                          });
                          return next;
                        });
                      }}
                    />
                  </th>
                ) : null}
                {activeColumns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      "px-4 py-3 font-semibold",
                      column.hideOnMobile && "hidden sm:table-cell",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        onClick={() =>
                          setSort((current) =>
                            current?.key === column.id && current.direction === "asc"
                              ? { key: column.id, direction: "desc" }
                              : { key: column.id, direction: "asc" },
                          )
                        }
                      >
                        {column.header}
                        <ArrowDownUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading
                ? Array.from({ length: pageSize }, (_, index) => (
                    <tr key={index}>
                      {selectable ? (
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-4" />
                        </td>
                      ) : null}
                      {activeColumns.map((column) => (
                        <td key={column.id} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : paged.length
                  ? paged.map((row, rowIndex) => {
                      const id = rowId(row, rowIndex);

                      return (
                        <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-900/60">
                          {selectable ? (
                            <td className="px-4 py-3">
                              <Checkbox
                                aria-label="Select row"
                                checked={selectedRows.has(id)}
                                onCheckedChange={(checked) => {
                                  setSelectedRows((current) => {
                                    const next = new Set(current);
                                    if (checked) {
                                      next.add(id);
                                    } else {
                                      next.delete(id);
                                    }
                                    return next;
                                  });
                                }}
                              />
                            </td>
                          ) : null}
                          {activeColumns.map((column) => (
                            <td
                              key={column.id}
                              className={cn(
                                "px-4 py-3 text-sm text-gray-700 dark:text-gray-300",
                                column.hideOnMobile && "hidden sm:table-cell",
                                column.align === "right" && "text-right",
                                column.align === "center" && "text-center",
                              )}
                            >
                              {column.cell ? column.cell(row) : String(row[column.id] ?? "")}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  : null}
            </tbody>
          </table>
        </div>
        {!loading && !paged.length ? (
          <div className="p-6">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : null}
      </div>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}

function defaultRowId<TData extends Record<string, unknown>>(row: TData, index: number): string {
  return typeof row.id === "string" ? row.id : String(index);
}

function exportCsv<TData extends Record<string, unknown>>(
  rows: TData[],
  columns: DataTableColumn<TData>[],
  fileName: string,
): void {
  const csv = [
    columns.map((column) => escapeCsv(column.header)).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column.id])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportPdf<TData extends Record<string, unknown>>(
  rows: TData[],
  columns: DataTableColumn<TData>[],
  fileName: string,
): void {
  const printable = window.open("", "_blank", "noopener,noreferrer");
  if (!printable) {
    return;
  }

  printable.document.write(`
    <html>
      <head>
        <title>${escapeHtml(fileName)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 20px; margin: 0 0 16px; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(fileName)}</h1>
        <table>
          <thead>
            <tr>${columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${columns
                    .map((column) => `<td>${escapeHtml(row[column.id])}</td>`)
                    .join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `);
  printable.document.close();
  printable.focus();
  printable.print();
}

function escapeCsv(value: unknown): string {
  const text = exportValueToString(value);

  return `"${text.replaceAll('"', '""')}"`;
}

function escapeHtml(value: unknown): string {
  return exportValueToString(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function exportValueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }

  return JSON.stringify(value);
}
