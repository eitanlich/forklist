"use client";

import Link from "next/link";
import { Star, MapPin, Calendar, User } from "lucide-react";
import type { FeedReview } from "@/lib/actions/follows";

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

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return "just now";
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

interface FeedCardProps {
  review: FeedReview;
}

export function FeedCard({ review }: FeedCardProps) {
  const { user, restaurant } = review;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:bg-card/80">
      {/* Header: user info */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <Link
          href={user.username ? `/u/${user.username}` : "#"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
        >
          <User size={18} strokeWidth={1.5} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={user.username ? `/u/${user.username}` : "#"}
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            @{user.username ?? "anonymous"}
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatRelativeDate(review.created_at)}
          </p>
        </div>
      </div>

      {/* Main content */}
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
          <Link href={`/review/${review.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-serif text-lg font-semibold tracking-tight">
              {restaurant.name}
            </h3>
          </Link>

          {restaurant.city && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={13} strokeWidth={1.5} />
              {restaurant.city}
            </div>
          )}

          <div className="mt-3">
            <Stars rating={review.rating_overall} size={18} />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar size={13} strokeWidth={1.5} />
            Visited {new Date(review.visited_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Comment if present */}
      {review.comment && (
        <div className="border-t border-border px-5 py-4">
          <p className="text-sm italic text-muted-foreground leading-relaxed line-clamp-3">
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>
      )}
    </article>
  );
}
