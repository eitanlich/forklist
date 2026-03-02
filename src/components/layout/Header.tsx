import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-6 md:px-8">
        <Link
          href="/"
          className="font-serif text-2xl font-semibold tracking-tight text-primary transition-all duration-300 hover:opacity-70"
        >
          ForkList
        </Link>

        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 transition-transform duration-300 hover:scale-105",
            },
          }}
        />
      </div>
    </header>
  );
}
