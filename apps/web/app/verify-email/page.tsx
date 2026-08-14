import { Suspense } from "react";
import type { Metadata } from "next";

import { VerifyEmailForm } from "../../components/auth-forms";
import { AuthLayout } from "../../components/auth-layout";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function VerifyEmailPage(): React.JSX.Element {
  return (
    <AuthLayout
      title="Verify email"
      description="Confirm the email address attached to your account."
    >
      <Suspense>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
