"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { Download, Mail, ReceiptText, RefreshCw, Send } from "lucide-react";
import type {
  AdminAnalyticsResponse,
  AdminAuditLogRecord,
  AdminBookingListResponse,
  AdminBookingRecord,
  AdminChartPoint,
  AdminCouponRecord,
  AdminDashboardResponse,
  AdminEmailTemplateRecord,
  AdminFeatureFlagRecord,
  AdminMonitoringResponse,
  AdminNotificationCenterResponse,
  AdminOfferRecord,
  AdminPlatformSettingsResponse,
  AdminQueueStatusRecord,
  AdminReportType,
  AdminReportsResponse,
  AdminSystemHealthRecord,
  CacheDashboardResponse,
  CmsPageRecord,
  IntegrationDashboardResponse,
  PaymentProviderConfig,
  QueueDashboardResponse,
  SchedulerDashboardResponse,
  SupplierIntegrationConfig,
} from "@vnbus/types";
import {
  AnalyticsChart,
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
  Skeleton,
  StatusChip,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type DataTableColumn,
} from "@vnbus/ui";

import { apiClient } from "../lib/api-client";
import { useAuthStore } from "../lib/auth-store";
import {
  downloadBulkBookingTemplate,
  downloadInvoiceDocument,
  invoiceInputFromBooking,
  type InvoiceRecord,
  useInvoiceStore,
} from "../lib/invoice-store";
import { PageHeader } from "./page-header";

/*
 * Every admin view reads the API. Nothing here is sample data: an empty table
 * means the platform has no such records yet.
 */

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface RoleRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

interface ActivityRecord {
  id: string;
  actorType: string;
  action: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  browser: string | null;
  createdAt: string;
}

interface IntegrationConfigurationResponse {
  suppliers: SupplierIntegrationConfig[];
  paymentProviders: PaymentProviderConfig[];
}

function useAdminQuery<T>(key: string, path: string): UseQueryResult<T> {
  return useQuery({ queryKey: ["admin", key], queryFn: () => apiClient<T>(path) });
}

export function AdminDashboardWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminDashboardResponse>("dashboard", "/admin/dashboard");

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Admin Dashboard"
        description="Bookings, revenue, accounts, and platform health, counted from live records."
      />
      <QueryState query={query}>
        {(dashboard) => (
          <>
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {dashboard.cards.map((card) => (
                <MetricCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  helper={card.change}
                />
              ))}
            </section>
            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
              <ChartCard title="Bookings, last 7 days" points={dashboard.bookingTrends} />
              <HealthCard components={dashboard.systemHealth} />
            </section>
            <section className="grid gap-5 xl:grid-cols-2">
              <QueueCard queue={dashboard.emailQueueStatus} />
              <QueueCard queue={dashboard.notificationQueueStatus} />
            </section>
            <section className="grid gap-5 xl:grid-cols-2">
              <SimpleTable
                title="Most Popular Routes"
                rows={dashboard.popularRoutes.map((route) => ({
                  id: route.route,
                  route: route.route,
                  bookings: route.bookings,
                  revenue: formatInr(route.revenue.amount),
                  cancellations: `${route.cancellationRate}%`,
                }))}
                columns={[
                  { id: "route", header: "Route" },
                  { id: "bookings", header: "Bookings", align: "right" },
                  { id: "revenue", header: "Revenue", align: "right" },
                  { id: "cancellations", header: "Cancelled", align: "right" },
                ]}
                emptyDescription="Routes appear once bookings are made."
              />
              <SimpleTable
                title="Most Active Customers"
                rows={dashboard.mostActiveCustomers.map((customer) => ({
                  id: customer.customerId,
                  name: customer.name,
                  bookings: customer.bookings,
                  revenue: formatInr(customer.revenue.amount),
                  last: formatDateTime(customer.lastBookedAt),
                }))}
                columns={[
                  { id: "name", header: "Customer" },
                  { id: "bookings", header: "Bookings", align: "right" },
                  { id: "revenue", header: "Spend", align: "right" },
                  { id: "last", header: "Last booked", hideOnMobile: true },
                ]}
                emptyDescription="Customers appear once bookings are made."
              />
            </section>
            <SimpleTable
              title="Top Operators"
              rows={dashboard.topOperators.map((operator) => ({
                id: operator.operatorId,
                operator: operator.operatorName,
                bookings: operator.bookings,
                revenue: formatInr(operator.revenue.amount),
              }))}
              columns={[
                { id: "operator", header: "Operator" },
                { id: "bookings", header: "Bookings", align: "right" },
                { id: "revenue", header: "Revenue", align: "right" },
              ]}
              emptyDescription="Operators appear once their tickets are sold."
            />
            <ActivityTable
              title="Recent Activities"
              rows={dashboard.recentActivities.map((activity) => ({
                id: activity.activityId,
                actor: activity.actor,
                action: activity.action,
                entity: [activity.entityType, activity.entityId].filter(Boolean).join(" "),
                ip: activity.ipAddress,
                when: formatDateTime(activity.occurredAt),
              }))}
            />
          </>
        )}
      </QueryState>
    </div>
  );
}

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

export function AdminBookingsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminBookingListResponse>(
    "bookings",
    "/admin/bookings?page=1&pageSize=100",
  );
  const invoices = useInvoiceStore((state) => state.invoices);
  const bulkBookings = useInvoiceStore((state) => state.bulkBookings);
  const uploadBatches = useInvoiceStore((state) => state.uploadBatches);
  const generateInvoiceFromInput = useInvoiceStore((state) => state.generateInvoiceFromInput);
  const uploadBulkBookingFile = useInvoiceStore((state) => state.uploadBulkBookingFile);
  const markInvoiceDownloaded = useInvoiceStore((state) => state.markInvoiceDownloaded);
  const [status, setStatus] = React.useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);
  const records = React.useMemo(() => query.data?.bookings ?? [], [query.data]);
  const rows = React.useMemo(() => records.map(toBookingRow), [records]);
  const invoiceTotal = invoices.reduce((sum, invoice) => sum + invoice.total.amount, 0);

  function findRecord(bookingId: string): AdminBookingRecord | undefined {
    return records.find((record) => record.booking.bookingId === bookingId);
  }

  function generateInvoices(selected: BookingRow[]): void {
    const generated = selected
      .map((row) => findRecord(row.id))
      .filter((record): record is AdminBookingRecord => Boolean(record))
      .map((record) =>
        generateInvoiceFromInput(invoiceInputFromBooking(record.booking), "ADMIN_MANUAL", "Admin"),
      );

    setStatus(
      generated.length === 1
        ? `${generated[0]?.invoiceNumber} generated and uploaded.`
        : `${generated.length} invoices generated.`,
    );
  }

  async function resendEmail(bookingId: string): Promise<void> {
    try {
      const response = await apiClient<{ status: string }>(
        `/admin/bookings/${encodeURIComponent(bookingId)}/resend-email`,
        { method: "POST" },
      );
      setStatus(`Ticket email ${response.status.toLowerCase()}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Email failed.");
    }
  }

  function downloadInvoice(invoice: InvoiceRecord): void {
    downloadInvoiceDocument(invoice);
    markInvoiceDownloaded(invoice.invoiceId);
    setStatus(`${invoice.invoiceNumber} downloaded.`);
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

  const bookingColumns: DataTableColumn<BookingRow>[] = [
    {
      id: "reference",
      header: "Reference",
      sortable: true,
      cell: (row) => (
        <Link
          className="font-medium text-gold-700 dark:text-gold-200"
          href={`/ticket?bookingId=${row.id}`}
        >
          {row.reference}
        </Link>
      ),
    },
    { id: "pnr", header: "PNR", sortable: true },
    { id: "customer", header: "Customer", sortable: true },
    { id: "agent", header: "Agent", sortable: true, hideOnMobile: true },
    { id: "route", header: "Route", sortable: true, hideOnMobile: true },
    { id: "operator", header: "Operator", sortable: true, hideOnMobile: true },
    { id: "journeyDate", header: "Journey", sortable: true },
    {
      id: "status",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <StatusChip tone={statusTone(row.status)}>{row.status.replaceAll("_", " ")}</StatusChip>
      ),
    },
    { id: "amount", header: "Amount", sortable: true, align: "right" },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => generateInvoices([row])}>
            <ReceiptText className="h-4 w-4" aria-hidden="true" />
            Generate Invoice
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void resendEmail(row.id)}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Resend
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Bookings"
        description="Every booking on the platform, with tickets, invoices, and offline booking upload."
      />
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Bookings" value={String(query.data?.total ?? 0)} helper="All channels" />
        <MetricCard
          label="Invoices"
          value={String(invoices.length)}
          helper={formatInr(invoiceTotal)}
        />
        <MetricCard
          label="Bulk Uploads"
          value={String(uploadBatches.length)}
          helper={uploadBatches[0]?.fileName ?? "No sheet uploaded"}
        />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Bookings List</CardTitle>
          <CardDescription>Search, export, resend tickets, and generate invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : query.isError ? (
            <ErrorNotice error={query.error} onRetry={() => void query.refetch()} />
          ) : (
            <DataTable
              columns={bookingColumns}
              data={rows}
              rowId={(row) => row.id}
              pageSize={10}
              searchable
              exportable
              exportFileName="admin-bookings"
              bulkActions={(selected) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateInvoices(selected)}
                >
                  <ReceiptText className="h-4 w-4" aria-hidden="true" />
                  Generate Invoices
                </Button>
              )}
              emptyTitle="No bookings yet"
              emptyDescription="Bookings appear here as travellers and agents book."
            />
          )}
        </CardContent>
      </Card>
      {status ? <StatusNote>{status}</StatusNote> : null}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Booking Upload</CardTitle>
          <CardDescription>
            Upload XLSX or CSV rows for bookings made offline to create their invoices in one batch.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <FileUpload
            label="Upload booking sheet"
            helperText="Required columns: customerName, route, total"
            accept=".xlsx,.csv"
            onChange={(event) => void handleBulkUpload(event)}
          />
          <div className="grid content-start gap-3">
            <Button type="button" variant="outline" onClick={downloadBulkBookingTemplate}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Template CSV
            </Button>
            {uploadStatus ? <StatusNote>{uploadStatus}</StatusNote> : null}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Repository</CardTitle>
          <CardDescription>
            Invoices generated in this browser from bookings and bulk sheets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleTable
            bare
            rows={invoices.map((invoice) => ({
              id: invoice.invoiceId,
              invoiceNumber: invoice.invoiceNumber,
              bookingReference: invoice.bookingReference,
              customer: invoice.customerName,
              amount: formatInr(invoice.total.amount),
              status: invoice.status,
              generatedAt: formatDateTime(invoice.uploadedAt),
              invoice,
            }))}
            columns={[
              { id: "invoiceNumber", header: "Invoice" },
              { id: "bookingReference", header: "Booking" },
              { id: "customer", header: "Customer" },
              { id: "amount", header: "Amount", align: "right" },
              { id: "status", header: "Status" },
              { id: "generatedAt", header: "Generated", hideOnMobile: true },
              {
                id: "invoice",
                header: "Action",
                align: "right",
                cell: (row) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(row.invoice)}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download
                  </Button>
                ),
              },
            ]}
            emptyDescription="Generate invoices from bookings or upload a bulk booking sheet."
          />
          {bulkBookings.length ? (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {bulkBookings.length} uploaded booking{bulkBookings.length === 1 ? "" : "s"} on
              record.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminUsersWorkspace(): React.JSX.Element {
  return <UsersWorkspace title="Users" description="Every account on the platform." />;
}

export function AdminAgentsWorkspace(): React.JSX.Element {
  return (
    <UsersWorkspace
      title="Travel Agents"
      description="Accounts with the travel agent role."
      roleCode="TRAVEL_AGENT"
    />
  );
}

export function AdminCustomersWorkspace(): React.JSX.Element {
  return (
    <UsersWorkspace
      title="Customers"
      description="Accounts with the customer role."
      roleCode="CUSTOMER"
    />
  );
}

export function AdminRolesWorkspace(): React.JSX.Element {
  const query = useAdminQuery<RoleRecord[]>("roles", "/roles");

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Roles & Permissions"
        description="Roles and the permissions each grants."
      />
      <QueryState query={query}>
        {(roles) => (
          <SimpleTable
            title="Roles"
            rows={roles.map((role) => ({
              id: role.id,
              code: role.code,
              name: role.name,
              system: role.isSystem ? "System" : "Custom",
              permissions: role.permissions.length,
            }))}
            columns={[
              { id: "code", header: "Code" },
              { id: "name", header: "Name" },
              { id: "system", header: "Type" },
              { id: "permissions", header: "Permissions", align: "right" },
            ]}
            emptyDescription="No roles are defined."
          />
        )}
      </QueryState>
    </div>
  );
}

export function AdminCouponsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminCouponRecord[]>("coupons", "/coupons");

  return (
    <ListWorkspace
      title="Coupons"
      description="Discount codes. None is applied at checkout yet."
      query={query}
      columns={[
        { id: "code", header: "Code" },
        { id: "discount", header: "Discount" },
        { id: "usage", header: "Used", align: "right" },
        { id: "expires", header: "Expires", hideOnMobile: true },
        { id: "status", header: "Status" },
      ]}
      toRows={(coupons) =>
        coupons.map((coupon) => ({
          id: coupon.couponId,
          code: coupon.code,
          discount:
            coupon.type === "PERCENTAGE"
              ? `${coupon.discountValue}%`
              : formatInr(coupon.discountValue),
          usage: `${coupon.usedCount} / ${coupon.usageLimit}`,
          expires: formatDateTime(coupon.expiresAt),
          status: coupon.status,
        }))
      }
      emptyDescription="No coupons have been created."
    />
  );
}

export function AdminOffersWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminOfferRecord[]>("offers", "/offers");

  return (
    <ListWorkspace
      title="Offers"
      description="Promotional placements."
      query={query}
      columns={[
        { id: "title", header: "Title" },
        { id: "placement", header: "Placement" },
        { id: "route", header: "Route", hideOnMobile: true },
        { id: "window", header: "Runs", hideOnMobile: true },
        { id: "status", header: "Status" },
      ]}
      toRows={(offers) =>
        offers.map((offer) => ({
          id: offer.offerId,
          title: offer.title,
          placement: offer.placement.replaceAll("_", " "),
          route: offer.route ?? "All routes",
          window: `${formatDateTime(offer.startsAt)} – ${formatDateTime(offer.endsAt)}`,
          status: offer.status,
        }))
      }
      emptyDescription="No offers have been created."
    />
  );
}

export function AdminCmsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<CmsPageRecord[]>("cms", "/cms/pages");

  return (
    <ListWorkspace
      title="Content"
      description="Pages managed through the CMS."
      query={query}
      columns={[
        { id: "title", header: "Title" },
        { id: "section", header: "Section" },
        { id: "status", header: "Status" },
        { id: "updated", header: "Updated", hideOnMobile: true },
      ]}
      toRows={(pages) =>
        pages.map((page) => ({
          id: page.pageId,
          title: page.title,
          section: page.section.replaceAll("_", " "),
          status: page.status,
          updated: formatDateTime(page.updatedAt),
        }))
      }
      emptyDescription="No CMS pages have been created."
    />
  );
}

export function AdminNotificationsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminNotificationCenterResponse>(
    "notifications",
    "/admin/notifications",
  );
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);

  async function send(): Promise<void> {
    try {
      await apiClient("/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify({ audience: "BROADCAST", title, body }),
      });
      setTitle("");
      setBody("");
      setStatus("Broadcast sent to every signed-in user.");
      void query.refetch();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sending failed.");
    }
  }

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Notifications"
        description="In-app notifications sent on the platform."
      />
      <Card>
        <CardHeader>
          <CardTitle>Send a broadcast</CardTitle>
          <CardDescription>Shown in every user&apos;s notification center.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input
            aria-label="Title"
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Textarea
            aria-label="Message"
            placeholder="Message"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <Button
            type="button"
            className="w-fit"
            disabled={!title.trim() || !body.trim()}
            onClick={() => void send()}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Send
          </Button>
          {status ? <StatusNote>{status}</StatusNote> : null}
        </CardContent>
      </Card>
      <QueryState query={query}>
        {(center) => (
          <>
            <QueueCard queue={center.queue} />
            <SimpleTable
              title="History"
              rows={center.history.map((notification) => ({
                id: notification.id,
                title: notification.title,
                type: notification.type.replaceAll("_", " "),
                audience: notification.userId ? "One user" : "Everyone",
                when: formatDateTime(notification.createdAt),
              }))}
              columns={[
                { id: "title", header: "Title" },
                { id: "type", header: "Type", hideOnMobile: true },
                { id: "audience", header: "Audience" },
                { id: "when", header: "Sent" },
              ]}
              emptyDescription="No notifications have been sent since the API started."
            />
          </>
        )}
      </QueryState>
    </div>
  );
}

export function AdminEmailTemplatesWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminEmailTemplateRecord[]>(
    "email-templates",
    "/admin/email-templates",
  );

  return (
    <ListWorkspace
      title="Email Templates"
      description="The templates outgoing email is rendered from."
      query={query}
      columns={[
        { id: "key", header: "Template" },
        { id: "subject", header: "Subject" },
        { id: "variables", header: "Variables", hideOnMobile: true },
        { id: "version", header: "Version", align: "right" },
      ]}
      toRows={(templates) =>
        templates.map((template) => ({
          id: template.templateId,
          key: template.key,
          subject: template.subject,
          variables: template.variables.join(", "),
          version: template.version,
        }))
      }
      emptyDescription="No email templates are defined."
    />
  );
}

const REPORT_TYPES: AdminReportType[] = ["BOOKINGS", "REVENUE", "CANCELLATION_RATE"];

export function AdminReportsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminReportsResponse>("reports", "/reports/admin");
  const [status, setStatus] = React.useState<string | null>(null);

  async function generate(type: AdminReportType): Promise<void> {
    try {
      await apiClient("/reports/admin", {
        method: "POST",
        body: JSON.stringify({ type, period: "DAILY" }),
      });
      setStatus(`${type.replaceAll("_", " ").toLowerCase()} report generated.`);
      void query.refetch();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Report failed.");
    }
  }

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="Admin" title="Reports" description="Reports over real bookings." />
      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map((type) => (
          <Button key={type} type="button" variant="outline" onClick={() => void generate(type)}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {type.replaceAll("_", " ").toLowerCase()} report
          </Button>
        ))}
      </div>
      {status ? <StatusNote>{status}</StatusNote> : null}
      <QueryState query={query}>
        {(reports) => (
          <>
            <section className="grid gap-3 md:grid-cols-2">
              <MetricCard
                label="Cancellation rate"
                value={`${reports.cancellationRate}%`}
                helper="All bookings"
              />
              <MetricCard
                label="Generated reports"
                value={String(reports.reports.length)}
                helper="This session"
              />
            </section>
            {reports.reports.map((report) => (
              <ChartCard key={report.reportId} title={report.name} points={report.rows} />
            ))}
            <SimpleTable
              title="Agent Performance"
              rows={reports.agentPerformance.map((agent) => ({
                id: agent.agentId,
                agent: agent.agencyName,
                bookings: agent.bookings,
                revenue: formatInr(agent.revenue.amount),
              }))}
              columns={[
                { id: "agent", header: "Agent" },
                { id: "bookings", header: "Bookings", align: "right" },
                { id: "revenue", header: "Revenue", align: "right" },
              ]}
              emptyDescription="Agent bookings appear here once agents book."
            />
          </>
        )}
      </QueryState>
    </div>
  );
}

export function AdminAnalyticsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminAnalyticsResponse>("analytics", "/analytics/dashboard");

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Analytics"
        description="Trends counted from bookings and accounts."
      />
      <QueryState query={query}>
        {(analytics) => (
          <section className="grid gap-5 xl:grid-cols-2">
            <ChartCard title="Bookings, last 7 days" points={analytics.bookings} />
            <ChartCard
              title="Revenue, last 7 days (INR)"
              points={analytics.revenue}
              metric="revenue"
            />
            <ChartCard title="New accounts, last 7 days" points={analytics.customerGrowth} />
            <ChartCard title="Departures, next 7 days" points={analytics.journeyTrends} />
          </section>
        )}
      </QueryState>
    </div>
  );
}

export function AdminAuditLogsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminAuditLogRecord[]>("audit", "/audit/logs");

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Audit Logs"
        description="Recorded changes, newest first."
      />
      <QueryState query={query}>
        {(logs) => (
          <ActivityTable
            title="Audit trail"
            rows={logs.map((log) => ({
              id: log.auditId,
              actor: log.actor,
              action: log.action,
              entity: [log.entityType, log.entityId].filter(Boolean).join(" "),
              ip: log.ipAddress,
              when: formatDateTime(log.createdAt),
            }))}
          />
        )}
      </QueryState>
    </div>
  );
}

export function AdminActivityLogsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<ActivityRecord[]>("activity", "/activity");

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Activity Logs"
        description="Request activity, newest first."
      />
      <QueryState query={query}>
        {(logs) => (
          <ActivityTable
            title="Activity"
            rows={logs.map((log) => ({
              id: log.id,
              actor: log.actorType,
              action: log.message || log.action,
              entity: [log.entityType, log.entityId].filter(Boolean).join(" "),
              ip: log.ipAddress ?? "",
              when: formatDateTime(log.createdAt),
            }))}
          />
        )}
      </QueryState>
    </div>
  );
}

export function AdminPlatformSettingsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminPlatformSettingsResponse>(
    "platform-settings",
    "/platform-settings",
  );

  return (
    <ListWorkspace
      title="Platform Settings"
      description="Brand, support, and policy settings."
      query={query}
      columns={[
        { id: "label", header: "Setting" },
        { id: "category", header: "Category" },
        { id: "value", header: "Value" },
      ]}
      toRows={(response) =>
        response.settings.map((setting) => ({
          id: setting.settingId,
          label: setting.label,
          category: setting.category,
          value: setting.isSecretReference ? "Stored as a secret" : setting.value,
        }))
      }
      emptyDescription="No platform settings are defined."
    />
  );
}

export function AdminFeatureFlagsWorkspace(): React.JSX.Element {
  const query = useAdminQuery<AdminFeatureFlagRecord[]>("feature-flags", "/feature-flags");

  return (
    <ListWorkspace
      title="Feature Flags"
      description="Feature switches and their rollout."
      query={query}
      columns={[
        { id: "name", header: "Flag" },
        { id: "enabled", header: "State" },
        { id: "rollout", header: "Rollout", align: "right" },
        { id: "owner", header: "Owner", hideOnMobile: true },
      ]}
      toRows={(flags) =>
        flags.map((flag) => ({
          id: flag.flagId,
          name: flag.name,
          enabled: flag.enabled ? "On" : "Off",
          rollout: `${flag.rolloutPercentage}%`,
          owner: flag.owner,
        }))
      }
      emptyDescription="No feature flags are defined."
    />
  );
}

export function AdminSystemMonitoringWorkspace(): React.JSX.Element {
  const monitoring = useAdminQuery<AdminMonitoringResponse>("monitoring", "/monitoring");
  const queues = useAdminQuery<QueueDashboardResponse>("queues", "/queues");
  const scheduler = useAdminQuery<SchedulerDashboardResponse>("scheduler", "/scheduler/jobs");
  const cache = useAdminQuery<CacheDashboardResponse>("cache", "/cache");

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="System Monitoring"
        description="Live readings from the API process and its dependencies."
      />
      <QueryState query={monitoring}>
        {(data) => (
          <>
            <section className="grid gap-3 md:grid-cols-3">
              <MetricCard
                label="CPU load"
                value={`${data.cpu}%`}
                helper="One-minute load average"
              />
              <MetricCard label="Memory in use" value={`${data.memory}%`} helper="Host memory" />
              <MetricCard
                label="Queued emails"
                value={String(data.queueDepth)}
                helper="Waiting to send"
              />
            </section>
            <HealthCard components={data.components} />
          </>
        )}
      </QueryState>
      <QueryState query={queues}>
        {(data) => (
          <SimpleTable
            title="Queues"
            rows={data.queues.map((queue) => ({
              id: queue.queue,
              queue: queue.queue.replaceAll("_", " "),
              waiting: queue.waiting,
              failed: queue.failed,
              status: queue.status,
            }))}
            columns={[
              { id: "queue", header: "Queue" },
              { id: "waiting", header: "Waiting", align: "right" },
              { id: "failed", header: "Failed", align: "right" },
              { id: "status", header: "Status" },
            ]}
            emptyDescription="No queues are configured."
          />
        )}
      </QueryState>
      <QueryState query={scheduler}>
        {(data) => (
          <SimpleTable
            title="Scheduled Jobs"
            rows={data.jobs.map((job) => ({
              id: job.jobId,
              name: job.name,
              schedule: job.schedule.replaceAll("_", " "),
              status: job.status,
            }))}
            columns={[
              { id: "name", header: "Job" },
              { id: "schedule", header: "Schedule" },
              { id: "status", header: "Status" },
            ]}
            emptyDescription="No background jobs are scheduled."
          />
        )}
      </QueryState>
      <QueryState query={cache}>
        {(data) => (
          <MetricCard
            label="Cache"
            value={data.entries.length ? `${Math.round(data.hitRate * 100)}% hits` : "No entries"}
            helper={`${data.provider} · ${data.status}`}
          />
        )}
      </QueryState>
    </div>
  );
}

export function AdminSupplierConfigurationWorkspace(): React.JSX.Element {
  const dashboard = useAdminQuery<IntegrationDashboardResponse>(
    "integrations",
    "/integrations/dashboard",
  );
  const configuration = useAdminQuery<IntegrationConfigurationResponse>(
    "integration-configuration",
    "/integrations/configuration",
  );

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Admin"
        title="Integration Configuration"
        description="Bus suppliers and payment gateways, as the server environment configures them."
      />
      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers" className="grid gap-5">
          <QueryState query={dashboard}>
            {(data) => (
              <SimpleTable
                title="Suppliers"
                rows={data.suppliers.map((supplier) => {
                  const health = data.health.find((item) => item.supplierCode === supplier.code);

                  return {
                    id: supplier.code,
                    name: supplier.name,
                    enabled: supplier.enabled ? "Enabled" : "Not configured",
                    priority: supplier.priority,
                    health: health?.status ?? "UNKNOWN",
                    message: health?.message ?? "",
                  };
                })}
                columns={[
                  { id: "name", header: "Supplier" },
                  { id: "enabled", header: "State" },
                  { id: "priority", header: "Priority", align: "right" },
                  { id: "health", header: "Health" },
                  { id: "message", header: "Detail", hideOnMobile: true },
                ]}
                emptyDescription="No suppliers are registered."
              />
            )}
          </QueryState>
        </TabsContent>
        <TabsContent value="payments" className="grid gap-5">
          <QueryState query={configuration}>
            {(data) => (
              <SimpleTable
                title="Payment gateways"
                description="No gateway is wired yet; bookings are confirmed without collecting payment."
                rows={data.paymentProviders.map((provider) => ({
                  id: provider.code,
                  name: provider.name,
                  enabled: provider.enabled ? "Selected" : "Not configured",
                  currency: provider.currency,
                }))}
                columns={[
                  { id: "name", header: "Gateway" },
                  { id: "enabled", header: "State" },
                  { id: "currency", header: "Currency" },
                ]}
                emptyDescription="No payment gateways are defined."
              />
            )}
          </QueryState>
        </TabsContent>
        <TabsContent value="logs" className="grid gap-5">
          <QueryState query={dashboard}>
            {(data) => (
              <SimpleTable
                title="Recent supplier requests"
                rows={data.requestLogs.map((log) => ({
                  id: log.requestId,
                  supplier: log.supplierCode,
                  operation: log.operation.replaceAll("_", " "),
                  result: log.success ? "OK" : (log.errorCode ?? "Failed"),
                  duration: `${log.durationMs} ms`,
                  when: formatDateTime(log.timestamp),
                }))}
                columns={[
                  { id: "supplier", header: "Supplier" },
                  { id: "operation", header: "Operation" },
                  { id: "result", header: "Result" },
                  { id: "duration", header: "Duration", align: "right" },
                  { id: "when", header: "When", hideOnMobile: true },
                ]}
                emptyDescription="No supplier requests since the API started."
              />
            )}
          </QueryState>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AdminProfileWorkspace(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="Admin" title="Profile" description="Your administrator account." />
      {user ? (
        <Card>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            <Detail label="Name" value={`${user.firstName} ${user.lastName}`} />
            <Detail label="Email" value={user.email} />
            <Detail label="Phone" value={user.phone} />
            <Detail label="Role" value={user.role} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="Not signed in" description="Sign in to see your profile." />
      )}
      <Button asChild variant="outline" className="w-fit">
        <Link href="/profile">Edit profile</Link>
      </Button>
    </div>
  );
}

function UsersWorkspace({
  description,
  roleCode,
  title,
}: {
  description: string;
  roleCode?: string;
  title: string;
}): React.JSX.Element {
  const query = useAdminQuery<UserRecord[]>(
    `users-${roleCode ?? "all"}`,
    roleCode ? `/users?roleCode=${roleCode}` : "/users",
  );

  return (
    <ListWorkspace
      title={title}
      description={description}
      query={query}
      columns={[
        { id: "name", header: "Name" },
        { id: "email", header: "Email" },
        { id: "phone", header: "Phone", hideOnMobile: true },
        { id: "role", header: "Role" },
        { id: "status", header: "Status" },
        { id: "joined", header: "Joined", hideOnMobile: true },
      ]}
      toRows={(users) =>
        users.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status.replaceAll("_", " "),
          joined: formatDateTime(user.createdAt),
        }))
      }
      emptyDescription="No accounts match."
    />
  );
}

type Row = Record<string, unknown> & { id: string };

function ListWorkspace<T>({
  columns,
  description,
  emptyDescription,
  query,
  title,
  toRows,
}: {
  columns: DataTableColumn<Row>[];
  description: string;
  emptyDescription: string;
  query: UseQueryResult<T>;
  title: string;
  toRows: (data: T) => Row[];
}): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="Admin" title={title} description={description} />
      <QueryState query={query}>
        {(data) => (
          <SimpleTable
            bare
            rows={toRows(data)}
            columns={columns}
            emptyDescription={emptyDescription}
          />
        )}
      </QueryState>
    </div>
  );
}

function QueryState<T>({
  children,
  query,
}: {
  children: (data: T) => React.ReactNode;
  query: UseQueryResult<T>;
}): React.JSX.Element {
  if (query.isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }
  if (query.isError || query.data === undefined) {
    return <ErrorNotice error={query.error} onRetry={() => void query.refetch()} />;
  }

  return <>{children(query.data)}</>;
}

function ErrorNotice({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <EmptyState
      title="Could not load"
      description={error instanceof Error ? error.message : "The API did not respond."}
      actionLabel="Retry"
      onAction={onRetry}
    />
  );
}

function SimpleTable<TRow extends Row>({
  bare = false,
  columns,
  description,
  emptyDescription,
  rows,
  title,
}: {
  bare?: boolean;
  columns: DataTableColumn<TRow>[];
  description?: string;
  emptyDescription: string;
  rows: TRow[];
  title?: string;
}): React.JSX.Element {
  const table = (
    <DataTable
      columns={columns}
      data={rows}
      rowId={(row) => row.id}
      pageSize={10}
      selectable={false}
      emptyTitle="Nothing here yet"
      emptyDescription={emptyDescription}
    />
  );

  if (bare) {
    return table;
  }

  return (
    <Card>
      <CardHeader>
        {title ? <CardTitle>{title}</CardTitle> : null}
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{table}</CardContent>
    </Card>
  );
}

function ActivityTable({
  rows,
  title,
}: {
  rows: Array<Row & { actor: string; action: string; entity: string; ip: string; when: string }>;
  title: string;
}): React.JSX.Element {
  return (
    <SimpleTable
      title={title}
      rows={rows}
      columns={[
        { id: "actor", header: "Actor" },
        { id: "action", header: "Action" },
        { id: "entity", header: "Entity", hideOnMobile: true },
        { id: "ip", header: "IP", hideOnMobile: true },
        { id: "when", header: "When" },
      ]}
      emptyDescription="No activity has been recorded yet."
    />
  );
}

function MetricCard({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      </CardHeader>
    </Card>
  );
}

function ChartCard({
  metric = "bookings",
  points,
  title,
}: {
  metric?: "bookings" | "revenue";
  points: AdminChartPoint[];
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {points.some((point) => point[metric] > 0) ? (
          <AnalyticsChart
            type="bar"
            data={points.map((point) => ({ label: point.label, value: point[metric] }))}
          />
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nothing recorded in this period.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function HealthCard({ components }: { components: AdminSystemHealthRecord[] }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Configuration checks, run on each request.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {components.map((component) => (
          <div
            key={component.component}
            className="flex items-start justify-between gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800"
          >
            <div>
              <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">
                {component.component}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{component.message}</p>
            </div>
            <StatusChip tone={healthTone(component.status)}>{component.status}</StatusChip>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QueueCard({ queue }: { queue: AdminQueueStatusRecord }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{queue.name}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Detail label="Queued" value={String(queue.queued)} />
        <Detail label="Sent" value={String(queue.sent)} />
        <Detail label="Failed" value={String(queue.failed)} />
        <Detail label="Retrying" value={String(queue.retryScheduled)} />
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-xs uppercase tracking-normal text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-gray-950 dark:text-gray-50">{value || "—"}</p>
    </div>
  );
}

function StatusNote({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <p className="rounded-md border border-gold-100 bg-gold-50 px-3 py-2 text-sm text-brand-900 dark:border-brand-900 dark:bg-gold-500/10 dark:text-gold-100">
      {children}
    </p>
  );
}

function toBookingRow(record: AdminBookingRecord): BookingRow {
  const { booking } = record;

  return {
    id: booking.bookingId,
    reference: booking.bookingReference,
    pnr: booking.pnr ?? "",
    customer: record.customerName,
    agent: record.agentName ?? "",
    route: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
    operator: booking.trip.operatorName,
    journeyDate: formatDate(booking.trip.departureTime),
    status: booking.status,
    amount: formatInr(booking.fare.grandTotal.amount),
  };
}

function statusTone(status: string): Tone {
  if (["CONFIRMED", "TICKET_GENERATED", "UPLOADED"].includes(status)) {
    return "success";
  }
  if (["CANCELLATION_REQUESTED", "REFUND_PENDING", "SEAT_HELD"].includes(status)) {
    return "warning";
  }
  if (["CANCELLED", "FAILED", "EXPIRED"].includes(status)) {
    return "danger";
  }

  return "neutral";
}

function healthTone(status: AdminSystemHealthRecord["status"]): Tone {
  if (status === "HEALTHY") {
    return "success";
  }
  if (status === "DEGRADED") {
    return "warning";
  }

  return status === "DOWN" ? "danger" : "neutral";
}

function formatInr(amount: number): string {
  return `INR ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(date);
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
        timeZone: "Asia/Kolkata",
      }).format(date);
}
