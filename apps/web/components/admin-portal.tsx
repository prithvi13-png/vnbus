"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  FileBarChart,
  ListChecks,
  Mail,
  Megaphone,
  Percent,
  PlugZap,
  RefreshCw,
  ReceiptText,
  ServerCog,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  FileUpload,
  Input,
  Progress,
  StatusChip,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type DataTableColumn,
} from "@vnbus/ui";

import {
  downloadBulkBookingTemplate,
  downloadInvoiceDocument,
  type InvoiceInput,
  type InvoiceRecord,
  useInvoiceStore,
} from "../lib/invoice-store";
import { PageHeader } from "./page-header";

const chartColors = ["#02553E", "#B88327", "#037A58", "#9F6F20", "#dc2626"];

type AdminRow = Record<string, unknown> & {
  id: string;
  name: string;
  status: string;
  metric: string;
  owner: string;
  context: string;
};

type BookingRow = Record<string, unknown> & {
  id: string;
  reference: string;
  pnr: string;
  customer: string;
  agent: string;
  route: string;
  operator: string;
  journeyDate: string;
  status: string;
  amount: string;
};

type InvoiceAdminRow = Record<string, unknown> & {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  bookingReference: string;
  customer: string;
  route: string;
  amount: string;
  status: string;
  source: string;
  generatedAt: string;
  action: string;
};

type RoleRow = Record<string, unknown> & {
  id: string;
  code: string;
  name: string;
  permissions: string;
  users: number;
  system: string;
};

type LogRow = Record<string, unknown> & {
  id: string;
  actor: string;
  action: string;
  entity: string;
  ip: string;
  device: string;
  browser: string;
  when: string;
};

export function AdminDashboardWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Admin Dashboard"
        description="Operational control center for bookings, users, agents, revenue, queues, health, and governance."
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricTile key={metric.label} {...metric} />
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <ChartCard title="Booking Trends" description="Weekly bookings and mock revenue">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <RechartsTooltip />
              <Area dataKey="bookings" stroke="#B88327" fill="#FFF8EA" strokeWidth={2} />
              <Area dataKey="revenue" stroke="#02553E" fill="#DCEDE5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Mock service checks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {systemHealth.map((item) => (
              <HealthLine key={item.component} {...item} />
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-5 xl:grid-cols-3">
        <QueueCard title="Email Queue Status" queued={28} sent={1240} failed={3} retry={7} />
        <QueueCard title="Notification Queue" queued={41} sent={3920} failed={4} retry={9} />
        <Card>
          <CardHeader>
            <CardTitle>Top Operators</CardTitle>
            <CardDescription>Mock supplier quality view.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {operatorRows.slice(0, 3).map((operator) => (
              <div
                key={operator.id}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800"
              >
                <div>
                  <p className="font-semibold text-gray-950 dark:text-gray-50">{operator.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{operator.context}</p>
                </div>
                <StatusChip tone={operator.status === "Healthy" ? "success" : "warning"}>
                  {operator.status}
                </StatusChip>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminTable
          title="Most Popular Routes"
          description="Routes ranked by volume and cancellation rate."
          rows={routeRows}
          exportFileName="admin-popular-routes"
        />
        <AdminTable
          title="Most Active Customers"
          description="Customers ranked by recent bookings and lifetime value."
          rows={customerRows}
          exportFileName="admin-active-customers"
        />
      </section>
      <ActivityFeed title="Recent Activities" rows={activityRows.slice(0, 5)} />
    </div>
  );
}

export function AdminBookingsWorkspace(): React.JSX.Element {
  const invoices = useInvoiceStore((state) => state.invoices);
  const bulkBookings = useInvoiceStore((state) => state.bulkBookings);
  const uploadBatches = useInvoiceStore((state) => state.uploadBatches);
  const generateInvoiceFromInput = useInvoiceStore((state) => state.generateInvoiceFromInput);
  const uploadBulkBookingFile = useInvoiceStore((state) => state.uploadBulkBookingFile);
  const markInvoiceDownloaded = useInvoiceStore((state) => state.markInvoiceDownloaded);
  const [invoiceStatus, setInvoiceStatus] = React.useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);
  const invoiceRows = React.useMemo<InvoiceAdminRow[]>(
    () => invoices.map(invoiceToAdminRow),
    [invoices],
  );
  const invoiceColumns: DataTableColumn<InvoiceAdminRow>[] = [
    { id: "invoiceNumber", header: "Invoice", sortable: true },
    { id: "bookingReference", header: "Booking", sortable: true },
    { id: "customer", header: "Customer", sortable: true },
    { id: "route", header: "Route", sortable: true, hideOnMobile: true },
    { id: "amount", header: "Amount", sortable: true, align: "right" },
    {
      id: "status",
      header: "Status",
      sortable: true,
      cell: (row) => <StatusChip tone={statusTone(row.status)}>{row.status}</StatusChip>,
    },
    { id: "source", header: "Source", sortable: true, hideOnMobile: true },
    { id: "generatedAt", header: "Generated", sortable: true, hideOnMobile: true },
    {
      id: "action",
      header: "Action",
      align: "right",
      cell: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => downloadInvoice(row.invoiceId)}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </Button>
      ),
    },
  ];
  const invoiceCount = invoices.length;
  const invoiceTotal = invoices.reduce((sum, invoice) => sum + invoice.total.amount, 0);
  const latestBatch = uploadBatches[0];

  function generateInvoice(row: BookingRow): void {
    const invoice = generateInvoiceFromInput(
      invoiceInputFromBookingRow(row),
      "ADMIN_MANUAL",
      "Admin",
    );
    setInvoiceStatus(`${invoice.invoiceNumber} generated and uploaded.`);
  }

  function generateInvoices(rows: BookingRow[]): void {
    rows.forEach((row) => {
      generateInvoiceFromInput(invoiceInputFromBookingRow(row), "ADMIN_MANUAL", "Admin");
    });
    setInvoiceStatus(`${rows.length} invoice${rows.length === 1 ? "" : "s"} generated.`);
  }

  function downloadInvoice(invoiceId: string): void {
    const invoice = invoices.find((item) => item.invoiceId === invoiceId);

    if (!invoice) {
      setInvoiceStatus("Invoice is not available.");

      return;
    }

    downloadInvoiceDocument(invoice);
    markInvoiceDownloaded(invoice.invoiceId);
    setInvoiceStatus(`${invoice.invoiceNumber} downloaded.`);
  }

  async function handleBulkUpload(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadStatus("Uploading booking sheet...");
      const result = await uploadBulkBookingFile(file, "Admin bulk upload");
      setUploadStatus(
        `Uploaded ${result.bookings.length} booking${result.bookings.length === 1 ? "" : "s"} and generated ${result.invoices.length} invoice${result.invoices.length === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Bulk upload failed.");
    } finally {
      input.value = "";
    }
  }

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Bookings"
        description="Search, filter, inspect ticket state, generate invoices, upload bulk bookings, and view timeline."
      />
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Uploaded Invoices" value={invoiceCount} helper="Invoice repository" />
        <MetricCard
          label="Invoice Value"
          value={`INR ${invoiceTotal.toLocaleString("en-IN")}`}
          helper="INR generated from bookings"
        />
        <MetricCard
          label="Bulk Uploads"
          value={uploadBatches.length}
          helper={latestBatch ? latestBatch.fileName : "No sheet uploaded"}
        />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Advanced Search</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {["Booking ID", "PNR", "Customer", "Agent", "Journey Date"].map((label) => (
            <Input key={label} aria-label={label} placeholder={label} />
          ))}
          {["Operator", "Source", "Destination", "Status"].map((label) => (
            <Input key={label} aria-label={label} placeholder={label} />
          ))}
          <Button type="button">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Apply Filters
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bulk Booking Upload</CardTitle>
          <CardDescription>
            Upload XLS, XLSX, or CSV booking rows to create invoices in one batch.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <FileUpload
            label="Upload booking sheet"
            helperText="Required columns: customerName, route, total"
            accept=".xlsx,.xls,.csv"
            onChange={(event) => void handleBulkUpload(event)}
          />
          <div className="grid content-start gap-3">
            <Button type="button" variant="outline" onClick={downloadBulkBookingTemplate}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Template CSV
            </Button>
            <Button type="button" variant="outline" onClick={() => generateInvoices(bookingRows)}>
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              Generate All Invoices
            </Button>
            {uploadStatus ? (
              <p className="rounded-md border border-gold-100 bg-gold-50 px-3 py-2 text-sm text-brand-900 dark:border-brand-900 dark:bg-gold-500/10 dark:text-gold-100">
                {uploadStatus}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bookings List</CardTitle>
          <CardDescription>
            Enterprise table with bulk actions, export, ticket controls, and invoice generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={bookingColumns}
            data={bookingRows}
            pageSize={8}
            exportable
            exportFileName="admin-bookings"
            bulkActions={(selected) => (
              <>
                <BulkActions count={selected.length} actions={["Cancel", "Resend Email"]} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateInvoices(selected)}
                >
                  <ReceiptText className="h-4 w-4" aria-hidden="true" />
                  Generate Invoices
                </Button>
              </>
            )}
          />
        </CardContent>
      </Card>
      {invoiceStatus ? (
        <p className="rounded-md border border-gold-100 bg-gold-50 px-3 py-2 text-sm text-brand-900 dark:border-brand-900 dark:bg-gold-500/10 dark:text-gold-100">
          {invoiceStatus}
        </p>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Repository</CardTitle>
          <CardDescription>
            Uploaded invoices from customer bookings, admin generation, and bulk sheets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoiceRows.length ? (
            <DataTable
              columns={invoiceColumns}
              data={invoiceRows}
              pageSize={6}
              exportable
              exportFileName="admin-invoices"
              selectable={false}
            />
          ) : (
            <EmptyState
              title="No invoices generated"
              description="Generate invoices from bookings or upload a bulk booking sheet."
            />
          )}
        </CardContent>
      </Card>
      {bulkBookings.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Latest Bulk Bookings</CardTitle>
            <CardDescription>Uploaded booking rows with linked invoice records.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bulkBookings.slice(0, 6).map((booking) => {
              const invoice = invoices.find((item) => item.invoiceId === booking.invoiceId);

              return (
                <div
                  key={booking.bookingId}
                  className="rounded-md border border-gray-200 p-3 dark:border-gray-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">
                      {booking.bookingReference}
                    </p>
                    <StatusChip tone="success">{booking.status}</StatusChip>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {booking.customerName} · {booking.route}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Invoice {invoice?.invoiceNumber ?? "pending"}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
      <section className="grid gap-3 md:grid-cols-3">
        {bookingRows.slice(0, 3).map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle>{booking.reference}</CardTitle>
              <CardDescription>{booking.route}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/ticket?bookingId=${booking.id}`}>
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  View Ticket
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/download-ticket?bookingId=${booking.id}`}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </Link>
              </Button>
              <Button type="button" variant="outline" size="sm">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Resend
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateInvoice(booking)}
              >
                <ReceiptText className="h-4 w-4" aria-hidden="true" />
                Generate Invoice
              </Button>
              <Button type="button" variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reschedule
              </Button>
              <Button type="button" variant="outline" size="sm">
                <Eye className="h-4 w-4" aria-hidden="true" />
                Timeline
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

export function AdminUsersWorkspace(): React.JSX.Element {
  return (
    <UserWorkspace
      title="Users"
      description="Customers, travel agents, and admins with create, edit, activation, reset password, force logout, activity, and booking actions."
    />
  );
}

export function AdminAgentsWorkspace(): React.JSX.Element {
  return (
    <AdminTable
      title="Travel Agents"
      description="Agency onboarding, verification, commission, activation, and booking ownership."
      rows={agentRows}
      exportFileName="admin-travel-agents"
      actionLabel="Create Agent"
    />
  );
}

export function AdminCustomersWorkspace(): React.JSX.Element {
  return (
    <AdminTable
      title="Customers"
      description="Customer accounts, bookings, retention, support state, and activity."
      rows={customerRows}
      exportFileName="admin-customers"
      actionLabel="Create Customer"
    />
  );
}

export function AdminRolesWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Role Management"
        description="Dynamic RBAC roles, permissions, assignment, and removal without future code changes."
      />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={roleColumns}
              data={roleRows}
              pageSize={6}
              exportable
              exportFileName="admin-roles"
              bulkActions={(selected) => (
                <BulkActions count={selected.length} actions={["Assign", "Remove"]} />
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Grouped permission catalog.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {permissionGroups.map((group) => (
              <div
                key={group.group}
                className="rounded-md border border-gray-200 p-3 dark:border-gray-800"
              >
                <p className="font-semibold text-gray-950 dark:text-gray-50">{group.group}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {group.permissions.join(", ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function AdminCouponsWorkspace(): React.JSX.Element {
  return (
    <AdminTable
      title="Coupons"
      description="Percentage and flat coupons with limits, expiry, minimum amount, max discount, and status."
      rows={couponRows}
      exportFileName="admin-coupons"
      actionLabel="Create Coupon"
    />
  );
}

export function AdminOffersWorkspace(): React.JSX.Element {
  return (
    <AdminTable
      title="Offers"
      description="Offer banners, featured routes, seasonal campaigns, home promotions, and popup offers."
      rows={offerRows}
      exportFileName="admin-offers"
      actionLabel="Create Offer"
    />
  );
}

export function AdminCmsWorkspace(): React.JSX.Element {
  return (
    <AdminTable
      title="CMS"
      description="Home banner, About, Privacy, Terms, Refund Policy, FAQ, Contact, blog placeholder, and SEO pages."
      rows={cmsRows}
      exportFileName="admin-cms-pages"
      actionLabel="Create Page"
    />
  );
}

export function AdminNotificationsWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Notifications"
        description="Send customer, agent, and broadcast notifications with template history."
      />
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input aria-label="Audience" defaultValue="Broadcast" />
          <Input aria-label="Title" defaultValue="Scheduled maintenance" />
          <Textarea
            className="md:col-span-3"
            aria-label="Body"
            defaultValue="Service window is scheduled in mock mode."
          />
          <Button type="button" className="md:w-fit">
            <Megaphone className="h-4 w-4" aria-hidden="true" />
            Send
          </Button>
        </CardContent>
      </Card>
      <AdminTable
        title="History & Templates"
        description="Notification history and reusable customer, agent, broadcast templates."
        rows={notificationRows}
        exportFileName="admin-notifications"
      />
    </div>
  );
}

export function AdminEmailTemplatesWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Email Templates"
        description="Visual template records, variables, previews, and version history."
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <AdminTable
          title="Templates"
          description="Booking confirmation, cancellation, reschedule, password reset, welcome, and verify email."
          rows={emailTemplateRows}
          exportFileName="admin-email-templates"
        />
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Variable-bound mock rendering.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input aria-label="Subject" defaultValue="Booking confirmed: VNB-ADM-001" />
            <Textarea
              aria-label="Email preview"
              defaultValue="<p>Your ticket is ready for Bangalore to Hyderabad.</p>"
            />
            <Button type="button">
              <Eye className="h-4 w-4" aria-hidden="true" />
              Preview
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function AdminReportsWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Reports"
        description="Daily, weekly, monthly, yearly reports for bookings, revenue, growth, agents, routes, and cancellations."
      />
      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Revenue Report" description="Mock revenue by day">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="revenue" fill="#02553E" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Cancellation Rate" description="Mock cancellation trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="cancellations" stroke="#dc2626" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
      <AdminTable
        title="Report Exports"
        description="CSV and PDF export-ready report catalog."
        rows={reportRows}
        exportFileName="admin-reports"
      />
    </div>
  );
}

export function AdminAnalyticsWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Analytics"
        description="Revenue, bookings, users, routes, journey trends, operator trends, retention, growth, and cancellations."
      />
      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Revenue" description="Mock revenue">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <RechartsTooltip />
              <Area dataKey="revenue" stroke="#02553E" fill="#DCEDE5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Users & Bookings" description="Growth and demand">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="users" fill="#02553E" />
              <Bar dataKey="bookings" fill="#B88327" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <ChartCard title="Retention" description="Mock retention cohort">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={retentionData} dataKey="value" nameKey="label" outerRadius={92} label>
                {retentionData.map((item, index) => (
                  <Cell
                    key={item.label}
                    fill={chartColors[index % chartColors.length] ?? "#B88327"}
                  />
                ))}
              </Pie>
              <Legend />
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <AdminTable
          title="Operator Trends"
          description="Operator booking and rating movement."
          rows={operatorRows}
          exportFileName="admin-operator-trends"
        />
      </section>
    </div>
  );
}

export function AdminAuditLogsWorkspace(): React.JSX.Element {
  return (
    <LogWorkspace
      title="Audit Logs"
      description="Sensitive user login, logout, booking, profile, role, coupon, and CMS changes."
      rows={auditRows}
    />
  );
}

export function AdminActivityLogsWorkspace(): React.JSX.Element {
  return (
    <LogWorkspace
      title="Activity Logs"
      description="Timeline of who did what, when, from which IP, device, and browser."
      rows={activityRows}
    />
  );
}

export function AdminPlatformSettingsWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Platform Settings"
        description="General, brand, support, timezone, currency, tax, fee, and cancellation policy controls."
      />
      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {settingsRows.slice(0, 6).map((setting) => (
              <Input key={setting.id} aria-label={setting.name} defaultValue={setting.metric} />
            ))}
            <Button type="button" className="w-fit">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Save
            </Button>
          </CardContent>
        </Card>
        <AdminTable
          title="Settings Registry"
          description="Editable platform setting keys."
          rows={settingsRows}
          exportFileName="admin-platform-settings"
        />
      </section>
    </div>
  );
}

export function AdminFeatureFlagsWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Feature Flags"
        description="AI, tracking, coupons, offers, agent portal, email, and maintenance mode controls."
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {featureFlagRows.map((flag) => (
          <Card key={flag.id}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-gray-950 dark:text-gray-50">{flag.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{flag.context}</p>
                <p className="mt-2 text-xs font-medium text-gray-500">{flag.metric}</p>
              </div>
              <Switch defaultChecked={flag.status === "Enabled"} aria-label={flag.name} />
            </CardContent>
          </Card>
        ))}
      </section>
      <AdminTable
        title="Flag Registry"
        description="Rollout and owner metadata."
        rows={featureFlagRows}
        exportFileName="admin-feature-flags"
      />
    </div>
  );
}

export function AdminSystemMonitoringWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="System Monitoring"
        description="Production probes for API, database, Redis, queues, storage, email, suppliers, payments, memory, and CPU."
      />
      <section className="grid gap-3 md:grid-cols-4">
        <UsageCard label="CPU" value={42} />
        <UsageCard label="Memory" value={61} />
        <UsageCard label="Storage" value={37} />
        <UsageCard label="Queue Depth" value={76} />
      </section>
      <AdminTable
        title="Component Health"
        description="Monitoring snapshots and status."
        rows={monitoringRows}
        exportFileName="admin-monitoring"
      />
    </div>
  );
}

export function AdminSupplierConfigurationWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Integration Configuration"
        description="Supplier, payment, health, failover, and webhook readiness for Milestone 10."
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Supplier Mode" value="Mock" tone="success" icon={PlugZap} />
        <MetricTile label="Active Supplier" value="MOCK" tone="success" icon={ShieldCheck} />
        <MetricTile label="Payment Provider" value="Mock" tone="success" icon={CreditCard} />
        <MetricTile label="Live Gateways" value="Disabled" tone="warning" icon={ServerCog} />
      </section>
      <Tabs defaultValue="suppliers">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="toggles">Toggles</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>
                Mock is active; live suppliers remain not configured.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <DataTable
                columns={adminColumns}
                data={supplierRows}
                pageSize={8}
                exportable
                exportFileName="admin-supplier-management"
                bulkActions={(selected) => (
                  <BulkActions
                    count={selected.length}
                    actions={["Enable", "Disable", "Test Connection"]}
                  />
                )}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Test Mock
                </Button>
                <Button type="button" variant="outline">
                  <ListChecks className="h-4 w-4" aria-hidden="true" />
                  View Contract
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Provider Management</CardTitle>
              <CardDescription>
                Gateway adapters are registered without live API keys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={adminColumns}
                data={paymentProviderRows}
                pageSize={8}
                exportable
                exportFileName="admin-payment-providers"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="priority">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Priority</CardTitle>
              <CardDescription>
                Order is configuration-driven and ready for admin updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={adminColumns}
                data={supplierPriorityRows}
                pageSize={8}
                exportable
                exportFileName="admin-supplier-priority"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="health">
          <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Health</CardTitle>
                <CardDescription>Not configured is reported without fake success.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {integrationHealthRows.map((item) => (
                  <HealthLine
                    key={item.component}
                    component={item.component}
                    latency={item.latency}
                    status={item.status}
                  />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Circuit Breakers</CardTitle>
                <CardDescription>
                  Closed, open, and half-open states for supplier routing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={adminColumns}
                  data={circuitRows}
                  pageSize={8}
                  exportable
                  exportFileName="admin-circuit-breakers"
                />
              </CardContent>
            </Card>
          </section>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Integration Logs</CardTitle>
              <CardDescription>
                Correlation IDs, durations, and redacted supplier outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={adminColumns}
                data={integrationLogRows}
                pageSize={8}
                exportable
                exportFileName="admin-integration-logs"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="toggles">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {integrationToggleRows.map((toggle) => (
              <Card key={toggle.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-gray-950 dark:text-gray-50">{toggle.name}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {toggle.context}
                    </p>
                  </div>
                  <Switch defaultChecked={toggle.status === "Enabled"} aria-label={toggle.name} />
                </CardContent>
              </Card>
            ))}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AdminProfileWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Profile"
        description="Admin account details and security placeholders."
      />
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input aria-label="Name" defaultValue="Vriddhi Admin" />
          <Input aria-label="Email" defaultValue="admin@vriddhinexus.com" />
          <Input aria-label="Phone" defaultValue="+910000000001" />
          <Input aria-label="Role" defaultValue="ADMIN" />
          <Button type="button" className="md:w-fit">
            <UserCog className="h-4 w-4" aria-hidden="true" />
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function UserWorkspace({
  description,
  title,
}: {
  description: string;
  title: string;
}): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title={title}
        description={description}
        actionLabel="Create User"
      />
      <Tabs defaultValue="customers">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="agents">Travel Agents</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <UserTable rows={userRows.filter((row) => row.owner === "Customer")} />
        </TabsContent>
        <TabsContent value="agents">
          <UserTable rows={userRows.filter((row) => row.owner === "Travel Agent")} />
        </TabsContent>
        <TabsContent value="admins">
          <UserTable rows={userRows.filter((row) => row.owner === "Admin")} />
        </TabsContent>
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={roleColumns}
                data={roleRows}
                exportable
                exportFileName="admin-user-roles"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserTable({ rows }: { rows: AdminRow[] }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={adminColumns}
          data={rows}
          pageSize={8}
          exportable
          exportFileName="admin-users"
          bulkActions={(selected) => (
            <BulkActions
              count={selected.length}
              actions={["Activate", "Deactivate", "Force Logout"]}
            />
          )}
        />
      </CardContent>
    </Card>
  );
}

function AdminTable({
  actionLabel,
  description,
  exportFileName,
  rows,
  title,
}: {
  actionLabel?: string;
  description: string;
  exportFileName: string;
  rows: AdminRow[];
  title: string;
}): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title={title}
        description={description}
        {...(actionLabel ? { actionLabel } : {})}
      />
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={adminColumns}
            data={rows}
            pageSize={8}
            exportable
            exportFileName={exportFileName}
            bulkActions={(selected) => (
              <BulkActions count={selected.length} actions={["Activate", "Deactivate", "Export"]} />
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function LogWorkspace({
  description,
  rows,
  title,
}: {
  description: string;
  rows: LogRow[];
  title: string;
}): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="Admin" title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={logColumns}
            data={rows}
            pageSize={8}
            exportable
            exportFileName={`admin-${title.toLowerCase().replaceAll(" ", "-")}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityFeed({ rows, title }: { rows: LogRow[]; title: string }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800"
          >
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-500" aria-hidden="true" />
            <div>
              <p className="font-semibold text-gray-950 dark:text-gray-50">{row.action}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {row.actor} · {row.entity} · {row.when}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MetricTile({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
  value: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-950 dark:text-gray-50">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="sr-only">{tone}</span>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}

function HealthLine({
  component,
  latency,
  status,
}: {
  component: string;
  latency: string;
  status: string;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800">
      <div>
        <p className="font-semibold text-gray-950 dark:text-gray-50">{component}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{latency}</p>
      </div>
      <StatusChip tone={status === "Healthy" ? "success" : "warning"}>{status}</StatusChip>
    </div>
  );
}

function QueueCard({
  failed,
  queued,
  retry,
  sent,
  title,
}: {
  failed: number;
  queued: number;
  retry: number;
  sent: number;
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <QueueValue label="Queued" value={queued} />
        <QueueValue label="Sent" value={sent} />
        <QueueValue label="Failed" value={failed} />
        <QueueValue label="Retry" value={retry} />
      </CardContent>
    </Card>
  );
}

function QueueValue({ label, value }: { label: string; value: number }): React.JSX.Element {
  return (
    <div className="rounded-md border border-gray-200 p-3 dark:border-gray-800">
      <p className="text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-950 dark:text-gray-50">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function UsageCard({ label, value }: { label: string; value: number }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{value}%</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={value} />
      </CardContent>
    </Card>
  );
}

function MetricCard({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: number | string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle>{typeof value === "number" ? value.toLocaleString("en-IN") : value}</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      </CardHeader>
    </Card>
  );
}

function BulkActions({ actions, count }: { actions: string[]; count: number }): React.JSX.Element {
  return (
    <>
      <Badge variant="neutral">{count} selected</Badge>
      {actions.map((action) => (
        <Button key={action} type="button" variant="outline" size="sm">
          {action}
        </Button>
      ))}
    </>
  );
}

function invoiceInputFromBookingRow(row: BookingRow): InvoiceInput {
  const total = parseMoneyAmount(row.amount);
  const taxes = Math.round(total * 0.05);
  const baseFare = Math.max(total - taxes, 0);

  return {
    bookingId: row.id,
    bookingReference: row.reference,
    customerName: row.customer,
    customerEmail: "",
    customerPhone: "",
    route: row.route,
    operatorName: row.operator,
    journeyDate: row.journeyDate,
    seats: ["AUTO"],
    passengerCount: 1,
    fare: {
      baseFare: { amount: baseFare, currency: "INR" },
      taxes: { amount: taxes, currency: "INR" },
      discount: { amount: 0, currency: "INR" },
      convenienceFee: { amount: 0, currency: "INR" },
      grandTotal: { amount: total, currency: "INR" },
    },
  };
}

function invoiceToAdminRow(invoice: InvoiceRecord): InvoiceAdminRow {
  return {
    id: invoice.invoiceId,
    invoiceId: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    bookingReference: invoice.bookingReference,
    customer: invoice.customerName,
    route: invoice.route,
    amount: `${invoice.total.currency} ${invoice.total.amount.toLocaleString("en-IN")}`,
    status: invoice.status,
    source: invoice.source.replaceAll("_", " "),
    generatedAt: formatAdminDate(invoice.generatedAt),
    action: "Download",
  };
}

function parseMoneyAmount(value: string): number {
  const amount = Number(value.replace(/[^0-9.-]/gu, ""));

  return Number.isFinite(amount) ? amount : 0;
}

function formatAdminDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

const adminColumns: DataTableColumn<AdminRow>[] = [
  { id: "name", header: "Name", sortable: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusChip tone={statusTone(row.status)}>{row.status}</StatusChip>,
  },
  { id: "metric", header: "Metric", sortable: true },
  { id: "owner", header: "Owner", sortable: true, hideOnMobile: true },
  { id: "context", header: "Context", sortable: true, hideOnMobile: true },
];

const bookingColumns: DataTableColumn<BookingRow>[] = [
  { id: "reference", header: "Booking ID", sortable: true },
  { id: "pnr", header: "PNR", sortable: true },
  { id: "customer", header: "Customer", sortable: true },
  { id: "agent", header: "Agent", sortable: true, hideOnMobile: true },
  { id: "journeyDate", header: "Journey Date", sortable: true },
  { id: "operator", header: "Operator", sortable: true, hideOnMobile: true },
  { id: "route", header: "Route", sortable: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusChip tone={statusTone(row.status)}>{row.status}</StatusChip>,
  },
  { id: "amount", header: "Amount", sortable: true, align: "right" },
];

const roleColumns: DataTableColumn<RoleRow>[] = [
  { id: "code", header: "Role", sortable: true },
  { id: "name", header: "Name", sortable: true },
  { id: "permissions", header: "Permissions", sortable: true },
  { id: "users", header: "Users", sortable: true, align: "right" },
  { id: "system", header: "System", sortable: true },
];

const logColumns: DataTableColumn<LogRow>[] = [
  { id: "actor", header: "Who", sortable: true },
  { id: "action", header: "What", sortable: true },
  { id: "entity", header: "Entity", sortable: true },
  { id: "ip", header: "IP", sortable: true, hideOnMobile: true },
  { id: "device", header: "Device", sortable: true, hideOnMobile: true },
  { id: "browser", header: "Browser", sortable: true, hideOnMobile: true },
  { id: "when", header: "When", sortable: true },
];

function statusTone(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (/(active|healthy|published|ready|enabled|generated|confirmed)/iu.test(status)) {
    return "success";
  }
  if (/(scheduled|pending|retry|draft|degraded)/iu.test(status)) {
    return "warning";
  }
  if (/(failed|cancelled|inactive|disabled|down|suspended)/iu.test(status)) {
    return "danger";
  }

  return "neutral";
}

const dashboardMetrics = [
  { label: "Today's Bookings", value: "36", tone: "success" as const, icon: ClipboardList },
  { label: "Weekly Bookings", value: "242", tone: "success" as const, icon: Activity },
  { label: "Monthly Bookings", value: "1,128", tone: "success" as const, icon: FileBarChart },
  { label: "Revenue", value: "INR 18.6L", tone: "neutral" as const, icon: Percent },
  { label: "Users", value: "12,408", tone: "neutral" as const, icon: Users },
  { label: "Travel Agents", value: "326", tone: "success" as const, icon: ShieldCheck },
  { label: "Upcoming Journeys", value: "418", tone: "neutral" as const, icon: Ticket },
  { label: "Cancelled Bookings", value: "19", tone: "warning" as const, icon: AlertTriangle },
];

const trendData = [
  { label: "Mon", bookings: 118, revenue: 188800, users: 62, cancellations: 3 },
  { label: "Tue", bookings: 142, revenue: 227200, users: 71, cancellations: 4 },
  { label: "Wed", bookings: 136, revenue: 217600, users: 68, cancellations: 5 },
  { label: "Thu", bookings: 168, revenue: 268800, users: 84, cancellations: 6 },
  { label: "Fri", bookings: 191, revenue: 305600, users: 95, cancellations: 5 },
  { label: "Sat", bookings: 224, revenue: 358400, users: 119, cancellations: 8 },
  { label: "Sun", bookings: 149, revenue: 238400, users: 77, cancellations: 4 },
];

const retentionData = [
  { label: "Repeat", value: 58 },
  { label: "New", value: 34 },
  { label: "Dormant", value: 8 },
];

const systemHealth = [
  { component: "API", status: "Healthy", latency: "42 ms" },
  { component: "Database", status: "Healthy", latency: "18 ms" },
  { component: "Redis", status: "Degraded", latency: "96 ms" },
  { component: "Storage", status: "Healthy", latency: "25 ms" },
  { component: "Email", status: "Healthy", latency: "Mock adapter" },
  { component: "Suppliers", status: "Healthy", latency: "Mock adapter" },
  { component: "Payments", status: "Healthy", latency: "Mock adapter" },
];

const routeRows: AdminRow[] = [
  row(
    "route-1",
    "Bangalore to Hyderabad",
    "Active",
    "318 bookings",
    "Operations",
    "1.9% cancellation",
  ),
  row(
    "route-2",
    "Chennai to Coimbatore",
    "Active",
    "242 bookings",
    "Operations",
    "2.4% cancellation",
  ),
  row("route-3", "Pune to Goa", "Active", "196 bookings", "Operations", "1.5% cancellation"),
  row("route-4", "Mumbai to Pune", "Active", "171 bookings", "Operations", "1.1% cancellation"),
];

const operatorRows: AdminRow[] = [
  row("op-1", "Eastern Travels", "Healthy", "214 bookings", "Supplier Ops", "4.6 rating"),
  row("op-2", "GreenLine Roadways", "Healthy", "188 bookings", "Supplier Ops", "4.4 rating"),
  row("op-3", "Royal Express", "Degraded", "144 bookings", "Supplier Ops", "4.2 rating"),
];

const customerRows: AdminRow[] = [
  row("cust-1", "Aarav Sharma", "Active", "14 bookings", "Customer", "INR 22,400"),
  row("cust-2", "Meera Iyer", "VIP", "11 bookings", "Customer", "INR 17,600"),
  row("cust-3", "Rohan Gupta", "Active", "8 bookings", "Customer", "INR 13,200"),
];

const agentRows: AdminRow[] = [
  row(
    "agent-1",
    "Vriddhi Nexus Partner Desk",
    "Active",
    "84 bookings",
    "Travel Agent",
    "4.5% commission",
  ),
  row(
    "agent-2",
    "South Corridor Travels",
    "Active",
    "62 bookings",
    "Travel Agent",
    "4.2% commission",
  ),
  row("agent-3", "Metro Bus Desk", "Pending", "18 bookings", "Travel Agent", "KYC review"),
];

const userRows: AdminRow[] = [
  ...customerRows,
  ...agentRows,
  row("admin-1", "Vriddhi Admin", "Active", "81k audit events", "Admin", "Full access"),
  row("admin-2", "Operations Lead", "Active", "42 reviews", "Admin", "Ops access"),
];

const couponRows: AdminRow[] = [
  row("coupon-1", "WELCOME500", "Active", "INR 500 flat", "Growth", "824 / 5,000 used"),
  row("coupon-2", "AGENT10", "Active", "10% off", "B2B", "612 / 2,500 used"),
  row("coupon-3", "FESTIVE15", "Scheduled", "15% off", "Growth", "Starts 1 Sep"),
];

const offerRows: AdminRow[] = [
  row("offer-1", "Monsoon routes", "Active", "18,420 views", "Growth", "Offer banner"),
  row("offer-2", "Featured Pune to Goa", "Active", "12,980 views", "Growth", "Featured routes"),
  row("offer-3", "Festival travel saver", "Scheduled", "Priority 4", "Growth", "Seasonal"),
  row("offer-4", "App install popup", "Inactive", "6,200 views", "Growth", "Popup offer"),
];

const cmsRows: AdminRow[] = [
  row("cms-1", "Home Banner", "Published", "Updated today", "Content", "Search surface"),
  row("cms-2", "Privacy Policy", "Published", "Version 4", "Legal", "Policy"),
  row("cms-3", "Refund Policy", "Draft", "Version 2", "Legal", "Policy"),
  row("cms-4", "Blog Placeholder", "Draft", "3 posts", "Content", "Blog"),
  row("cms-5", "SEO Bangalore Hyderabad", "Draft", "Route page", "Growth", "SEO"),
];

const notificationRows: AdminRow[] = [
  row("notif-1", "Maintenance broadcast", "Draft", "Broadcast", "Admin", "Push + In-app"),
  row("notif-2", "Journey delay", "Active", "Customer", "Operations", "Template"),
  row("notif-3", "Settlement ready", "Active", "Agent", "Finance", "Template"),
];

const emailTemplateRows: AdminRow[] = [
  row("tpl-1", "Booking Confirmation", "Active", "v3", "Platform", "bookingReference, route"),
  row("tpl-2", "Cancellation", "Active", "v2", "Platform", "refundStatus"),
  row("tpl-3", "Reschedule", "Active", "v4", "Platform", "journeyDate"),
  row("tpl-4", "Password Reset", "Active", "v5", "Auth", "resetUrl"),
  row("tpl-5", "Welcome", "Active", "v3", "Auth", "firstName"),
  row("tpl-6", "Verify Email", "Active", "v3", "Auth", "verificationUrl"),
];

const reportRows: AdminRow[] = [
  row("rpt-1", "Daily Bookings", "Ready", "CSV/PDF", "Operations", "Daily"),
  row("rpt-2", "Weekly Revenue", "Ready", "CSV/PDF", "Finance", "Weekly"),
  row("rpt-3", "Monthly Customer Growth", "Ready", "CSV/PDF", "Growth", "Monthly"),
  row("rpt-4", "Yearly Cancellation Rate", "Ready", "CSV/PDF", "Operations", "Yearly"),
];

const settingsRows: AdminRow[] = [
  row("set-1", "Brand Name", "Active", "Vriddhi Nexus Pvt Ltd", "Platform", "Brand"),
  row("set-2", "Support Email", "Active", "support@vriddhinexus.com", "Support", "Contact"),
  row("set-3", "Support Phone", "Active", "+918045678899", "Support", "Contact"),
  row("set-4", "Timezone", "Active", "Asia/Kolkata", "Platform", "General"),
  row("set-5", "Currency", "Active", "INR", "Finance", "Commercial"),
  row("set-6", "Tax Percentage", "Active", "5", "Finance", "Commercial"),
  row("set-7", "Booking Fee", "Active", "INR 40", "Finance", "Commercial"),
  row("set-8", "Cancellation Policy", "Active", "Mock policy", "Legal", "Policy"),
];

const featureFlagRows: AdminRow[] = [
  row("flag-1", "Enable AI", "Enabled", "100% rollout", "Product", "enable-ai"),
  row("flag-2", "Enable Tracking", "Enabled", "100% rollout", "Operations", "enable-tracking"),
  row("flag-3", "Enable Coupons", "Enabled", "100% rollout", "Growth", "enable-coupons"),
  row("flag-4", "Enable Offers", "Enabled", "100% rollout", "Growth", "enable-offers"),
  row("flag-5", "Enable Agent Portal", "Enabled", "100% rollout", "B2B", "enable-agent-portal"),
  row("flag-6", "Enable Email", "Enabled", "100% rollout", "Platform", "enable-email"),
  row(
    "flag-7",
    "Enable Maintenance Mode",
    "Disabled",
    "0% rollout",
    "SRE",
    "enable-maintenance-mode",
  ),
];

const supplierRows: AdminRow[] = [
  row("sup-0", "Mock Supplier", "Healthy", "Priority 1", "Supplier Ops", "Active mock mode"),
  row("sup-1", "BCI", "Disabled", "Priority 2", "Supplier Ops", "Not configured"),
  row("sup-2", "AbhiBus", "Disabled", "Priority 3", "Supplier Ops", "Not configured"),
  row("sup-3", "RedBus", "Disabled", "Priority 4", "Supplier Ops", "Not configured"),
  row("sup-4", "TBO", "Disabled", "Priority 5", "Supplier Ops", "Not configured"),
  row("sup-5", "Custom Bus API", "Disabled", "Priority 6", "Supplier Ops", "Not configured"),
];

const paymentProviderRows: AdminRow[] = [
  row("pay-0", "Mock Payment", "Healthy", "INR", "Payments", "Active mock capture"),
  row("pay-1", "Razorpay", "Disabled", "INR", "Payments", "Secret reference pending"),
  row("pay-2", "Cashfree", "Disabled", "INR", "Payments", "Secret reference pending"),
  row("pay-3", "PhonePe", "Disabled", "INR", "Payments", "Secret reference pending"),
  row("pay-4", "Stripe", "Disabled", "USD-ready", "Payments", "Secret reference pending"),
  row("pay-5", "Custom Payment API", "Disabled", "INR", "Payments", "Secret reference pending"),
];

const supplierPriorityRows: AdminRow[] = [
  row("prio-1", "MOCK", "Enabled", "Priority 1", "Routing", "Current supplier mode"),
  row("prio-2", "BCI", "Disabled", "Priority 2", "Routing", "Future production mode"),
  row("prio-3", "AbhiBus", "Disabled", "Priority 3", "Routing", "Future production mode"),
  row("prio-4", "RedBus", "Disabled", "Priority 4", "Routing", "Future production mode"),
  row("prio-5", "TBO", "Disabled", "Priority 5", "Routing", "Future production mode"),
  row("prio-6", "Custom", "Disabled", "Priority 6", "Routing", "Future production mode"),
];

const integrationHealthRows = [
  { component: "Mock Supplier", status: "Healthy", latency: "8 ms" },
  { component: "BCI", status: "Disabled", latency: "Not configured" },
  { component: "AbhiBus", status: "Disabled", latency: "Not configured" },
  { component: "RedBus", status: "Disabled", latency: "Not configured" },
  { component: "TBO", status: "Disabled", latency: "Not configured" },
  { component: "Mock Payment", status: "Healthy", latency: "6 ms" },
  { component: "Live Payment", status: "Disabled", latency: "Not configured" },
];

const circuitRows: AdminRow[] = [
  row("circuit-1", "MOCK", "Closed", "0 failures", "Circuit Breaker", "Ready"),
  row("circuit-2", "BCI", "Closed", "0 failures", "Circuit Breaker", "Idle"),
  row("circuit-3", "AbhiBus", "Closed", "0 failures", "Circuit Breaker", "Idle"),
  row("circuit-4", "RedBus", "Closed", "0 failures", "Circuit Breaker", "Idle"),
  row("circuit-5", "TBO", "Closed", "0 failures", "Circuit Breaker", "Idle"),
];

const integrationLogRows: AdminRow[] = [
  row("ilog-1", "SEARCH_TRIPS", "Ready", "requestId + traceId", "MOCK", "Redacted metadata"),
  row("ilog-2", "HOLD_SEATS", "Ready", "idempotency + lock", "MOCK", "No PII stored"),
  row("ilog-3", "PAYMENT_WEBHOOK", "Ready", "duplicate protection", "Payments", "Signature hook"),
  row("ilog-4", "HEALTH_CHECK", "Ready", "not configured", "Suppliers", "No fake success"),
];

const integrationToggleRows: AdminRow[] = [
  row("toggle-1", "Mock Supplier Mode", "Enabled", "SUPPLIER_MODE", "Configuration", "mock"),
  row(
    "toggle-2",
    "Production Suppliers",
    "Disabled",
    "SUPPLIER_MODE",
    "Configuration",
    "production",
  ),
  row("toggle-3", "Mock Payment", "Enabled", "PAYMENT_PROVIDER", "Configuration", "MOCK"),
  row("toggle-4", "Payment Webhooks", "Enabled", "Webhook", "Payments", "Signature interface"),
  row("toggle-5", "Circuit Breakers", "Enabled", "Routing", "Suppliers", "Failure threshold"),
  row(
    "toggle-6",
    "Distributed Locks",
    "Enabled",
    "Redis-ready",
    "Critical operations",
    "TTL expiry",
  ),
];

const monitoringRows: AdminRow[] = [
  row("mon-1", "API Status", "Healthy", "42 ms", "SRE", "99.98%"),
  row("mon-2", "Database", "Healthy", "18 ms", "SRE", "99.99%"),
  row("mon-3", "Redis", "Degraded", "96 ms", "SRE", "98.70%"),
  row("mon-4", "Queue", "Healthy", "55 ms", "SRE", "99.91%"),
  row("mon-5", "Email Queue", "Degraded", "88 ms", "SRE", "99.20%"),
  row("mon-6", "Storage", "Healthy", "25 ms", "SRE", "99.96%"),
  row("mon-7", "Memory", "Healthy", "61%", "SRE", "Below alert"),
  row("mon-8", "CPU", "Healthy", "42%", "SRE", "Below alert"),
];

const bookingRows: BookingRow[] = [
  booking(
    "BKG-ADM-001",
    "VNB-ADM-001",
    "PNRADM001",
    "Aarav Sharma",
    "Direct",
    "Bangalore to Hyderabad",
    "Eastern Travels",
    "20 Aug 2026",
    "TICKET_GENERATED",
    "INR 1,710",
  ),
  booking(
    "BKG-ADM-002",
    "VNB-ADM-002",
    "PNRADM002",
    "Meera Iyer",
    "Vriddhi Nexus Partner Desk",
    "Bangalore to Hyderabad",
    "Eastern Travels",
    "20 Aug 2026",
    "PENDING_PAYMENT",
    "INR 1,660",
  ),
  booking(
    "BKG-ADM-003",
    "VNB-ADM-003",
    "PNRADM003",
    "Rohan Gupta",
    "South Corridor Travels",
    "Chennai to Coimbatore",
    "GreenLine Roadways",
    "22 Aug 2026",
    "RESCHEDULED",
    "INR 1,240",
  ),
  booking(
    "BKG-ADM-004",
    "VNB-ADM-004",
    "PNRADM004",
    "Ananya Rao",
    "Direct",
    "Pune to Goa",
    "Royal Express",
    "24 Aug 2026",
    "CANCELLED",
    "INR 1,450",
  ),
];

const roleRows: RoleRow[] = [
  role("role-1", "ADMIN", "Admin", "18 permissions", 48, "Yes"),
  role("role-2", "TRAVEL_AGENT", "Travel Agent", "9 permissions", 326, "Yes"),
  role("role-3", "CUSTOMER", "Customer", "7 permissions", 12034, "Yes"),
  role("role-4", "SUPPORT_MANAGER", "Support Manager", "5 permissions", 12, "No"),
];

const permissionGroups = [
  { group: "Users", permissions: ["users.view", "users.create", "users.edit", "users.delete"] },
  { group: "Roles", permissions: ["roles.view", "roles.manage", "permissions.view"] },
  { group: "Bookings", permissions: ["bookings.view", "bookings.create", "bookings.update"] },
  { group: "Platform", permissions: ["admin.dashboard", "settings.manage", "activity.view"] },
];

const auditRows: LogRow[] = [
  log(
    "audit-1",
    "admin@vriddhinexus.com",
    "user.login",
    "user:USR-001",
    "103.21.244.12",
    "Desktop",
    "Chrome",
    "09:00",
  ),
  log(
    "audit-2",
    "admin@vriddhinexus.com",
    "booking.cancelled",
    "booking:VNB-ADM-004",
    "103.21.244.12",
    "Desktop",
    "Chrome",
    "08:42",
  ),
  log(
    "audit-3",
    "ops@vriddhinexus.com",
    "role.permission_assigned",
    "role:ADMIN",
    "103.21.244.13",
    "Desktop",
    "Edge",
    "08:25",
  ),
  log(
    "audit-4",
    "content@vriddhinexus.com",
    "cms.page_published",
    "cms:FAQ",
    "103.21.244.14",
    "Tablet",
    "Safari",
    "08:15",
  ),
];

const activityRows: LogRow[] = [
  log(
    "act-1",
    "admin@vriddhinexus.com",
    "booking.resend_email",
    "booking:VNB-ADM-001",
    "103.21.244.12",
    "Desktop",
    "Chrome",
    "09:05",
  ),
  log(
    "act-2",
    "ops@vriddhinexus.com",
    "feature_flag.updated",
    "flag:enable-agent-portal",
    "103.21.244.13",
    "Desktop",
    "Edge",
    "08:35",
  ),
  log(
    "act-3",
    "growth@vriddhinexus.com",
    "coupon.updated",
    "coupon:WELCOME500",
    "103.21.244.15",
    "Desktop",
    "Firefox",
    "08:10",
  ),
  log(
    "act-4",
    "support@vriddhinexus.com",
    "user.force_logout",
    "user:CUS-001",
    "103.21.244.16",
    "Mobile",
    "Chrome",
    "07:55",
  ),
  log(
    "act-5",
    "finance@vriddhinexus.com",
    "report.generated",
    "report:RPT-WEEKLY",
    "103.21.244.17",
    "Desktop",
    "Chrome",
    "07:30",
  ),
];

function row(
  id: string,
  name: string,
  status: string,
  metric: string,
  owner: string,
  context: string,
): AdminRow {
  return { id, name, status, metric, owner, context };
}

function booking(
  id: string,
  reference: string,
  pnr: string,
  customer: string,
  agent: string,
  route: string,
  operator: string,
  journeyDate: string,
  status: string,
  amount: string,
): BookingRow {
  return { id, reference, pnr, customer, agent, route, operator, journeyDate, status, amount };
}

function role(
  id: string,
  code: string,
  name: string,
  permissions: string,
  users: number,
  system: string,
): RoleRow {
  return { id, code, name, permissions, users, system };
}

function log(
  id: string,
  actor: string,
  action: string,
  entity: string,
  ip: string,
  device: string,
  browser: string,
  when: string,
): LogRow {
  return { id, actor, action, entity, ip, device, browser, when };
}
