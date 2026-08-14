import Link from "next/link";
import { Compass } from "lucide-react";
import { Button, ErrorLayout, ErrorState } from "@vnbus/ui";

export default function NotFound(): React.JSX.Element {
  return (
    <ErrorLayout>
      <div className="w-full max-w-xl">
        <ErrorState
          title="Page not found"
          description="The requested workspace route is unavailable."
        />
        <div className="mt-5 flex justify-center">
          <Button asChild>
            <Link href="/">
              <Compass className="h-4 w-4" aria-hidden="true" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </ErrorLayout>
  );
}
