"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Globe,
  Phone,
  Instagram,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Heart,
  ExternalLink,
} from "lucide-react";
import type { RestaurantWithReviews } from "@/lib/actions/restaurants";
import { useT, useI18n } from "@/lib/i18n";
import { toggleLike } from "@/lib/actions/likes";

interface Props {
  restaurant: RestaurantWithReviews;
}

function PriceLevel({ level }: { level: number | null }) {
  if (level === null) return null;
  const symbols = ["", "$", "$$", "$$$", "$$$$"];
  return (
    <span className="text-muted-foreground">
      {symbols[level] || ""}
    </span>
  );
}

function OpenStatus({ openingHours }: { openingHours: RestaurantWithReviews["opening_hours"] }) {
  if (!openingHours) return null;
  
  const isOpen = openingHours.open_now;
  
  if (isOpen === null || isOpen === undefined) return null;
  
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`h-2 w-2 rounded-full ${
          isOpen ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className={isOpen ? "text-green-600" : "text-red-600"}>
        {isOpen ? "Open now" : "Closed"}
      </span>
    </div>
  );
}

function ActionButton({
  href,
  icon: Icon,
  label,
  external = false,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  external?: boolean;
}) {
  const Component = external ? "a" : Link;
  const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  
  return (
    <Component
      href={href}
      {...extraProps}
      className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary p-3 transition-colors hover:bg-secondary/80"
    >
      <Icon size={20} className="text-primary" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </Component>
  );
}

function ReviewCard({
  review,
  locale,
}: {
  review: RestaurantWithReviews["reviews"][0];
  locale: string;
}) {
  const [liked, setLiked] = useState(review.liked_by_me);
  const [likeCount, setLikeCount] = useState(review.like_count);
  const [isLiking, setIsLiking] = useState(false);

  async function handleLike() {
    if (isLiking) return;
    setIsLiking(true);
    
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    
    const result = await toggleLike(review.id);
    
    if ("error" in result) {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
    
    setIsLiking(false);
  }

  const visitDate = new Date(review.visited_at);
  const formattedDate = visitDate.toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US",
    { month: "short", day: "numeric" }
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <Link
          href={`/u/${review.user.username}`}
          className="flex items-center gap-3"
        >
          {review.user.avatar_url ? (
            <img
              src={review.user.avatar_url}
              alt={review.user.username || "User"}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-muted-foreground">
              {(review.user.username || "U")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium">@{review.user.username}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-1">
          <Star size={16} className="text-primary" fill="currentColor" />
          <span className="font-semibold">{review.rating_overall}</span>
        </div>
      </div>
      
      {review.comment && (
        <p className="mt-3 text-sm text-foreground/90 line-clamp-3">
          {review.comment}
        </p>
      )}
      
      <div className="mt-3 flex items-center justify-between">
        <Link
          href={`/review/${review.id}`}
          className="text-xs text-primary hover:underline"
        >
          View full review
        </Link>
        
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
        >
          <Heart
            size={16}
            className={liked ? "text-red-500" : ""}
            fill={liked ? "currentColor" : "none"}
          />
          {likeCount > 0 && (
            <span className="text-xs">{likeCount}</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function RestaurantPageContent({ restaurant }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [showHours, setShowHours] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero image */}
      {restaurant.photo_reference && (
        <div className="relative -mx-4 -mt-4 h-48 sm:mx-0 sm:mt-0 sm:rounded-2xl sm:overflow-hidden">
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}&maxWidth=800`}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Restaurant info */}
      <div className="space-y-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">{restaurant.name}</h1>
          
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {restaurant.average_rating && (
              <div className="flex items-center gap-1">
                <Star size={16} className="text-primary" fill="currentColor" />
                <span className="font-semibold">
                  {restaurant.average_rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({restaurant.review_count} {restaurant.review_count === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
            
            <PriceLevel level={restaurant.price_level} />
            
            {restaurant.cuisine_type && (
              <span className="capitalize text-muted-foreground">
                {restaurant.cuisine_type}
              </span>
            )}
          </div>
          
          {restaurant.city && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={14} />
              <span>{restaurant.city}</span>
            </div>
          )}
          
          <div className="mt-2">
            <OpenStatus openingHours={restaurant.opening_hours} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-5 gap-2">
          {restaurant.instagram && (
            <ActionButton
              href={`https://instagram.com/${restaurant.instagram}`}
              icon={Instagram}
              label="Instagram"
              external
            />
          )}
          
          {restaurant.google_maps_url && (
            <ActionButton
              href={restaurant.google_maps_url}
              icon={MapPin}
              label="Maps"
              external
            />
          )}
          
          {restaurant.website && !restaurant.website.includes("instagram.com") && (
            <ActionButton
              href={restaurant.website}
              icon={Globe}
              label="Website"
              external
            />
          )}
          
          {restaurant.phone && (
            <ActionButton
              href={`tel:${restaurant.phone}`}
              icon={Phone}
              label="Call"
            />
          )}
          
          <ActionButton
            href={`/add?placeId=${restaurant.google_place_id}`}
            icon={Plus}
            label="Log visit"
          />
        </div>

        {/* Opening hours */}
        {restaurant.opening_hours?.weekday_text && restaurant.opening_hours.weekday_text.length > 0 && (
          <div className="rounded-xl border border-border bg-card">
            <button
              onClick={() => setShowHours(!showHours)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="font-medium">Hours</span>
              </div>
              {showHours ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </button>
            
            {showHours && (
              <div className="border-t border-border px-4 pb-4">
                <ul className="mt-3 space-y-1.5 text-sm">
                  {restaurant.opening_hours.weekday_text.map((line, i) => (
                    <li key={i} className="text-muted-foreground">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">
            Reviews on ForkList
          </h2>
          {restaurant.review_count === 0 && (
            <Link
              href={`/add?placeId=${restaurant.google_place_id}`}
              className="text-sm text-primary hover:underline"
            >
              Be the first to review
            </Link>
          )}
        </div>

        {restaurant.reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to share your experience!
            </p>
            <Link
              href={`/add?placeId=${restaurant.google_place_id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={16} />
              Log a visit
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {restaurant.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
