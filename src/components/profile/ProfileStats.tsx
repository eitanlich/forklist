"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Heart, Utensils, Calendar, Building2 } from "lucide-react";
import { useT, useI18n } from "@/lib/i18n";
import { getProfileStats, type ProfileStats as ProfileStatsType, type TimePeriod } from "@/lib/actions/profile-stats";

interface ProfileStatsProps {
  userId: string;
  initialStats?: ProfileStatsType;
}

export function ProfileStats({ userId, initialStats }: ProfileStatsProps) {
  const t = useT();
  const { locale } = useI18n();
  const [period, setPeriod] = useState<TimePeriod>("all");
  const [stats, setStats] = useState<ProfileStatsType | null>(initialStats ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const newStats = await getProfileStats(userId, period);
      setStats(newStats);
      setLoading(false);
    }
    fetchStats();
  }, [userId, period]);

  const periodLabels: Record<TimePeriod, string> = {
    month: locale === "es" ? "Este mes" : "This Month",
    year: locale === "es" ? "Este año" : "This Year",
    all: locale === "es" ? "Todo" : "All Time",
  };

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Period Toggle */}
      <div className="flex justify-center gap-1 rounded-xl bg-secondary/50 p-1">
        {(["month", "year", "all"] as TimePeriod[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              period === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-3 gap-2 transition-opacity ${loading ? "opacity-50" : ""}`}>
        {/* Reviews */}
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <p className="text-lg font-semibold text-foreground">{stats.totalReviews}</p>
          <p className="text-xs text-muted-foreground">{t("reviews")}</p>
        </div>

        {/* Places */}
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <MapPin size={14} className="text-primary" />
            <span className="text-lg font-semibold text-foreground">{stats.totalRestaurants}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("statsPlaces")}</p>
        </div>

        {/* Avg Rating */}
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star size={14} className="text-yellow-500" />
            <span className="text-lg font-semibold text-foreground">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t("statsAvgRating")}</p>
        </div>

        {/* Top Cuisine */}
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Utensils size={14} className="text-primary" />
            <span className="text-sm font-semibold text-foreground truncate">
              {stats.topCuisine || "-"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t("statsTopCuisine")}</p>
        </div>

        {/* Top Occasion */}
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Calendar size={14} className="text-primary" />
            <span className="text-sm font-semibold text-foreground truncate">
              {stats.topOccasion || "-"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t("statsTopOccasion")}</p>
        </div>

        {/* Likes Received */}
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Heart size={14} className="text-destructive" />
            <span className="text-lg font-semibold text-foreground">{stats.totalLikesReceived}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("statsLikes")}</p>
        </div>
      </div>

      {/* Cities (smaller, at bottom) */}
      {stats.totalCities > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Building2 size={14} />
          <span>
            {stats.totalCities} {stats.totalCities === 1 
              ? (locale === "es" ? "ciudad" : "city") 
              : (locale === "es" ? "ciudades" : "cities")}
          </span>
        </div>
      )}
    </div>
  );
}
