import Link from "next/link";
import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { Button, ErrorLayout, MaintenanceState } from "@vnbus/ui";

export const metadata: Metadata = {
  title: "Session Expired",
};

export default function SessionExpiredPage(): React.JSX.Element {
  return (
    <ErrorLayout>
      <section className="w-full max-w-lg">
        <MaintenanceState
          title="Session expired"
          description="Sign in again to continue using your Vriddhi Nexus workspace."
        />
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in
            </Link>
          </Button>
        </div>
      </section>
    </ErrorLayout>
  );
}
