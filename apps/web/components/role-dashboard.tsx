import { BookingList } from "./booking-list";
import { MetricCard } from "./metric-card";
import { PageHeader } from "./page-header";

export function RoleDashboard({
  area,
  title,
  description,
  metrics,
}: {
  area: string;
  title: string;
  description: string;
  metrics: { label: string; value: string; trend: string }[];
}): React.JSX.Element {
  return (
    <>
      <PageHeader
        eyebrow={area}
        title={title}
        description={description}
        actionHref="/search"
        actionLabel="Search buses"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="mt-6">
        <BookingList />
      </section>
    </>
  );
}
