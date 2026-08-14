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
  Smartphone,
  TicketCheck,
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
    title: "Search in seconds",
    description: "Choose your route and journey date from a clean booking form.",
    icon: Route,
  },
  {
    title: "Simple seat choice",
    description: "Pick available seats and continue with boarding and dropping points preselected.",
    icon: Bus,
  },
  {
    title: "Ticket and invoice",
    description: "Confirmed bookings generate ticket and invoice actions for customers.",
    icon: TicketCheck,
  },
];

const reasons = [
  ["Clear search", "Route, destination, and date stay visible at the start."],
  ["Fewer clicks", "Default stops help customers continue after selecting seats."],
  ["Easy review", "Trip, passengers, and fare are separated into simple sections."],
  ["Ready records", "Tickets and invoices are available from completed bookings."],
];

const steps = [
  {
    title: "Search",
    description: "Enter from, to, and journey date.",
    icon: Route,
  },
  {
    title: "Seats",
    description: "Choose your seat and continue.",
    icon: CalendarCheck,
  },
  {
    title: "Ticket",
    description: "Confirm booking and download ticket or invoice.",
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
    name: "Frequent Traveller",
    role: "Bengaluru route",
    quote: "Search, seats, and confirmation feel connected and easy to finish.",
  },
  {
    name: "Family Customer",
    role: "Weekend trip",
    quote: "The seat page keeps the important choices in one place.",
  },
  {
    name: "Customer",
    role: "Invoice user",
    quote: "Ticket and invoice actions are visible after booking.",
  },
];

const faqs = [
  {
    question: "Can customers book a ticket here?",
    answer:
      "Yes. Customers can search buses, choose seats, enter passenger details, and confirm a mock booking.",
  },
  {
    question: "Is the admin dashboard separate?",
    answer: "Yes. Admin pages are protected and customers are sent to the customer experience.",
  },
  {
    question: "Do bookings create invoices?",
    answer: "Yes. Confirmed customer bookings include invoice download actions.",
  },
];

export default function LandingPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-brand-700">
          <Image
            src="/images/bus-terminal-hero.png"
            alt="Modern intercity bus terminal"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-brand-700/85" />
          <div className="relative mx-auto grid min-h-[calc(100svh-9rem)] max-w-7xl content-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge variant="default">Bus tickets by Vriddhi Nexus</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
                Vriddhi Nexus Pvt Ltd
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-brand-50 sm:text-lg">
                Search routes, choose seats, add passenger details, and receive ticket and invoice
                actions from one clean booking flow.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/search">
                    Book a ticket
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/70 bg-transparent text-white hover:bg-white hover:text-brand-900"
                >
                  <Link href="/login">
                    Customer login
                    <Bus className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-gold-100 bg-white py-6 dark:border-brand-900 dark:bg-brand-950">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Book now"
              title="Book your bus ticket"
              description="Start with route and date. The next screens keep seats, details, and review simple."
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
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-100">
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
          className="border-y border-gold-100 bg-brand-50 py-12 dark:border-brand-900 dark:bg-brand-950"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <SectionHeading
              eyebrow="Why choose us"
              title="A calmer booking experience"
              description="The customer path keeps each choice clear and avoids unnecessary dashboard-style controls."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {reasons.map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-md border border-gold-100 bg-white p-4 shadow-sm dark:border-brand-900 dark:bg-brand-950"
                >
                  <CheckCircle2
                    className="h-5 w-5 text-gold-600 dark:text-gold-100"
                    aria-hidden="true"
                  />
                  <h3 className="mt-3 text-sm font-semibold text-brand-900 dark:text-white">
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
            title="Three simple steps"
            description="Search a route, choose a seat, and confirm the booking."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <Card key={step.title}>
                  <CardHeader>
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-100">
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

        <section className="border-y border-gold-100 bg-white py-12 dark:border-brand-900 dark:bg-brand-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Popular routes"
              title="High-demand intercity corridors"
              description="Common routes customers can search and book quickly."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {popularRoutes.map((route) => (
                <Card key={route.route}>
                  <CardHeader>
                    <MapPinned
                      className="h-5 w-5 text-gold-600 dark:text-gold-100"
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
            title="Customer feedback"
            description="Booking surfaces are now focused on clarity and speed."
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
          className="border-y border-gold-100 bg-brand-50 py-12 dark:border-brand-900 dark:bg-brand-950"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <SectionHeading
              eyebrow="FAQ"
              title="Booking questions"
              description="Quick answers for customers and operators."
            />
            <Accordion type="single" collapsible className="grid gap-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className="rounded-md border border-gold-100 bg-white px-4 dark:border-brand-900 dark:bg-brand-950"
                >
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-lg border border-gold-100 bg-white p-6 dark:border-brand-900 dark:bg-brand-950 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-100">
              <Smartphone className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-normal text-brand-900 dark:text-white">
                Download App Coming Soon
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Mobile booking touchpoints will follow the same simple search, seats, and ticket
                flow.
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
      <p className="text-xs font-semibold uppercase tracking-normal text-gold-600 dark:text-gold-100">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-normal text-brand-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
