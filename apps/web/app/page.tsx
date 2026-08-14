import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bus,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Headphones,
  MapPinned,
  Route,
  ShieldCheck,
  Smartphone,
  TicketCheck,
  UsersRound,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PublicLayout,
  SlideUp,
  StatusChip,
} from "@vnbus/ui";

import { SearchPanel } from "../components/search-panel";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const features = [
  {
    title: "Customer-ready journeys",
    description:
      "Search, passenger, ticket, profile, and notification surfaces share one interface language.",
    icon: TicketCheck,
  },
  {
    title: "Agent workspaces",
    description:
      "Travel agents get fast-search UI, managed customers, booking tables, and reporting previews.",
    icon: UsersRound,
  },
  {
    title: "Admin governance",
    description:
      "Users, agents, bookings, coupons, offers, CMS, analytics, reports, audit logs, and settings are mapped.",
    icon: ShieldCheck,
  },
];

const reasons = [
  [
    "Modular by milestone",
    "Each workflow grows from reusable packages instead of page-specific UI.",
  ],
  [
    "Dark-mode ready",
    "Tokens and classes are prepared across public, auth, dashboard, and error layouts.",
  ],
  [
    "Operational density",
    "Tables, charts, filters, badges, and state blocks support repeated back-office use.",
  ],
  [
    "Supplier-neutral",
    "The UI anticipates external bus inventory without binding to one supplier now.",
  ],
];

const steps = [
  {
    title: "Search",
    description: "Travellers or agents start with route, date, and passenger context.",
    icon: Route,
  },
  {
    title: "Review",
    description: "Results, seats, passengers, and confirmations stay visually consistent.",
    icon: CalendarCheck,
  },
  {
    title: "Operate",
    description: "Admin and support teams monitor demand, reports, and audit activity.",
    icon: BadgeCheck,
  },
];

const popularRoutes = [
  { route: "Bengaluru to Hyderabad", duration: "8h 40m", fare: "from INR 1,090", tone: "success" },
  { route: "Chennai to Coimbatore", duration: "7h 15m", fare: "from INR 780", tone: "info" },
  { route: "Pune to Goa", duration: "10h 20m", fare: "from INR 1,120", tone: "warning" },
  { route: "Delhi to Jaipur", duration: "5h 30m", fare: "from INR 640", tone: "neutral" },
] as const;

const testimonials = [
  {
    name: "Operations Lead",
    role: "Intercity network",
    quote: "The workspace makes demand, bookings, and operational exceptions easy to scan.",
  },
  {
    name: "Travel Agent",
    role: "Bengaluru partner",
    quote: "Quick booking and customer sections feel built for repeated daily work.",
  },
  {
    name: "Customer",
    role: "Frequent traveller",
    quote: "Trips, notifications, saved routes, and tickets all feel connected.",
  },
];

const faqs = [
  {
    question: "Is booking payment live in this milestone?",
    answer:
      "No. Milestone 3 focuses on UI design system, layouts, dashboards, and dummy application states.",
  },
  {
    question: "Are customer, travel agent, and admin layouts separate?",
    answer: "Yes. The platform now has role-specific dashboard shells and navigation surfaces.",
  },
  {
    question: "Does the design system include Storybook coverage?",
    answer:
      "Yes. Reusable primitives, overlays, navigation, tables, charts, uploads, forms, and states have grouped stories.",
  },
];

export default function LandingPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-gray-950">
          <Image
            src="/images/bus-terminal-hero.png"
            alt="Modern intercity bus terminal"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gray-950/60" />
          <div className="relative mx-auto grid min-h-[calc(100svh-9rem)] max-w-7xl content-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge variant="default">Enterprise bus booking platform</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
                Vriddhi Nexus Pvt Ltd
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">
                A polished booking-platform foundation for customers, travel agents, and
                administrators, built around a complete reusable UI system.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Open dashboards
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/search">
                    Search routes
                    <Bus className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Search banner"
              title="Route Search"
              description="A reusable search surface for public, customer, and agent experiences."
            />
            <SearchPanel />
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <SlideUp key={feature.title} transition={{ delay: index * 0.04, duration: 0.24 }}>
                <Card className="h-full">
                  <CardHeader>
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </SlideUp>
            );
          })}
        </section>

        <section
          id="why-choose-us"
          className="border-y border-gray-200 bg-gray-100 py-12 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <SectionHeading
              eyebrow="Why choose us"
              title="Built for serious transport operations"
              description="The product surface is quiet, structured, and ready for repeated work across business roles."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {reasons.map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
                >
                  <CheckCircle2
                    className="h-5 w-5 text-emerald-700 dark:text-emerald-300"
                    aria-hidden="true"
                  />
                  <h3 className="mt-3 text-sm font-semibold text-gray-950 dark:text-gray-50">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="One platform shape across the journey"
            description="The UI system supports the path from public discovery to operational control."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <Card key={step.title}>
                  <CardHeader>
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Popular routes"
              title="High-demand intercity corridors"
              description="Representative route cards for browse and recommendation surfaces."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {popularRoutes.map((route) => (
                <Card key={route.route}>
                  <CardHeader>
                    <MapPinned
                      className="h-5 w-5 text-blue-700 dark:text-blue-300"
                      aria-hidden="true"
                    />
                    <CardTitle className="text-base">{route.route}</CardTitle>
                    <CardDescription>{route.duration}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <StatusChip tone={route.tone}>{route.fare}</StatusChip>
                    <Clock3 className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Testimonials"
            title="Role-focused feedback"
            description="Dummy testimonials representing the audiences supported by the milestone."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardHeader>
                  <CardTitle className="text-base">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {testimonial.quote}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="faq"
          className="border-y border-gray-200 bg-gray-100 py-12 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <SectionHeading
              eyebrow="FAQ"
              title="Milestone 3 scope"
              description="Clear boundaries for the current UI milestone."
            />
            <Accordion type="single" collapsible className="grid gap-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className="rounded-md border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950"
                >
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              <Smartphone className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
                Download App Coming Soon
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Mobile app touchpoints are represented in the design direction and ready for a later
                implementation milestone.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">
                <Bell className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Notifications
              </Badge>
              <Badge variant="success">
                <Headphones className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Support
              </Badge>
            </div>
          </div>
        </section>
      </main>
      <div id="footer">
        <SiteFooter />
      </div>
    </PublicLayout>
  );
}

function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-blue-700 dark:text-blue-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
