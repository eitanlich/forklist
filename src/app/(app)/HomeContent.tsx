"use client";

import Link from "next/link";
import { Plus, Search, Utensils, Star, Users, TrendingUp } from "lucide-react";
import { useT } from "@/lib/i18n";

interface UserStats {
  totalReviews: number;
  uniqueRestaurants: number;
  avgRating: number | null;
  topOccasion: string | null;
  topCuisine: string | null;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:bg-card/80">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={15} strokeWidth={1.5} />
        <span className="text-sm font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="font-serif text-3xl font-semibold tracking-tight">{value}</p>
      {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}
    </div>
  );
}

interface HomeContentProps {
  firstName: string;
  stats: UserStats;
}

export default function HomeContent({ firstName, stats }: HomeContentProps) {
  const t = useT();
  const hasReviews = stats.totalReviews > 0;

  const OCCASION_LABELS: Record<string, string> = {
    date: t("dateNight"),
    family: t("family"),
    friends: t("friends"),
    business: t("business"),
    solo: t("solo"),
    other: t("other"),
  };

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div className="space-y-1">
        <p className="text-base text-muted-foreground font-medium">{t("welcomeBack")},</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">{firstName}</h1>
      </div>

      {/* Search CTA */}
      <Link
        href="/add"
        className="group flex items-center gap-4 rounded-2xl border border-border bg-secondary/50 px-5 py-4 text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:bg-secondary hover:text-foreground"
      >
        <Search size={18} strokeWidth={1.5} className="transition-transform duration-300 group-hover:scale-110" />
        <span className="text-base">{t("searchForRestaurant")}...</span>
      </Link>

      {/* Stats Grid */}
      {hasReviews ? (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Utensils}
            label={t("places")}
            value={stats.uniqueRestaurants}
            subtext={`${stats.totalReviews} ${t("visits")}`}
          />
          <StatCard
            icon={Star}
            label={t("rating")}
            value={stats.avgRating?.toFixed(1) ?? "-"}
            subtext={t("average")}
          />
          {stats.topOccasion && (
            <StatCard
              icon={Users}
              label={t("occasion")}
              value={OCCASION_LABELS[stats.topOccasion] ?? stats.topOccasion}
            />
          )}
          {stats.topCuisine && (
            <StatCard
              icon={TrendingUp}
              label={t("cuisine")}
              value={stats.topCuisine}
            />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <Utensils className="mx-auto h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-4 text-base text-muted-foreground">
            {t("noVisitsYet")}
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/add"
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-8 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <Plus size={22} strokeWidth={2} />
          </div>
          <span className="text-base font-medium">{t("logAVisit")}</span>
        </Link>

        <Link
          href="/history"
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-8 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-transform duration-300 group-hover:scale-110">
            <span className="font-serif text-xl font-semibold">H</span>
          </div>
          <span className="text-base font-medium">{t("myHistory")}</span>
        </Link>
      </div>
    </div>
  );
}
