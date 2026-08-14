import type { Metadata } from "next";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vriddhinexus.com"),
  title: {
    default: "Vriddhi Nexus Bus",
    template: "%s | Vriddhi Nexus Bus",
  },
  description: "Enterprise bus booking platform foundation for Vriddhi Nexus Pvt Ltd.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vriddhi Nexus Bus",
    description: "Enterprise bus booking platform foundation for Vriddhi Nexus Pvt Ltd.",
    type: "website",
    url: "/",
    siteName: "Vriddhi Nexus Bus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vriddhi Nexus Bus",
    description: "Enterprise bus booking platform foundation for Vriddhi Nexus Pvt Ltd.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
