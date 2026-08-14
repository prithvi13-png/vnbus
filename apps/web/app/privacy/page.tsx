import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, PublicLayout } from "@vnbus/ui";

import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              Privacy content for Vriddhi Nexus Pvt Ltd will be finalized in a later business
              milestone. This placeholder keeps the public layout complete for Milestone 3.
            </p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}
