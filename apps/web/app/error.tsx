"use client";

import { RefreshCw } from "lucide-react";
import { Button, ErrorLayout, ErrorState } from "@vnbus/ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <ErrorLayout>
      <div className="w-full max-w-xl">
        <ErrorState title="Something went wrong" description="The page failed to load." />
        <div className="mt-5 flex justify-center">
          <Button type="button" onClick={reset}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      </div>
    </ErrorLayout>
  );
}
