"use client";

import Link from "next/link";
import { Heart, User, Star, MapPin } from "lucide-react";
import type { PopularReview } from "@/lib/actions/explore";

interface PopularReviewCardProps {
  review: PopularReview;
}

export function PopularReviewCard({ review }: PopularReviewCardProps) {
  const { user, restaurant, rating_overall, comment, like_count } = review;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* User info */}
      <div className="flex items-center gap-3">
        <Link href={`/u/${user.username}`} className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-secondary">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`${user.username}'s avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <span className="font-medium text-sm text-foreground">
            @{user.username}
          </span>
        </Link>
      </div>

      {/* Restaurant info */}
      <div>
        <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
        {restaurant.city && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin size={12} />
            {restaurant.city}
          </p>
        )}
      </div>

      {/* Rating and comment */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1">
          <Star size={14} className="fill-primary text-primary" />
          <span className="text-sm font-medium text-primary">
            {rating_overall.toFixed(1)}
          </span>
        </div>
        {like_count > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart size={14} className="fill-destructive text-destructive" />
            <span className="text-sm">{like_count}</span>
          </div>
        )}
      </div>

      {/* Comment preview */}
      {comment && (
        <p className="text-sm text-muted-foreground line-clamp-2">{comment}</p>
      )}
    </div>
  );
}
