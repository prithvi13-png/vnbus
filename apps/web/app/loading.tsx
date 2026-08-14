import { LoadingState } from "@vnbus/ui";

export default function Loading(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
      <LoadingState
        title="Loading workspace"
        description="Preparing the current application view."
        className="mx-auto max-w-7xl"
      />
    </main>
  );
}
