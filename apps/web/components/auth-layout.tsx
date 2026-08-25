import Image from "next/image";
import Link from "next/link";
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
    <main className="relative min-h-screen overflow-hidden bg-brand-950 px-4 py-8 sm:px-6">
      <Image
        src="/images/bus-terminal-hero.png"
        alt="Modern intercity bus terminal"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35 mix-blend-multiply"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(1,60,45,0.98)_0%,rgba(2,85,62,0.9)_48%,rgba(6,26,22,0.96)_100%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-gold-500/30 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
            <Image
              src="/images/vriddhi-nexus-logo.png"
              alt="Vriddhi Nexus logo"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
              priority
            />
          </span>
          <span>Vriddhi Nexus Pvt Ltd</span>
        </Link>
        <div className="grid flex-1 content-center gap-8 py-10 lg:grid-cols-[1fr_440px] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-gold-100">
              Account Access
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-brand-50">{description}</p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {["Secure roles", "Fast booking", "Invoice ready"].map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-gold-50 backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <Card className="w-full border-gold-200 bg-white/95 shadow-premium">
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
