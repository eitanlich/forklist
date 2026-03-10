"use client";

import { useState, useEffect } from "react";
import { getFeedReviews, type FeedReview } from "@/lib/actions/follows";
import { getBatchLikeInfo } from "@/lib/actions/likes";
import { useT } from "@/lib/i18n";
import { Loader2, Star, MapPin, Users, Search } from "lucide-react";
import Link from "next/link";
import { LikeButton } from "@/components/ui/LikeButton";

export function FeedContent() {
  const t = useT();
  const [reviews, setReviews] = useState<FeedReview[]>([]);
  const [likeInfo, setLikeInfo] = useState<Record<string, { count: number; hasLiked: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const result = await getFeedReviews(1, 10);
    setReviews(result.reviews);
    
    // Fetch like info for all reviews
    if (result.reviews.length > 0) {
      const reviewIds = result.reviews.map((r) => r.id);
      const likes = await getBatchLikeInfo(reviewIds);
      setLikeInfo(likes);
    }
    
    setHasMore(result.hasMore);
    setPage(1);
    setLoading(false);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const result = await getFeedReviews(nextPage, 10);
    setReviews([...reviews, ...result.reviews]);
    
    // Fetch like info for new reviews
    if (result.reviews.length > 0) {
      const reviewIds = result.reviews.map((r) => r.id);
      const likes = await getBatchLikeInfo(reviewIds);
      setLikeInfo((prev) => ({ ...prev, ...likes }));
    }
    
    setHasMore(result.hasMore);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("today");
    if (diffDays === 1) return t("yesterday");
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {t("feed")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("feedSubtitle")}
          </p>
        </div>
        {/* Always show discover link */}
        <Link
          href="/explore"
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
        >
          <Search size={16} />
          <span className="hidden sm:inline">{t("discoverPeople")}</span>
        </Link>
      </div>

      {/* Empty State */}
      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-serif text-lg font-medium text-foreground">
            {t("emptyFeed")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyFeedHint")}
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            {t("discoverPeople")}
          </Link>
        </div>
      ) : (
        <>
          {/* Feed Items */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/20"
              >
                {/* User Header */}
                <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                  <Link
                    href={`/u/${review.user.username}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {review.user.username?.charAt(0).toUpperCase() || "?"}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/u/${review.user.username}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      @{review.user.username}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
                    <Star size={14} className="text-primary" fill="currentColor" />
                    <span className="text-sm font-medium text-primary">
                      {review.rating_overall}
                    </span>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="flex gap-4 p-5">
                  <Link href={`/review/${review.id}`}>
                    {review.restaurant.photo_reference ? (
                      <img
                        src={`/api/places/photo?ref=${encodeURIComponent(review.restaurant.photo_reference)}`}
                        alt={review.restaurant.name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover transition-opacity hover:opacity-80"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/restaurant/${review.restaurant.id}`}
                      className="font-serif text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {review.restaurant.name}
                    </Link>
                    {review.restaurant.city && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {review.restaurant.city}
                      </p>
                    )}
                    <Link href={`/review/${review.id}`}>
                      {review.comment && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 italic hover:text-foreground transition-colors">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center border-t border-border px-5 py-3">
                  <LikeButton
                    reviewId={review.id}
                    initialLiked={likeInfo[review.id]?.hasLiked ?? false}
                    initialCount={likeInfo[review.id]?.count ?? 0}
                  />
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("loading")}
                  </>
                ) : (
                  t("loadMore")
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
