"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Utensils, Star, MapPin, Users, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getFeedReviews, type FeedReview } from "@/lib/actions/follows";

interface UserStats {
  totalReviews: number;
  uniqueRestaurants: number;
  avgRating: number | null;
}

interface HomeContentProps {
  firstName: string;
  stats: UserStats;
  followingCount: number;
}

export default function HomeContent({ firstName, stats, followingCount }: HomeContentProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"feed" | "stats">("feed");
  const [feedReviews, setFeedReviews] = useState<FeedReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (activeTab === "feed") {
      loadFeed();
    }
  }, [activeTab]);

  const loadFeed = async (nextPage = 1) => {
    setLoading(true);
    const result = await getFeedReviews(nextPage, 10);
    if (nextPage === 1) {
      setFeedReviews(result.reviews);
    } else {
      setFeedReviews([...feedReviews, ...result.reviews]);
    }
    setHasMore(result.hasMore);
    setPage(nextPage);
    setLoading(false);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("today");
    if (diffDays === 1) return t("yesterday");
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Greeting + Search */}
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("welcomeBack")},</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">{firstName}</h1>
        </div>

        <div className="flex gap-2">
          <Link
            href="/add"
            className="group flex flex-1 items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary"
          >
            <Search size={18} />
            <span className="text-sm">{t("searchForRestaurant")}...</span>
          </Link>
          <Link
            href="/explore"
            className="flex items-center justify-center rounded-xl border border-border bg-secondary/50 px-4 py-3 text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary"
            title={t("discoverPeople")}
          >
            <Users size={18} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-secondary/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              activeTab === "feed"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("feed")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              activeTab === "stats"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("yourStats")}
          </button>
        </div>

      {/* Feed Tab */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {loading && feedReviews.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">{t("emptyFeedHint")}</p>
            </div>
          ) : (
            <>
              {feedReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/review/${review.id}`}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20"
                >
                  {/* Photo */}
                  {review.restaurant.photo_reference ? (
                    <img
                      src={`/api/places/photo?ref=${encodeURIComponent(review.restaurant.photo_reference)}`}
                      alt={review.restaurant.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">@{review.user.username}</span>
                          {" · "}{formatDate(review.created_at)}
                        </p>
                        <h3 className="mt-1 font-serif font-semibold truncate">
                          {review.restaurant.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
                        <Star size={12} className="text-primary" fill="currentColor" />
                        <span className="text-xs font-medium text-primary">{review.rating_overall}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </Link>
              ))}

              {hasMore && (
                <button
                  type="button"
                  onClick={() => loadFeed(page + 1)}
                  disabled={loading}
                  className="w-full rounded-xl bg-secondary py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
                >
                  {loading ? t("loading") : t("loadMore")}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Stats Tab / Default when no follows */}
      {(activeTab === "stats" || followingCount === 0) && (
        <div className="space-y-6">
          {/* Stats */}
          {stats.totalReviews > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="font-serif text-2xl font-semibold">{stats.uniqueRestaurants}</p>
                <p className="text-xs text-muted-foreground">{t("places")}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="font-serif text-2xl font-semibold">{stats.totalReviews}</p>
                <p className="text-xs text-muted-foreground">{t("reviews")}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="font-serif text-2xl font-semibold">{stats.avgRating?.toFixed(1) ?? "-"}</p>
                <p className="text-xs text-muted-foreground">{t("average")}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
              <Utensils className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">{t("noVisitsYet")}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/add"
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-6 transition-all hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium">{t("logAVisit")}</span>
            </Link>
            <Link
              href="/history"
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-6 transition-all hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Utensils size={18} />
              </div>
              <span className="text-sm font-medium">{t("myHistory")}</span>
            </Link>
          </div>

          {/* Suggest following */}
          {followingCount === 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("followSuggestion")}
              </p>
              <Link
                href="/explore"
                className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {t("discoverPeople")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
