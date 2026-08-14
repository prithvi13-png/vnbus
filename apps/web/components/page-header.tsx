import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@vnbus/ui";

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  actionHref,
  actionLabel,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  backHref?: string;
  actionHref?: string;
  actionLabel?: string;
}): React.JSX.Element {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-gold-100 pb-6 dark:border-brand-900 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {backHref ? (
          <Button asChild variant="ghost" size="sm" className="mb-3 -ml-3">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
        ) : null}
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-normal text-gold-600 dark:text-gold-100">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold text-brand-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      {actionHref && actionLabel ? (
        <Button asChild>
          <Link href={actionHref}>
            <Search className="h-4 w-4" aria-hidden="true" />
            {actionLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
