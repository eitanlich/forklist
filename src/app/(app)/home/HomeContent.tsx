"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Users, Loader2, UtensilsCrossed } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingChecklist } from "@/components/home/OnboardingChecklist";
import { useT } from "@/lib/i18n";
import { getFeedReviews, type FeedReview } from "@/lib/actions/follows";

interface ChecklistData {
  hasReviews: boolean;
  hasLists: boolean;
  hasShared: boolean;
  lastReviewId: string | null;
  lastRestaurantName: string | null;
  isNewUser: boolean;
}

interface HomeContentProps {
  firstName: string;
  followingCount: number;
  checklistData: ChecklistData;
}

export default function HomeContent({ firstName, followingCount, checklistData }: HomeContentProps) {
  const t = useT();
  const [showChecklist, setShowChecklist] = useState(true);
  const [feedReviews, setFeedReviews] = useState<FeedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadFeed();
  }, []);

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
            href="/search"
            className="group flex flex-1 items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary"
          >
            <Search size={18} />
            <span className="text-sm">{t("searchForRestaurant")}...</span>
          </Link>
          <Link
            href="/search?tab=people"
            className="flex items-center justify-center rounded-xl border border-border bg-secondary/50 px-4 py-3 text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary"
            title={t("discoverPeople")}
          >
            <Users size={18} />
          </Link>
        </div>
      </div>

      {/* Onboarding Checklist */}
      {showChecklist && (
        <OnboardingChecklist
          hasReviews={checklistData.hasReviews}
          hasLists={checklistData.hasLists}
          hasShared={checklistData.hasShared}
          lastReviewId={checklistData.lastReviewId}
          lastRestaurantName={checklistData.lastRestaurantName}
          onDismiss={() => setShowChecklist(false)}
        />
      )}

      {/* Feed */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-semibold">{t("feed")}</h2>
        
        {loading && feedReviews.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : feedReviews.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title={t("emptyFeedTitle")}
            description={t("emptyFeedDesc")}
            illustration="food"
            actions={[
              { label: t("emptyFeedCTA"), href: "/add", variant: "primary" },
              { label: t("emptyFeedCTASecondary"), href: "/search?tab=people", variant: "secondary" },
            ]}
          />
        ) : (
          <>
            {feedReviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20"
              >
                {/* Photo */}
                <Link href={`/review/${review.id}`}>
                  {review.restaurant.photo_reference ? (
                    <img
                      src={`/api/places/photo?ref=${encodeURIComponent(review.restaurant.photo_reference)}`}
                      alt={review.restaurant.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover transition-opacity hover:opacity-80"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        <Link href={`/u/${review.user.username}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          @{review.user.username}
                        </Link>
                        {" · "}{formatDate(review.created_at)}
                      </p>
                      <Link
                        href={`/restaurant/${review.restaurant.google_place_id}`}
                        className="mt-1 block font-serif font-semibold truncate hover:text-primary transition-colors"
                      >
                        {review.restaurant.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
                      <Star size={12} className="text-primary" fill="currentColor" />
                      <span className="text-xs font-medium text-primary">{review.rating_overall}</span>
                    </div>
                  </div>
                  <Link href={`/review/${review.id}`}>
                    {review.comment && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2 hover:text-foreground transition-colors">
                        {review.comment}
                      </p>
                    )}
                  </Link>
                </div>
              </div>
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
    </div>
  );
}
