"use client";

import { Star, MapPin, Globe, Heart } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { ProfileStats as ProfileStatsType } from "@/lib/actions/profile-stats";

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const t = useT();
  const {
    totalReviews,
    totalRestaurants,
    totalCountries,
    averageRating,
    totalLikesReceived,
  } = stats;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl bg-secondary/50 p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <MapPin size={16} />
          <span className="text-lg font-semibold">{totalRestaurants}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("statsPlaces")}</p>
      </div>

      <div className="rounded-xl bg-secondary/50 p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <Globe size={16} />
          <span className="text-lg font-semibold">{totalCountries}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("statsCountries")}</p>
      </div>

      <div className="rounded-xl bg-secondary/50 p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <Star size={16} />
          <span className="text-lg font-semibold">
            {averageRating > 0 ? averageRating.toFixed(1) : "-"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t("statsAvgRating")}</p>
      </div>

      <div className="rounded-xl bg-secondary/50 p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-destructive">
          <Heart size={16} />
          <span className="text-lg font-semibold">{totalLikesReceived}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("statsLikesReceived")}</p>
      </div>
    </div>
  );
}
