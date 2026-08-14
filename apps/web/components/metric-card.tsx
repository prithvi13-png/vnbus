import { ArrowUpRight } from "lucide-react";
import { StatisticCard } from "@vnbus/ui";

export function MetricCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}): React.JSX.Element {
  return (
    <StatisticCard label={label} value={value} change={trend} trend="up" icon={ArrowUpRight} />
  );
}
