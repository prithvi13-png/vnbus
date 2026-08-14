"use client";

import { Button, ErrorState } from "@vnbus/ui";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-gray-950 px-4 py-10">
          <div className="w-full max-w-lg">
            <ErrorState
              title="Service unavailable"
              description="The application shell could not be rendered."
              className="border-gray-800 bg-gray-950"
            />
            <div className="mt-5 flex justify-center">
              <Button type="button" onClick={reset}>
                Retry
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
