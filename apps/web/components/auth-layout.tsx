import Image from "next/image";
import Link from "next/link";
import { Bus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vnbus/ui";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-950 px-4 py-8 sm:px-6">
      <Image
        src="/images/bus-terminal-hero.png"
        alt="Modern intercity bus terminal"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gray-950/65" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-blue-700">
            <Bus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>Vriddhi Nexus Pvt Ltd</span>
        </Link>
        <div className="grid flex-1 content-center gap-8 py-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-blue-100">
              Account Access
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-gray-100">{description}</p>
          </div>
          <Card className="w-full rounded-lg border-white/20 bg-white shadow-soft">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
