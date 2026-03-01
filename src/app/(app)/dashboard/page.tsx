import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default async function DashboardPage() {
  await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="font-serif text-3xl font-semibold">{firstName}</h1>
      </div>

      {/* Search CTA */}
      <Link
        href="/add"
        className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Search size={16} />
        <span className="text-sm">Search for a restaurant…</span>
      </Link>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/add"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-6 transition-colors hover:border-primary/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus size={20} />
          </div>
          <span className="text-sm font-medium">Log a Visit</span>
        </Link>

        <Link
          href="/history"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-6 transition-colors hover:border-primary/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <span className="font-serif text-lg font-semibold">H</span>
          </div>
          <span className="text-sm font-medium">My History</span>
        </Link>
      </div>
    </div>
  );
}
