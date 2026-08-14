import * as React from "react";

import { cn } from "../lib/cn";

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export function Footer({
  brand,
  className,
  columns,
  copyright,
  social,
}: {
  brand: React.ReactNode;
  columns: FooterColumn[];
  copyright: string;
  social?: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <footer
      className={cn(
        "border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_2fr] lg:px-8">
        <div className="grid gap-4">
          {brand}
          {social ? <div className="flex items-center gap-3">{social}</div> : null}
          <p className="text-sm text-gray-500 dark:text-gray-400">{copyright}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold tracking-normal text-gray-950 dark:text-gray-50">
                {column.title}
              </h3>
              <ul className="mt-3 grid gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      className="text-sm text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-300"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
