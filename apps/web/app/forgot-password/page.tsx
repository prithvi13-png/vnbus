import type { Metadata } from "next";

import { ForgotPasswordForm } from "../../components/auth-forms";
import { AuthLayout } from "../../components/auth-layout";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <AuthLayout
      title="Reset password"
      description="Receive a secure reset link for your Vriddhi Nexus account."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
