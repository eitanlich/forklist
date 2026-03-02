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
        {restaurant.photo_reference && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
            alt={restaurant.name}
            className="h-24 w-24 shrink-0 rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-serif text-lg font-semibold tracking-tight">{restaurant.name}</h2>
            
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

          <div className="mt-3">
            <Stars rating={review.rating_overall} size={18} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">{t("food")} <Stars rating={review.rating_food} size={12} /></span>
            <span className="flex items-center gap-1.5">{t("service")} <Stars rating={review.rating_service} size={12} /></span>
            <span className="flex items-center gap-1.5">{t("ambiance")} <Stars rating={review.rating_ambiance} size={12} /></span>
            <span className="flex items-center gap-1.5">{t("priceShort")} <Stars rating={review.rating_price} size={12} /></span>
          </div>

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

      {review.comment && (
        <div className="border-t border-border px-5 py-4">
          <p className="text-sm italic text-muted-foreground leading-relaxed line-clamp-3">
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>
      )}

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

// Pagination component - Amazon/Booking style
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("ellipsis");
      }
      
      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

type SortOption = "date-desc" | "date-asc" | "rating-desc" | "rating-asc";

interface HistoryContentProps {
  reviews: ReviewWithRestaurant[];
}

export default function HistoryContent({ reviews }: HistoryContentProps) {
  const t = useT();
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [ratingFilters, setRatingFilters] = useState<number[]>([]); // Multi-select
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

  // Toggle rating in multi-select
  const toggleRating = (rating: number) => {
    setRatingFilters((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
    setCurrentPage(1);
  };

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by rating (multi-select: show if matches ANY selected rating)
    if (ratingFilters.length > 0) {
      result = result.filter((r) => ratingFilters.includes(r.rating_overall));
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
  }, [reviews, ratingFilters, occasionFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setRatingFilters([]);
    setOccasionFilter(null);
    setCurrentPage(1);
  };

  // Count active filters (ratings count as 1 filter group if any selected)
  const activeFilterCount = (ratingFilters.length > 0 ? 1 : 0) + (occasionFilter !== null ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{t("myHistory")}</h1>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Filter button */}
            <button
              type="button"
              onClick={() => {
                setShowFilters(!showFilters);
                setShowSort(false);
              }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Filter size={16} />
              {t("filters")}
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort button */}
            <button
              type="button"
              onClick={() => {
                setShowSort(!showSort);
                setShowFilters(false);
              }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                showSort || sortBy !== "date-desc"
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpDown size={16} />
              {t("sort")}
            </button>
          </div>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && reviews.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          {/* Rating filter - multi-select exact values */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("rating")}</p>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => toggleRating(rating)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    ratingFilters.includes(rating)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <Star size={14} className="text-primary" fill="currentColor" />
                  {rating}
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
                  setCurrentPage(1);
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
                    setCurrentPage(1);
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

      {/* Sort panel */}
      {showSort && reviews.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
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
                  setCurrentPage(1);
                  setShowSort(false);
                }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  sortBy === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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

          {/* Pagination - Amazon/Booking style */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
