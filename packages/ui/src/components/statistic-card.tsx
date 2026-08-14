import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "../lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export interface StatisticCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  className?: string;
}

export function StatisticCard({
  change,
  className,
  icon: Icon,
  label,
  trend = "neutral",
  value,
}: StatisticCardProps): React.JSX.Element {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </CardTitle>
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-200">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
          {value}
        </p>
        {change ? (
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              trend === "up" && "text-brand-700 dark:text-brand-200",
              trend === "down" && "text-red-700 dark:text-red-300",
              trend === "neutral" && "text-gray-500 dark:text-gray-400",
            )}
          >
            {trend === "neutral" ? null : <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />}
            {change}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
