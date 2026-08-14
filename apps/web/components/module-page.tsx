import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from "@vnbus/ui";

import { PageHeader } from "./page-header";

export function ModulePage({
  eyebrow,
  title,
  description,
  rows,
  emptyTitle,
  emptyDescription,
}: {
  eyebrow: string;
  title: string;
  description: string;
  rows: [string, string, string][];
  emptyTitle?: string;
  emptyDescription?: string;
}): React.JSX.Element {
  type ModuleRow = Record<string, unknown> & {
    id: string;
    name: string;
    value: string;
    context: string;
  };
  const data: ModuleRow[] = rows.map(([name, value, context]) => ({
    id: `${name}-${value}`,
    name,
    value,
    context,
  }));
  const columns: DataTableColumn<ModuleRow>[] = [
    { id: "name", header: "Name", sortable: true },
    { id: "value", header: "Value", sortable: true },
    { id: "context", header: "Context", sortable: true, hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      {rows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data} pageSize={6} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title={emptyTitle ?? "Nothing to show"}
          description={
            emptyDescription ?? "Records will appear here as platform workflows create them."
          }
        />
      )}
    </>
  );
}
