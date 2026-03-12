import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <span className="font-serif text-2xl font-medium text-foreground">ForkList</span>
      </Link>

      {/* Illustration */}
      <div className="mb-8 text-8xl">🍽️</div>

      {/* Message */}
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-lg text-muted-foreground">
        Looks like this page doesn&apos;t exist. Maybe the restaurant moved?
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          <Home size={20} />
          Go home
        </Link>
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-secondary/80"
        >
          <Search size={20} />
          Search restaurants
        </Link>
      </div>
    </main>
  );
}
