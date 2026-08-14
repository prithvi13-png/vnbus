import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button, ErrorLayout, ErrorState } from "@vnbus/ui";

export const metadata: Metadata = {
  title: "Unauthorized",
};

export default function UnauthorizedPage(): React.JSX.Element {
  return (
    <ErrorLayout>
      <section className="w-full max-w-lg">
        <ErrorState
          title="Access denied"
          description="Your account does not have permission to open this workspace."
        />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>
    </ErrorLayout>
  );
}
