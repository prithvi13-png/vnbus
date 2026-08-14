import type { Meta, StoryObj } from "@storybook/react";

import {
  AnalyticsChart,
  Autocomplete,
  DataTable,
  DatePicker,
  ErrorState,
  FileUpload,
  ImageUpload,
  LoadingState,
  MaintenanceState,
  OtpInput,
  SuccessState,
  TimePicker,
  Timeline,
} from "..";

const meta = {
  title: "Design System/Data and Advanced Inputs",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tableRows = [
  { id: "1", route: "Bengaluru to Hyderabad", status: "Active", fare: "INR 1,240" },
  { id: "2", route: "Chennai to Coimbatore", status: "Draft", fare: "INR 980" },
  { id: "3", route: "Mumbai to Pune", status: "Active", fare: "INR 640" },
];

export const DataAndStates: Story = {
  render: () => (
    <div className="grid gap-6 bg-gray-50 p-6">
      <DataTable
        data={tableRows}
        columns={[
          { id: "route", header: "Route", sortable: true },
          { id: "status", header: "Status", sortable: true },
          { id: "fare", header: "Fare", align: "right" },
        ]}
      />
      <AnalyticsChart
        data={[
          { label: "Mon", value: 120 },
          { label: "Tue", value: 180 },
          { label: "Wed", value: 160 },
          { label: "Thu", value: 220 },
        ]}
      />
      <Timeline
        items={[
          { id: "1", title: "Account created", timestamp: "09:30", tone: "success" },
          { id: "2", title: "Email verified", timestamp: "09:34", tone: "info" },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <SuccessState title="Success" description="The operation is complete." />
        <ErrorState title="Error" description="The operation needs attention." />
        <MaintenanceState
          title="Maintenance"
          description="The service is temporarily unavailable."
        />
      </div>
      <LoadingState />
      <div className="grid gap-4 md:grid-cols-2">
        <Autocomplete
          value=""
          onChange={() => undefined}
          placeholder="Select city"
          options={[
            { label: "Bengaluru", value: "Bengaluru" },
            { label: "Hyderabad", value: "Hyderabad" },
          ]}
        />
        <DatePicker />
        <TimePicker />
        <OtpInput value="123" onChange={() => undefined} />
        <FileUpload helperText="PDF, CSV, or image" />
        <ImageUpload />
      </div>
    </div>
  ),
};
