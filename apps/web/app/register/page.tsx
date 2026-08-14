import type { Metadata } from "next";

import { RegisterForm } from "../../components/auth-forms";
import { AuthLayout } from "../../components/auth-layout";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage(): React.JSX.Element {
  return (
    <AuthLayout
      title="Create account"
      description="Start a customer account with verified contact details."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
