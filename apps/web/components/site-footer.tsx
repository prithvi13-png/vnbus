import Link from "next/link";
import { Bus, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button, Footer } from "@vnbus/ui";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/#why-choose-us" },
      { label: "Contact", href: "/#footer" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Search", href: "/search" },
      { label: "Bookings", href: "/booking-history" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Security", href: "/settings" },
    ],
  },
];

const socials = [
  { label: "LinkedIn", icon: Linkedin },
  { label: "Twitter", icon: Twitter },
  { label: "Instagram", icon: Instagram },
  { label: "Facebook", icon: Facebook },
];

export function SiteFooter(): React.JSX.Element {
  return (
    <Footer
      className="mt-0"
      brand={
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-gray-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700 text-white">
            <Bus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>Vriddhi Nexus Pvt Ltd</span>
        </Link>
      }
      columns={columns}
      copyright="Copyright 2026 Vriddhi Nexus Pvt Ltd. All rights reserved."
      social={
        <>
          {socials.map((social) => {
            const Icon = social.icon;

            return (
              <Button key={social.label} asChild variant="ghost" size="icon" className="h-8 w-8">
                <a href="#" aria-label={social.label}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            );
          })}
        </>
      }
    />
  );
}
