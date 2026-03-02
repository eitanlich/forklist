"use client";

import { useState, useMemo } from "react";
import type { ReviewWithRestaurant, Occasion } from "@/types";
import { BookOpen, MapPin, Calendar, Star, Globe, Pencil, Trash2, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useT, useI18n } from "@/lib/i18n";

const ITEMS_PER_PAGE = 5;

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          strokeWidth={1.5}
          className={rating >= star ? "text-primary" : "text-muted-foreground/25"}
          fill={rating >= star ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewWithRestaurant }) {
  const t = useT();
  const { locale } = useI18n();
  const { restaurant } = review;

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const OCCASION_LABELS: Record<string, string> = {
    date: t("dateNight"),
    family: t("family"),
    friends: t("friends"),
    business: t("business"),
    solo: t("solo"),
    other: t("other"),
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:bg-card/80">
      <div className="flex gap-5 p-5">
        {/* Photo */}
        {restaurant.photo_reference && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
            alt={restaurant.name}
            className="h-24 w-24 shrink-0 rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-serif text-lg font-semibold tracking-tight">{restaurant.name}</h2>
            
            {/* Edit/Delete buttons */}
            <div className="flex items-center gap-1 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100">
              <Link
                href={`/review/${review.id}/edit`}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Pencil size={14} strokeWidth={1.5} />
              </Link>
              <Link
                href={`/review/${review.id}/delete`}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {restaurant.city && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={13} strokeWidth={1.5} />
              {restaurant.city}
            </div>
          )}

          {/* Overall stars */}
          <div className="mt-3">
            <Stars rating={review.rating_overall} size={18} />
          </div>

          {/* Sub-ratings */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">{t("food")} <Stars rating={review.rating_food} size={12} /></span>
            <span className="flex items-center gap-1.5">{t("service")} <Stars rating={review.rating_service} size={12} /></span>
            <span className="flex items-center gap-1.5">{t("ambiance")} <Stars rating={review.rating_ambiance} size={12} /></span>
            <span className="flex items-center gap-1.5">{t("priceShort")} <Stars rating={review.rating_price} size={12} /></span>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar size={13} strokeWidth={1.5} />
              {formatDate(review.visited_at)}
            </div>
            {review.occasion && (
              <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                {OCCASION_LABELS[review.occasion] ?? review.occasion}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="border-t border-border px-5 py-4">
          <p className="text-sm italic text-muted-foreground leading-relaxed line-clamp-3">
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>
      )}

      {/* Links */}
      {(restaurant.google_maps_url || restaurant.website) && (
        <div className="flex items-center gap-2 border-t border-border px-5 py-3">
          {restaurant.google_maps_url && (
            <a
              href={restaurant.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              <MapPin size={14} strokeWidth={1.5} />
              {t("maps")}
            </a>
          )}
          {restaurant.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              <Globe size={14} strokeWidth={1.5} />
              {t("website")}
            </a>
          )}
        </div>
      )}
    </article>
  );
}

type SortOption = "date-desc" | "date-asc" | "rating-desc" | "rating-asc";

interface HistoryContentProps {
  reviews: ReviewWithRestaurant[];
}

export default function HistoryContent({ reviews }: HistoryContentProps) {
  const t = useT();
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [occasionFilter, setOccasionFilter] = useState<Occasion | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);

  const OCCASIONS: { value: Occasion; label: string }[] = [
    { value: "date", label: t("dateNight") },
    { value: "friends", label: t("friends") },
    { value: "family", label: t("family") },
    { value: "business", label: t("business") },
    { value: "solo", label: t("solo") },
    { value: "other", label: t("other") },
  ];

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by rating
    if (ratingFilter !== null) {
      result = result.filter((r) => r.rating_overall >= ratingFilter);
    }

    // Filter by occasion
    if (occasionFilter !== null) {
      result = result.filter((r) => r.occasion === occasionFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
        case "date-asc":
          return new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime();
        case "rating-desc":
          return b.rating_overall - a.rating_overall;
        case "rating-asc":
          return a.rating_overall - b.rating_overall;
        default:
          return 0;
      }
    });

    return result;
  }, [reviews, ratingFilter, occasionFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setRatingFilter(null);
    setOccasionFilter(null);
    setSortBy("date-desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = ratingFilter !== null || occasionFilter !== null || sortBy !== "date-desc";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{t("myHistory")}</h1>
        {reviews.length > 0 && (
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter size={16} />
            {t("filters")}
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                !
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && reviews.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          {/* Rating filter */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("minRating")}</p>
            <div className="flex gap-2">
              {[null, 3, 4, 5].map((rating) => (
                <button
                  key={rating ?? "all"}
                  type="button"
                  onClick={() => {
                    setRatingFilter(rating);
                    handleFilterChange();
                  }}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    ratingFilter === rating
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {rating === null ? (
                    t("all")
                  ) : (
                    <>
                      <Star size={14} className="text-primary" fill="currentColor" />
                      {rating}+
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion filter */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("occasion")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setOccasionFilter(null);
                  handleFilterChange();
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  occasionFilter === null
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {t("all")}
              </button>
              {OCCASIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setOccasionFilter(value);
                    handleFilterChange();
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    occasionFilter === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("sortBy")}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "date-desc" as SortOption, label: t("newestFirst") },
                { value: "date-asc" as SortOption, label: t("oldestFirst") },
                { value: "rating-desc" as SortOption, label: t("highestRating") },
                { value: "rating-asc" as SortOption, label: t("lowestRating") },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSortBy(value);
                    handleFilterChange();
                  }}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    sortBy === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <ArrowUpDown size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {reviews.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filteredReviews.length === reviews.length
            ? `${reviews.length} ${t("reviews")}`
            : `${filteredReviews.length} ${t("of")} ${reviews.length} ${t("reviews")}`}
        </p>
      )}

      {/* Content */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <div className="space-y-2">
            <p className="text-lg font-medium">{t("noReviewsYet")}</p>
            <p className="text-base text-muted-foreground">
              {t("startLogging")}
            </p>
          </div>
          <Link
            href="/add"
            className="mt-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
          >
            {t("logFirstVisit")}
          </Link>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Filter className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="text-muted-foreground">{t("noMatchingReviews")}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-primary hover:underline"
          >
            {t("clearFilters")}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
