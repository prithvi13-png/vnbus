import { Suspense } from "react";
import type { Metadata } from "next";

import { ResetPasswordForm } from "../../components/auth-forms";
import { AuthLayout } from "../../components/auth-layout";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage(): React.JSX.Element {
  return (
    <AuthLayout
      title="Set new password"
      description="Complete password reset with a one-time token."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
