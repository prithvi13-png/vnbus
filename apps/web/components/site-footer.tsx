import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
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
      { label: "Track Bus", href: "/track-bus" },
      { label: "Bookings", href: "/booking-history" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Support", href: "/support" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
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
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-gold-500/30 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
            <Image
              src="/images/vriddhi-nexus-logo.png"
              alt="Vriddhi Nexus logo"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
            />
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
              <Button
                key={social.label}
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gold-100 hover:bg-gold-500/10 hover:text-gold-500"
              >
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
