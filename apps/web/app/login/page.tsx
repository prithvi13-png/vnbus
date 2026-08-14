import type { Metadata } from "next";

import { LoginForm } from "../../components/auth-forms";
import { AuthLayout } from "../../components/auth-layout";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage(): React.JSX.Element {
  return (
    <AuthLayout
      title="Sign in"
      description="Access bookings, traveller profiles, and role-based workspaces."
    >
      <LoginForm />
    </AuthLayout>
  );
}
