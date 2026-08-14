"use client";

import {
  Bell,
  Bookmark,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileBarChart,
  LifeBuoy,
  MapPin,
  MessageSquareText,
  Percent,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AnalyticsChart,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  FadeIn,
  Progress,
  SlideUp,
  StatisticCard,
  StatusChip,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Timeline,
  type DataTableColumn,
  type StatisticCardProps,
  type TimelineItem,
} from "@vnbus/ui";

import { SearchPanel } from "./search-panel";
import { PageHeader } from "./page-header";
import { useBookingStore } from "../lib/booking-store";

const demandData = [
  { label: "Mon", value: 218, secondary: 164 },
  { label: "Tue", value: 246, secondary: 182 },
  { label: "Wed", value: 294, secondary: 204 },
  { label: "Thu", value: 338, secondary: 236 },
  { label: "Fri", value: 412, secondary: 278 },
  { label: "Sat", value: 476, secondary: 318 },
  { label: "Sun", value: 392, secondary: 286 },
];

const routeData = [
  { label: "BLR-HYD", value: 384 },
  { label: "MAA-CBE", value: 248 },
  { label: "PUNE-GOA", value: 192 },
  { label: "DEL-JAI", value: 168 },
  { label: "MUM-PUNE", value: 146 },
];

const bookingRows = [
  {
    id: "b1",
    reference: "VNB-00010294",
    route: "Bengaluru to Hyderabad",
    date: "20 Aug 2026",
    status: "Confirmed",
    channel: "Customer",
    amount: "INR 1,450",
  },
  {
    id: "b2",
    reference: "VNB-00010201",
    route: "Chennai to Coimbatore",
    date: "12 Aug 2026",
    status: "Pending",
    channel: "Agent",
    amount: "INR 980",
  },
  {
    id: "b3",
    reference: "VNB-00010188",
    route: "Pune to Goa",
    date: "15 Aug 2026",
    status: "Confirmed",
    channel: "Counter",
    amount: "INR 1,220",
  },
  {
    id: "b4",
    reference: "VNB-00010164",
    route: "Delhi to Jaipur",
    date: "18 Aug 2026",
    status: "Rescheduled",
    channel: "Agent",
    amount: "INR 740",
  },
] satisfies BookingRow[];

const adminRows = [
  {
    id: "u1",
    name: "Aarav Mehta",
    role: "Customer",
    status: "Active",
    email: "aarav@example.com",
    joined: "06 Aug 2026",
  },
  {
    id: "u2",
    name: "Nexus Koramangala",
    role: "Travel Agent",
    status: "Review",
    email: "agent.koramangala@example.com",
    joined: "05 Aug 2026",
  },
  {
    id: "u3",
    name: "Priya Shah",
    role: "Admin",
    status: "Active",
    email: "priya@example.com",
    joined: "02 Aug 2026",
  },
  {
    id: "u4",
    name: "Gateway Travels",
    role: "Travel Agent",
    status: "Active",
    email: "ops@gateway.example",
    joined: "01 Aug 2026",
  },
] satisfies AdminRow[];

const customerNotifications = [
  "Boarding pass for VNB-00010294 is ready.",
  "Platform credit of INR 120 expires on 31 Aug 2026.",
  "Hyderabad route has 8 recommended departures tonight.",
];

const savedTrips = [
  ["Bengaluru", "Hyderabad", "Sleeper preference saved"],
  ["Chennai", "Coimbatore", "Window seat preference saved"],
  ["Mumbai", "Pune", "Morning departure preference saved"],
];

const recommendedRoutes = [
  { route: "Bengaluru to Hyderabad", fare: "from INR 1,090", seats: "18 seats" },
  { route: "Chennai to Coimbatore", fare: "from INR 780", seats: "26 seats" },
  { route: "Pune to Goa", fare: "from INR 1,120", seats: "9 seats" },
];

const agentCustomerRows = [
  {
    id: "c1",
    name: "Ramesh Kumar",
    route: "Bengaluru to Hyderabad",
    status: "Confirmed",
    value: "INR 4,350",
  },
  {
    id: "c2",
    name: "Isha Rao",
    route: "Chennai to Coimbatore",
    status: "Pending",
    value: "INR 1,960",
  },
  {
    id: "c3",
    name: "Nisha Travels",
    route: "Pune to Goa",
    status: "Confirmed",
    value: "INR 12,200",
  },
] satisfies AgentCustomerRow[];

const auditTimeline: TimelineItem[] = [
  {
    id: "a1",
    title: "Offer schedule updated",
    description: "Monsoon route offer moved to review.",
    timestamp: "09:24",
    tone: "info",
  },
  {
    id: "a2",
    title: "Agent approval completed",
    description: "Gateway Travels activated by platform admin.",
    timestamp: "08:42",
    tone: "success",
  },
  {
    id: "a3",
    title: "Coupon limit alert",
    description: "BLRHYD10 reached 82 percent of its daily cap.",
    timestamp: "07:58",
    tone: "warning",
  },
];

type BookingRow = Record<string, unknown> & {
  id: string;
  reference: string;
  route: string;
  date: string;
  status: "Confirmed" | "Pending" | "Rescheduled";
  channel: string;
  amount: string;
};

type AdminRow = Record<string, unknown> & {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Review";
  email: string;
  joined: string;
};

type AgentCustomerRow = Record<string, unknown> & {
  id: string;
  name: string;
  route: string;
  status: "Confirmed" | "Pending";
  value: string;
};

const statusTone = {
  Active: "success",
  Confirmed: "success",
  Pending: "warning",
  Rescheduled: "info",
  Review: "warning",
} as const;

const bookingColumns: DataTableColumn<BookingRow>[] = [
  { id: "reference", header: "Reference", sortable: true },
  { id: "route", header: "Route", sortable: true },
  { id: "date", header: "Date", sortable: true, hideOnMobile: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusChip tone={statusTone[row.status]}>{row.status}</StatusChip>,
  },
  { id: "channel", header: "Channel", sortable: true, hideOnMobile: true },
  { id: "amount", header: "Amount", sortable: true, align: "right" },
];

const adminColumns: DataTableColumn<AdminRow>[] = [
  { id: "name", header: "Name", sortable: true },
  { id: "role", header: "Role", sortable: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusChip tone={statusTone[row.status]}>{row.status}</StatusChip>,
  },
  { id: "email", header: "Email", sortable: true, hideOnMobile: true },
  { id: "joined", header: "Joined", sortable: true, hideOnMobile: true },
];

const agentCustomerColumns: DataTableColumn<AgentCustomerRow>[] = [
  { id: "name", header: "Customer", sortable: true },
  { id: "route", header: "Route", sortable: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusChip tone={statusTone[row.status]}>{row.status}</StatusChip>,
  },
  { id: "value", header: "Value", sortable: true, align: "right" },
];

export function OperationsDashboard(): React.JSX.Element {
  return (
    <FadeIn>
      <PageHeader
        eyebrow="Workspace"
        title="Operations Overview"
        description="A consolidated UI for booking demand, route performance, supplier readiness, and support attention."
        actionHref="/search"
        actionLabel="Search buses"
      />
      <MetricGrid
        metrics={[
          {
            label: "Today bookings",
            value: "184",
            change: "12% from yesterday",
            trend: "up",
            icon: Ticket,
          },
          {
            label: "Gross sales",
            value: "INR 18.4L",
            change: "8% weekly lift",
            trend: "up",
            icon: CircleDollarSign,
          },
          {
            label: "Open tickets",
            value: "31",
            change: "5 urgent",
            trend: "neutral",
            icon: LifeBuoy,
          },
          {
            label: "Supplier readiness",
            value: "5/5",
            change: "All mapped",
            trend: "up",
            icon: ShieldCheck,
          },
        ]}
      />
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Booking Demand</CardTitle>
            <CardDescription>
              Daily searches compared with confirmed booking volume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={demandData} type="line" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operational Attention</CardTitle>
            <CardDescription>Live platform signals for the operations team.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Alert variant="warning">
              <AlertTitle>Payment retry queue</AlertTitle>
              <AlertDescription>14 pending payments need automated retry review.</AlertDescription>
            </Alert>
            <Timeline items={auditTimeline} />
          </CardContent>
        </Card>
      </section>
      <section className="mt-6">
        <BookingsPanel
          title="Recent Bookings"
          description="Dummy booking rows for operational review."
        />
      </section>
    </FadeIn>
  );
}

export function CustomerDashboard(): React.JSX.Element {
  const history = useBookingStore((state) => state.history);
  const notifications = useBookingStore((state) => state.notifications);
  const upcomingTrips = history.filter(
    (booking) =>
      Date.parse(booking.trip.departureTime) >= Date.now() &&
      !["CANCELLED", "EXPIRED", "FAILED"].includes(booking.status),
  );
  const unreadNotifications = notifications.filter(
    (notification) => notification.readStatus === "UNREAD",
  );

  return (
    <FadeIn>
      <PageHeader
        eyebrow="Customer"
        title="Customer Dashboard"
        description="Upcoming trips, recent bookings, saved journeys, notifications, and a profile summary for direct travellers."
        actionHref="/search"
        actionLabel="Search buses"
      />
      <MetricGrid
        metrics={[
          {
            label: "Upcoming trips",
            value: `${upcomingTrips.length || 2}`,
            change: upcomingTrips[0]?.bookingReference ?? "1 trip this week",
            trend: "up",
            icon: CalendarClock,
          },
          {
            label: "Recent bookings",
            value: `${history.length || 8}`,
            change: `${upcomingTrips.length || 2} active`,
            trend: "neutral",
            icon: ClipboardList,
          },
          {
            label: "Saved trips",
            value: "5",
            change: "3 routes watched",
            trend: "up",
            icon: Bookmark,
          },
          {
            label: "Notifications",
            value: `${notifications.length || 6}`,
            change: `${unreadNotifications.length || 2} unread`,
            trend: "neutral",
            icon: Bell,
          },
        ]}
      />
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3">
          <SectionHeading
            title="Quick Search"
            description="Reusable search UI for route discovery."
          />
          <SearchPanel compact />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
            <CardDescription>Journey reminders and ticket readiness.</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline
              items={
                upcomingTrips.length
                  ? upcomingTrips.slice(0, 4).map((booking) => ({
                      id: booking.bookingId,
                      title: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
                      description: `${booking.trip.busType} departs at ${formatPanelTime(
                        booking.trip.departureTime,
                      )}.`,
                      timestamp: formatPanelDate(booking.trip.departureTime),
                      tone: "success" as const,
                    }))
                  : [
                      {
                        id: "t1",
                        title: "Bengaluru to Hyderabad",
                        description: "Sleeper coach departs 20 Aug 2026 at 21:45.",
                        timestamp: "20 Aug",
                        tone: "success",
                      },
                      {
                        id: "t2",
                        title: "Chennai to Coimbatore",
                        description: "Payment confirmation pending for the saved booking.",
                        timestamp: "12 Aug",
                        tone: "warning",
                      },
                    ]
              }
            />
          </CardContent>
        </Card>
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <BookingsPanel title="Recent Bookings" description="Recent customer booking references." />
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Important customer workspace messages.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(notifications.length
              ? notifications.slice(0, 4).map((notification) => notification.body)
              : customerNotifications
            ).map((notification) => (
              <div
                key={notification}
                className="flex gap-3 rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800"
              >
                <Bell
                  className="mt-0.5 h-4 w-4 text-gold-600 dark:text-gold-200"
                  aria-hidden="true"
                />
                <span className="text-gray-700 dark:text-gray-300">{notification}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <RoutesCard title="Recommended Routes" routes={recommendedRoutes} icon={Sparkles} />
        <SavedTripsCard />
        <ProfileSummaryCard />
      </section>
    </FadeIn>
  );
}

export function TravelAgentDashboard(): React.JSX.Element {
  return (
    <FadeIn>
      <PageHeader
        eyebrow="Travel Agent"
        title="Agent Dashboard"
        description="Quick booking UI, managed customer activity, reporting previews, and agency performance statistics."
        actionHref="/search"
        actionLabel="Quick booking"
      />
      <MetricGrid
        metrics={[
          {
            label: "Agent bookings",
            value: "328",
            change: "9% month growth",
            trend: "up",
            icon: Ticket,
          },
          { label: "Managed customers", value: "84", change: "6 new", trend: "up", icon: Users },
          {
            label: "Net sales",
            value: "INR 7.8L",
            change: "11% uplift",
            trend: "up",
            icon: CreditCard,
          },
          {
            label: "Reports ready",
            value: "12",
            change: "3 new exports",
            trend: "neutral",
            icon: FileBarChart,
          },
        ]}
      />
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3">
          <SectionHeading
            title="Quick Booking"
            description="Search-first agent booking surface with dummy data."
          />
          <SearchPanel compact />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Booking value by day for the current agent workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={demandData} type="area" />
          </CardContent>
        </Card>
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Managed travellers and agency accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={agentCustomerColumns}
              data={agentCustomerRows}
              rowId={(row) => row.id}
              pageSize={5}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Prepared exports and settlement status.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ProgressBlock label="Commission settlement" value={78} />
            <ProgressBlock label="KYC completion" value={92} />
            <ProgressBlock label="Monthly booking target" value={64} />
          </CardContent>
        </Card>
      </section>
      <section className="mt-6">
        <BookingsPanel
          title="Recent Bookings"
          description="Recent bookings created from the agent workspace."
        />
      </section>
    </FadeIn>
  );
}

export function AdminDashboard(): React.JSX.Element {
  return (
    <FadeIn>
      <PageHeader
        eyebrow="Admin"
        title="Admin Dashboard"
        description="Platform governance across users, agents, bookings, coupons, offers, CMS, analytics, reports, audit logs, settings, and profile."
      />
      <MetricGrid
        metrics={[
          { label: "Active users", value: "12,408", change: "7% growth", trend: "up", icon: Users },
          {
            label: "Bookings",
            value: "2,941",
            change: "14% monthly lift",
            trend: "up",
            icon: ClipboardList,
          },
          {
            label: "Coupons live",
            value: "38",
            change: "4 scheduled",
            trend: "neutral",
            icon: Percent,
          },
          {
            label: "Audit events",
            value: "81k",
            change: "Healthy stream",
            trend: "up",
            icon: ShieldCheck,
          },
        ]}
      />
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Booking demand and conversion signals.</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart data={demandData} type="line" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Route Mix</CardTitle>
                <CardDescription>Popular route volume across the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart data={routeData} type="bar" />
              </CardContent>
            </Card>
          </section>
        </TabsContent>
        <TabsContent value="users">
          <AdminUsersPanel />
        </TabsContent>
        <TabsContent value="commercial">
          <section className="grid gap-6 lg:grid-cols-3">
            <CommercialCard
              title="Coupons"
              description="38 active campaigns"
              icon={Percent}
              progressLabel="Daily cap usage"
              progress={82}
            />
            <CommercialCard
              title="Offers"
              description="12 scheduled route offers"
              icon={CircleDollarSign}
              progressLabel="Approval readiness"
              progress={68}
            />
            <CommercialCard
              title="CMS"
              description="9 pending content updates"
              icon={MessageSquareText}
              progressLabel="Publish checklist"
              progress={74}
            />
          </section>
        </TabsContent>
        <TabsContent value="governance">
          <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Platform controls ready for admin configuration.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <ProgressBlock label="Profile completion" value={96} />
                <ProgressBlock label="Notification policy" value={88} />
                <ProgressBlock label="Security checklist" value={91} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  Recent governance activity across platform modules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Timeline items={auditTimeline} />
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
      <section className="mt-6">
        <BookingsPanel
          title="Bookings"
          description="Admin booking visibility with filtering and column controls."
        />
      </section>
    </FadeIn>
  );
}

function MetricGrid({ metrics }: { metrics: StatisticCardProps[] }): React.JSX.Element {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <SlideUp key={metric.label} transition={{ delay: index * 0.03, duration: 0.22 }}>
          <StatisticCard {...metric} />
        </SlideUp>
      ))}
    </section>
  );
}

function BookingsPanel({
  description,
  title,
}: {
  description: string;
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={bookingColumns}
          data={bookingRows}
          rowId={(row) => row.id}
          pageSize={4}
          emptyTitle="No bookings"
          emptyDescription="Booking records will appear here as workflows create them."
        />
      </CardContent>
    </Card>
  );
}

function SectionHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}): React.JSX.Element {
  return (
    <div>
      <h2 className="text-base font-semibold tracking-normal text-gray-950 dark:text-gray-50">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function RoutesCard({
  icon: Icon,
  routes,
  title,
}: {
  icon: LucideIcon;
  routes: Array<{ route: string; fare: string; seats: string }>;
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Relevant route ideas based on journey history.</CardDescription>
        </div>
        <Icon className="h-5 w-5 text-gold-600 dark:text-gold-200" aria-hidden="true" />
      </CardHeader>
      <CardContent className="grid gap-3">
        {routes.map((route) => (
          <div
            key={route.route}
            className="rounded-md border border-gray-200 p-3 dark:border-gray-800"
          >
            <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">{route.route}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="default">{route.fare}</Badge>
              <Badge variant="neutral">{route.seats}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SavedTripsCard(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Trips</CardTitle>
        <CardDescription>Traveller preferences retained in UI state mockups.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {savedTrips.map(([from, to, preference]) => (
          <div
            key={`${from}-${to}`}
            className="flex gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900"
          >
            <MapPin
              className="mt-0.5 h-4 w-4 text-gold-600 dark:text-gold-200"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">
                {from} to {to}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{preference}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProfileSummaryCard(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Summary</CardTitle>
        <CardDescription>Customer identity and preference snapshot.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-200">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">
              Vriddhi Traveller
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gold customer profile</p>
          </div>
        </div>
        <ProgressBlock label="Profile completion" value={86} />
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Email verified</Badge>
          <Badge variant="default">2 saved passengers</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminUsersPanel(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users and Agents</CardTitle>
        <CardDescription>
          Account management table with sorting, search, selection, and responsive columns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={adminColumns} data={adminRows} rowId={(row) => row.id} pageSize={5} />
      </CardContent>
    </Card>
  );
}

function CommercialCard({
  description,
  icon: Icon,
  progress,
  progressLabel,
  title,
}: {
  description: string;
  icon: LucideIcon;
  progress: number;
  progressLabel: string;
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-200">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent>
        <ProgressBlock label={progressLabel} value={progress} />
      </CardContent>
    </Card>
  );
}

function ProgressBlock({ label, value }: { label: string; value: number }): React.JSX.Element {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function formatPanelDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatPanelTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}
