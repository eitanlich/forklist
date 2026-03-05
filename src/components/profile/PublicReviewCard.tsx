"use client";

import Link from "next/link";
import { Star, MapPin, Calendar } from "lucide-react";
import { LikeButton } from "@/components/ui/LikeButton";

interface PublicReviewCardProps {
  review: {
    id: string;
    rating_overall: number;
    rating_food: number;
    rating_service: number;
    rating_ambiance: number;
    rating_price: number;
    comment: string | null;
    occasion: string | null;
    meal_type: string | null;
    visited_at: string;
    restaurant: {
      id: string;
      name: string;
      address: string | null;
      city: string | null;
      photo_reference: string | null;
      cuisine_type: string | null;
      google_maps_url: string | null;
    };
  };
  likeCount?: number;
  hasLiked?: boolean;
}

export function PublicReviewCard({ review, likeCount = 0, hasLiked = false }: PublicReviewCardProps) {
  const { restaurant } = review;
  const visitDate = new Date(review.visited_at);

  return (
    <div className="rounded-xl border border-border bg-card transition-all hover:bg-card/80 hover:border-primary/30">
      <Link 
        href={`/review/${review.id}`}
        className="block p-4"
      >
        <div className="flex gap-4">
          {/* Restaurant Image */}
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
            {restaurant.photo_reference ? (
              <img
                src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <MapPin className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-serif text-lg font-medium text-foreground">
                  {restaurant.name}
                </h3>
                {restaurant.city && (
                  <p className="truncate text-sm text-muted-foreground">
                    {restaurant.city}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-sm font-medium text-primary">
                  {review.rating_overall.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {visitDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {review.meal_type && (
                <span className="capitalize">{review.meal_type}</span>
              )}
              {review.occasion && (
                <span className="capitalize">{review.occasion}</span>
              )}
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                {review.comment}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center border-t border-border px-4 py-2">
        <LikeButton
          reviewId={review.id}
          initialLiked={hasLiked}
          initialCount={likeCount}
          size="sm"
        />
      </div>
    </div>
  );
}
