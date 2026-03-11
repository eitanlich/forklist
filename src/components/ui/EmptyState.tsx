"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Action {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions: Action[];
  illustration?: "food" | "people" | "list" | "search";
}

// Fun gradient backgrounds for each type
const illustrationStyles = {
  food: "from-orange-500/20 via-red-500/10 to-yellow-500/20",
  people: "from-blue-500/20 via-purple-500/10 to-pink-500/20",
  list: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
  search: "from-violet-500/20 via-indigo-500/10 to-blue-500/20",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  illustration = "food",
}: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${illustrationStyles[illustration]} opacity-50`}
      />
      
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center px-6 py-16 text-center">
        {/* Icon with ring */}
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <Icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text */}
        <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-3 max-w-sm text-base text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`
                rounded-2xl px-8 py-4 text-base font-semibold transition-all duration-300
                ${
                  action.variant === "secondary"
                    ? "bg-secondary text-foreground hover:bg-secondary/80"
                    : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                }
              `}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
