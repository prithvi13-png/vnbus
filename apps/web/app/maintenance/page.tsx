import type { Metadata } from "next";
import { MaintenanceState, ErrorLayout } from "@vnbus/ui";

export const metadata: Metadata = {
  title: "Maintenance",
};

export default function MaintenancePage(): React.JSX.Element {
  return (
    <ErrorLayout>
      <MaintenanceState
        title="Maintenance window"
        description="The platform maintenance state is ready for scheduled downtime and operational pauses."
      />
    </ErrorLayout>
  );
}
