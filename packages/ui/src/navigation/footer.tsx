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
        "border-t border-brand-900 bg-brand-900 text-white dark:border-brand-950 dark:bg-brand-950",
        className,
      )}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_2fr] lg:px-8">
        <div className="grid gap-4">
          {brand}
          {social ? <div className="flex items-center gap-3">{social}</div> : null}
          <p className="text-sm text-white/70">{copyright}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold tracking-normal text-white">{column.title}</h3>
              <ul className="mt-3 grid gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a className="text-sm text-white/70 hover:text-gold-100" href={link.href}>
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
