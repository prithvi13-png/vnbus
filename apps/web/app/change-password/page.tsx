import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vnbus/ui";

import { ChangePasswordForm } from "../../components/auth-forms";
import { DashboardShell } from "../../components/dashboard-shell";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Change Password",
};

export default function ChangePasswordPage(): React.JSX.Element {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Security"
        title="Change Password"
        description="Rotate your account password while keeping refresh-token protections intact."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Strong passwords keep account access protected.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
