import Link from "next/link";
import Image from "next/image";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@vnbus/ui";

export function AuthCard({ mode }: { mode: "login" | "register" | "forgot" }): React.JSX.Element {
  const title =
    mode === "login" ? "Login" : mode === "register" ? "Create customer account" : "Reset password";

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md border border-gold-100 bg-white">
            <Image
              src="/images/vriddhi-nexus-logo.png"
              alt="Vriddhi Nexus logo"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
            />
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            {mode === "register" ? (
              <>
                <Input placeholder="Full name" autoComplete="name" />
                <Input placeholder="Phone" autoComplete="tel" />
              </>
            ) : null}
            <Input placeholder="Email" type="email" autoComplete="email" />
            {mode !== "forgot" ? (
              <Input placeholder="Password" type="password" autoComplete="current-password" />
            ) : null}
            <Button type="submit">{mode === "forgot" ? "Send reset link" : title}</Button>
          </form>
          <div className="mt-5 flex justify-between text-sm text-gray-600">
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
            <Link href="/forgot-password">Forgot password</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
