"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Download,
  Headphones,
  IndianRupee,
  MapPinned,
  MessageSquareText,
  Phone,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  Input,
  Progress,
  StatusChip,
  Textarea,
  Timeline,
  type DataTableColumn,
  type TimelineItem,
} from "@vnbus/ui";

const trackingTimeline: TimelineItem[] = [
  {
    id: "tracking-1",
    title: "Booking verified",
    description: "Ticket and passenger details are matched with the booking record.",
    timestamp: "6:00 PM",
    tone: "success",
  },
  {
    id: "tracking-2",
    title: "Boarding reminder ready",
    description: "SMS, WhatsApp, email, and in-app reminder templates are queued as sample events.",
    timestamp: "6:15 PM",
    tone: "info",
  },
  {
    id: "tracking-3",
    title: "Vehicle assignment placeholder",
    description: "The live GPS provider can be connected here after supplier API onboarding.",
    timestamp: "6:40 PM",
    tone: "warning",
  },
  {
    id: "tracking-4",
    title: "ETA preview",
    description: "Estimated arrival is shown from scheduled route timing, not real GPS data.",
    timestamp: "8:45 PM",
    tone: "info",
  },
];

type SupportTicketRow = Record<string, unknown> & {
  id: string;
  topic: string;
  customer: string;
  status: "Open" | "In Review" | "Resolved";
  priority: "High" | "Medium" | "Low";
  channel: string;
  age: string;
};

type RefundRow = Record<string, unknown> & {
  id: string;
  booking: string;
  customer: string;
  amount: string;
  status: "Pending" | "Queued" | "Processed";
  mode: string;
  eta: string;
};

type TrustRow = Record<string, unknown> & {
  id: string;
  operator: string;
  rating: string;
  punctuality: string;
  support: string;
  tag: string;
};

type TravellerRow = Record<string, unknown> & {
  id: string;
  name: string;
  age: string;
  gender: string;
  phone: string;
  preference: string;
};

const supportTickets = [
  {
    id: "SUP-1029",
    topic: "Invoice download",
    customer: "Aarav Mehta",
    status: "Open",
    priority: "High",
    channel: "WhatsApp",
    age: "18 min",
  },
  {
    id: "SUP-1024",
    topic: "Boarding point change",
    customer: "Priya Nair",
    status: "In Review",
    priority: "Medium",
    channel: "Email",
    age: "42 min",
  },
  {
    id: "SUP-1018",
    topic: "Refund status",
    customer: "Rahul Shah",
    status: "Resolved",
    priority: "Low",
    channel: "In-app",
    age: "2 hr",
  },
] satisfies SupportTicketRow[];

const refundRows = [
  {
    id: "RF-9081",
    booking: "VNB-00010294",
    customer: "Aarav Mehta",
    amount: "INR 1,450",
    status: "Pending",
    mode: "Original mode",
    eta: "2-5 days",
  },
  {
    id: "RF-9074",
    booking: "VNB-00010271",
    customer: "Nisha Rao",
    amount: "INR 780",
    status: "Queued",
    mode: "Wallet credit",
    eta: "Instant",
  },
  {
    id: "RF-9068",
    booking: "VNB-00010242",
    customer: "Gateway Travels",
    amount: "INR 4,350",
    status: "Processed",
    mode: "UPI",
    eta: "Completed",
  },
] satisfies RefundRow[];

const trustRows = [
  {
    id: "TR-01",
    operator: "Vriddhi Express",
    rating: "4.8",
    punctuality: "94%",
    support: "99%",
    tag: "Premium",
  },
  {
    id: "TR-02",
    operator: "Nexus Sleeper",
    rating: "4.6",
    punctuality: "91%",
    support: "96%",
    tag: "Women friendly",
  },
  {
    id: "TR-03",
    operator: "GreenLine Express",
    rating: "4.5",
    punctuality: "89%",
    support: "95%",
    tag: "Clean coach",
  },
] satisfies TrustRow[];

const travellers = [
  {
    id: "traveller-1",
    name: "Aarav Mehta",
    age: "32",
    gender: "Male",
    phone: "+91 98765 43210",
    preference: "Lower sleeper",
  },
  {
    id: "traveller-2",
    name: "Priya Mehta",
    age: "29",
    gender: "Female",
    phone: "+91 98765 43211",
    preference: "Window seat",
  },
  {
    id: "traveller-3",
    name: "Family traveller",
    age: "58",
    gender: "Other",
    phone: "+91 98765 43212",
    preference: "Near boarding door",
  },
] satisfies TravellerRow[];

const savedRoutes = [
  { route: "Bengaluru to Hyderabad", fare: "INR 1,090", watch: "Night sleeper" },
  { route: "Chennai to Coimbatore", fare: "INR 780", watch: "Morning AC" },
  { route: "Pune to Goa", fare: "INR 1,120", watch: "Weekend fare" },
];

const rewardBenefits: Array<[string, string]> = [
  ["Weekend saver", "INR 120 route credit for weekend bookings."],
  ["Referral reward", "Earn INR 100 credit after a friend completes one trip."],
  ["Invoice-ready booking", "Auto invoice generation stays visible after confirmation."],
];

const channelRows: Array<[string, string]> = [
  ["Email", "Ticket, invoice, cancellation updates"],
  ["SMS", "OTP, boarding reminders, delay notices"],
  ["WhatsApp", "Ticket link, support replies, tracking link"],
  ["In-app", "Dashboard alerts and booking timeline"],
];

const supportColumns: DataTableColumn<SupportTicketRow>[] = [
  { id: "id", header: "Ticket", sortable: true },
  { id: "topic", header: "Topic", sortable: true },
  { id: "customer", header: "Customer", sortable: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusChip tone={supportTone[row.status]}>{row.status}</StatusChip>,
  },
  { id: "priority", header: "Priority", sortable: true, hideOnMobile: true },
  { id: "channel", header: "Channel", sortable: true, hideOnMobile: true },
  { id: "age", header: "Age", sortable: true, align: "right" },
];

const refundColumns: DataTableColumn<RefundRow>[] = [
  { id: "id", header: "Refund", sortable: true },
  { id: "booking", header: "Booking", sortable: true },
  { id: "customer", header: "Customer", sortable: true },
  { id: "amount", header: "Amount", sortable: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusChip tone={refundTone[row.status]}>{row.status}</StatusChip>,
  },
  { id: "mode", header: "Mode", sortable: true, hideOnMobile: true },
  { id: "eta", header: "ETA", sortable: true, align: "right" },
];

const trustColumns: DataTableColumn<TrustRow>[] = [
  { id: "operator", header: "Operator", sortable: true },
  { id: "rating", header: "Rating", sortable: true },
  { id: "punctuality", header: "Punctuality", sortable: true },
  { id: "support", header: "Support", sortable: true, hideOnMobile: true },
  {
    id: "tag",
    header: "Trust tag",
    sortable: true,
    cell: (row) => <Badge variant="default">{row.tag}</Badge>,
  },
];

const travellerColumns: DataTableColumn<TravellerRow>[] = [
  { id: "name", header: "Traveller", sortable: true },
  { id: "age", header: "Age", sortable: true },
  { id: "gender", header: "Gender", sortable: true },
  { id: "phone", header: "Phone", sortable: true, hideOnMobile: true },
  { id: "preference", header: "Preference", sortable: true },
];

const supportTone = {
  Open: "warning",
  "In Review": "info",
  Resolved: "success",
} as const;

const refundTone = {
  Pending: "warning",
  Queued: "info",
  Processed: "success",
} as const;

export function PublicTrackingCenter(): React.JSX.Element {
  const [bookingId, setBookingId] = React.useState("VNB-00010294");
  const [contact, setContact] = React.useState("9876543210");

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <Badge variant="default" className="w-max">
              Live tracking preview
            </Badge>
            <CardTitle className="text-2xl">Track your bus</CardTitle>
            <CardDescription>
              Search with booking ID and mobile number. This shows scheduled-route tracking until
              live GPS is connected.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Booking ID">
              <Input value={bookingId} onChange={(event) => setBookingId(event.target.value)} />
            </Field>
            <Field label="Mobile or email">
              <Input value={contact} onChange={(event) => setContact(event.target.value)} />
            </Field>
            <Button type="button">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Show tracking preview
            </Button>
            <Alert>
              <AlertTitle>Ready for live GPS integration</AlertTitle>
              <AlertDescription>
                The UI, timeline, notification touchpoints, and customer lookup are prepared. Real
                vehicle coordinates can be plugged in later.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <MockRouteMap bookingId={bookingId} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Journey timeline</CardTitle>
            <CardDescription>
              Milestone events that mirror a live journey experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline items={trackingTimeline} />
          </CardContent>
        </Card>
        <NotificationChannelCard />
      </section>
    </section>
  );
}

export function CustomerRewardsCenter(): React.JSX.Element {
  return (
    <CustomerFeatureLayout
      eyebrow="Wallet"
      title="Wallet and Rewards"
      description="Wallet, credits, referral rewards, and trip benefits for customer retention."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard icon={WalletCards} label="Wallet credit" value="INR 620" note="Balance" />
        <MetricCard icon={Sparkles} label="Reward points" value="2,840" note="Gold tier" />
        <MetricCard icon={IndianRupee} label="Savings" value="INR 1,280" note="This month" />
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Rewards progress</CardTitle>
            <CardDescription>
              Customer loyalty status without a real wallet provider.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <ProgressBlock label="Gold tier progress" value={72} />
            <ProgressBlock label="Referral bonus readiness" value={48} />
            <ProgressBlock label="Route offer usage" value={64} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available benefits</CardTitle>
            <CardDescription>
              Offer-like benefits customers can see before checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {rewardBenefits.map(([title, description]) => (
              <FeatureRow key={title} icon={Sparkles} title={title} description={description} />
            ))}
          </CardContent>
        </Card>
      </section>
    </CustomerFeatureLayout>
  );
}

export function CustomerSupportCenter(): React.JSX.Element {
  return (
    <CustomerFeatureLayout
      eyebrow="Support"
      title="Help and Support"
      description="Clean support surface for ticket, invoice, refund, boarding point, and booking questions."
    >
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create support request</CardTitle>
            <CardDescription>
              Stored as a support ticket until helpdesk integration.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Booking reference">
              <Input placeholder="VNB-00010294" />
            </Field>
            <Field label="Issue">
              <Input placeholder="Ticket, invoice, refund, boarding point..." />
            </Field>
            <Field label="Message">
              <Textarea placeholder="Explain what needs help." />
            </Field>
            <Button type="button">
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              Create support ticket
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your support tickets</CardTitle>
            <CardDescription>Tickets you have raised appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {/*
              Previously this listed fabricated tickets for invented customers
              (Aarav Mehta, Priya Nair...), shown identically to every visitor.
              Until tickets are persisted per user there is nothing genuine to
              show, so show nothing rather than someone else's data.
            */}
            <EmptyState
              title="No support tickets yet"
              description="Raise a ticket above and it will appear here."
            />
          </CardContent>
        </Card>
      </section>
      <SupportContactGrid />
    </CustomerFeatureLayout>
  );
}

export function CustomerTravellersCenter(): React.JSX.Element {
  return (
    <CustomerFeatureLayout
      eyebrow="Travellers"
      title="Saved Travellers"
      description="Traveller profiles, seat preferences, and quick booking presets for repeat users."
    >
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Traveller profiles</CardTitle>
            <CardDescription>Mock saved passenger list for faster future booking.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={travellerColumns}
              data={travellers}
              rowId={(row) => row.id}
              pageSize={5}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saved routes</CardTitle>
            <CardDescription>Quick rebooking route shortcuts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {savedRoutes.map((route) => (
              <div
                key={route.route}
                className="rounded-lg border border-gold-100 bg-pearl-50 p-4 dark:border-brand-800 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-950 dark:text-white">{route.route}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{route.watch}</p>
                  </div>
                  <Badge variant="default">{route.fare}</Badge>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/search">Book again</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </CustomerFeatureLayout>
  );
}

export function CustomerTrackingCenter(): React.JSX.Element {
  return (
    <CustomerFeatureLayout
      eyebrow="Tracking"
      title="Trip Tracking"
      description="Live-tracking workspace for confirmed bookings and scheduled reminders."
    >
      <PublicTrackingCenter />
    </CustomerFeatureLayout>
  );
}

export function AdminSupportOperations(): React.JSX.Element {
  return (
    <AdminFeatureLayout
      eyebrow="Operations"
      title="Support Operations"
      description="Helpdesk queue, customer channels, and response readiness without a real support provider."
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard icon={Headphones} label="Open tickets" value="31" note="5 high priority" />
        <MetricCard icon={Clock3} label="Avg response" value="12m" note="SLA" />
        <MetricCard icon={MessageSquareText} label="Channels" value="4" note="Email/SMS/WA/App" />
        <MetricCard icon={CheckCircle2} label="Resolved today" value="84" note="Sample data" />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Support ticket queue</CardTitle>
          <CardDescription>
            Admin-facing ticket list ready for a helpdesk integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={supportColumns} data={supportTickets} rowId={(row) => row.id} />
        </CardContent>
      </Card>
      <SupportContactGrid />
    </AdminFeatureLayout>
  );
}

export function AdminRefundOperations(): React.JSX.Element {
  return (
    <AdminFeatureLayout
      eyebrow="Refunds"
      title="Cancellation and Refund Desk"
      description="Refund queue with modes, ETA, and operator-policy readiness."
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard icon={RotateCcw} label="Pending refunds" value="18" note="Queue" />
        <MetricCard icon={WalletCards} label="Wallet credits" value="INR 42k" note="Pending" />
        <MetricCard icon={ReceiptText} label="Policy mapped" value="82%" note="By route" />
        <MetricCard icon={ShieldCheck} label="Audit ready" value="100%" note="Events tracked" />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Refund queue</CardTitle>
          <CardDescription>Refund tracking without moving real money.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={refundColumns} data={refundRows} rowId={(row) => row.id} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cancellation policy preview</CardTitle>
          <CardDescription>
            Rules shown to customers before payment in the mock flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <PolicyCard title="Before 24 hours" value="80% refund" />
          <PolicyCard title="Same day window" value="50% refund" />
          <PolicyCard title="After departure" value="No refund" />
        </CardContent>
      </Card>
    </AdminFeatureLayout>
  );
}

export function AdminTrustOperations(): React.JSX.Element {
  return (
    <AdminFeatureLayout
      eyebrow="Trust"
      title="Ratings and Trust Signals"
      description="Operator rating, punctuality, women-friendly labels, and premium-bus badges as controls."
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard icon={Star} label="Avg rating" value="4.6" note="Reviews" />
        <MetricCard icon={ShieldCheck} label="Premium buses" value="28" note="Tagged" />
        <MetricCard icon={UserRound} label="Women-friendly" value="41" note="Routes marked" />
        <MetricCard icon={Bell} label="Safety alerts" value="0" note="No open alerts" />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Operator trust table</CardTitle>
          <CardDescription>Admin controls that can later sync with real reviews.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={trustColumns} data={trustRows} rowId={(row) => row.id} />
        </CardContent>
      </Card>
      <section className="grid gap-4 md:grid-cols-3">
        <FeaturePanel
          icon={ShieldCheck}
          title="Premium badge"
          description="Highlight high-rated operators in search results."
        />
        <FeaturePanel
          icon={UserRound}
          title="Women traveller signal"
          description="Show women-friendly labels and gender-aware seat guidance."
        />
        <FeaturePanel
          icon={Star}
          title="Review quality"
          description="Prepare verified booking review flow without public submission yet."
        />
      </section>
    </AdminFeatureLayout>
  );
}

function CustomerFeatureLayout({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <div className="grid gap-6">
      <HeroHeader eyebrow={eyebrow} title={title} description={description} />
      {children}
    </div>
  );
}

function AdminFeatureLayout({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <div className="grid gap-6">
      <HeroHeader eyebrow={eyebrow} title={title} description={description} />
      {children}
    </div>
  );
}

function HeroHeader({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <section className="overflow-hidden rounded-lg border border-gold-100 bg-white/95 p-5 shadow-panel dark:border-brand-800 dark:bg-brand-950/80 sm:p-6">
      <Badge variant="default">{eyebrow}</Badge>
      <h1 className="mt-3 text-2xl font-semibold tracking-normal text-brand-950 dark:text-white sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </section>
  );
}

function MockRouteMap({ bookingId }: { bookingId: string }): React.JSX.Element {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Scheduled route preview</CardTitle>
        <CardDescription>{bookingId || "Booking"} · Bengaluru to Hyderabad</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-80 overflow-hidden rounded-lg border border-gold-100 bg-[linear-gradient(135deg,#f7faf6_0%,#fff8ea_55%,#f2faf6_100%)] p-5 dark:border-brand-800 dark:bg-[linear-gradient(135deg,#061a16_0%,#09251f_100%)]">
          <div className="absolute left-10 right-10 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold-200 dark:bg-gold-500/40" />
          <div className="relative grid min-h-64 grid-cols-3 items-center gap-4">
            <RouteStop label="Bengaluru" time="5:00 PM" active />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold-200 bg-white text-brand-800 shadow-premium dark:border-brand-700 dark:bg-brand-950 dark:text-gold-100">
              <MapPinned className="h-7 w-7" aria-hidden="true" />
            </div>
            <RouteStop label="Hyderabad" time="4:39 AM" />
          </div>
          <div className="grid gap-3 border-t border-gold-100 pt-4 text-sm dark:border-brand-800 sm:grid-cols-3">
            <span>
              <strong className="text-brand-950 dark:text-white">ETA:</strong> 4:39 AM
            </span>
            <span>
              <strong className="text-brand-950 dark:text-white">Status:</strong> Scheduled
            </span>
            <span>
              <strong className="text-brand-950 dark:text-white">Source:</strong> Simulated data
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RouteStop({
  active,
  label,
  time,
}: {
  active?: boolean;
  label: string;
  time: string;
}): React.JSX.Element {
  return (
    <div className="relative grid justify-items-center gap-2 text-center">
      <span
        className={[
          "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold shadow-sm",
          active
            ? "border-brand-700 bg-brand-700 text-white"
            : "border-gold-200 bg-white text-brand-800 dark:bg-brand-950 dark:text-gold-100",
        ].join(" ")}
      >
        {label.slice(0, 1)}
      </span>
      <span className="font-semibold text-brand-950 dark:text-white">{label}</span>
      <span className="text-sm text-gray-600 dark:text-gray-300">{time}</span>
    </div>
  );
}

function NotificationChannelCard(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification channels</CardTitle>
        <CardDescription>Customer messages prepared for each booking stage.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {channelRows.map(([channel, description]) => (
          <FeatureRow key={channel} icon={Bell} title={channel} description={description} />
        ))}
      </CardContent>
    </Card>
  );
}

function SupportContactGrid(): React.JSX.Element {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <FeaturePanel
        icon={Headphones}
        title="24/7 support desk"
        description="SLA cards for ticket, refund, and journey help."
      />
      <FeaturePanel
        icon={Phone}
        title="Call and WhatsApp"
        description="Phone and WhatsApp touchpoints are represented for later provider setup."
      />
      <FeaturePanel
        icon={Download}
        title="Ticket documents"
        description="Support flow includes ticket, invoice, and email history references."
      />
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  note: string;
  value: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-brand-950 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{note}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold-100 bg-gold-50 text-gold-700 shadow-sm dark:border-brand-800 dark:bg-gold-500/10 dark:text-gold-100">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function FeaturePanel({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardContent className="p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-100 bg-gold-50 text-gold-700 dark:border-brand-800 dark:bg-gold-500/10 dark:text-gold-100">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-semibold text-brand-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
      </CardContent>
    </Card>
  );
}

function FeatureRow({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
}): React.JSX.Element {
  return (
    <div className="flex gap-3 rounded-lg border border-gold-100 bg-white p-3 dark:border-brand-800 dark:bg-white/5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-100">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-brand-950 dark:text-white">{title}</span>
        <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">{description}</span>
      </span>
    </div>
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

function PolicyCard({ title, value }: { title: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-gold-100 bg-pearl-50 p-4 dark:border-brand-800 dark:bg-white/5">
      <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
      <p className="mt-2 text-xl font-semibold text-brand-950 dark:text-white">{value}</p>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}): React.JSX.Element {
  return (
    <label className="grid gap-2 text-sm font-semibold text-brand-900 dark:text-brand-100">
      {label}
      {children}
    </label>
  );
}
