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
        "border-t border-gold-500/20 bg-brand-950 text-white shadow-[0_-18px_50px_rgba(1,60,45,0.16)] dark:border-gold-500/20 dark:bg-brand-950",
        className,
      )}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_2fr] lg:px-8">
        <div className="grid gap-4">
          {brand}
          {social ? <div className="flex items-center gap-3">{social}</div> : null}
          <p className="text-sm text-white/70">{copyright}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold tracking-normal text-gold-100">
                {column.title}
              </h3>
              <ul className="mt-3 grid gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      className="text-sm text-white/70 transition-colors hover:text-gold-100"
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
