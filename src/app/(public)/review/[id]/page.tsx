import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicReview } from "@/lib/actions/reviews";
import { Star, MapPin, Calendar, Globe, User } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const review = await getPublicReview(id);

  if (!review) {
    return {
      title: "Review Not Found - ForkList",
    };
  }

  const restaurant = review.restaurant as any;
  const user = review.user as any;
  const username = user?.username || "Someone";
  
  const title = `${restaurant.name} - Review by @${username} | ForkList`;
  const description = review.comment 
    ? `"${review.comment.slice(0, 150)}${review.comment.length > 150 ? "..." : ""}" - ${review.rating_overall}/5 stars`
    : `${username} rated ${restaurant.name} ${review.rating_overall}/5 stars on ForkList`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://forklist.app";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${baseUrl}/review/${id}`,
      siteName: "ForkList",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
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

export default async function PublicReviewPage({ params }: Props) {
  const { id } = await params;
  const review = await getPublicReview(id);

  if (!review) {
    notFound();
  }

  const restaurant = review.restaurant as any;
  const user = review.user as any;
  const visitDate = new Date(review.visited_at);

  const OCCASION_LABELS: Record<string, string> = {
    date: "Date Night",
    family: "Family",
    friends: "Friends",
    business: "Business",
    solo: "Solo",
    other: "Other",
  };

  const MEAL_TYPE_LABELS: Record<string, string> = {
    breakfast: "Breakfast",
    brunch: "Brunch",
    lunch: "Lunch",
    snack: "Snack",
    dinner: "Dinner",
    drinks: "Drinks",
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
        {/* Restaurant Card */}
        <article className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Restaurant Image */}
          {restaurant.photo_reference && (
            <div className="aspect-video w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            {/* Restaurant Name & Location */}
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              {restaurant.name}
            </h1>
            {restaurant.city && (
              <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                <MapPin size={14} strokeWidth={1.5} />
                <span>{restaurant.city}</span>
              </div>
            )}

            {/* Overall Rating */}
            <div className="mt-4">
              <Stars rating={review.rating_overall} size={24} />
            </div>

            {/* Detailed Ratings */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                Food <Stars rating={review.rating_food} size={12} />
              </span>
              <span className="flex items-center gap-1.5">
                Service <Stars rating={review.rating_service} size={12} />
              </span>
              <span className="flex items-center gap-1.5">
                Ambiance <Stars rating={review.rating_ambiance} size={12} />
              </span>
              <span className="flex items-center gap-1.5">
                Price <Stars rating={review.rating_price} size={12} />
              </span>
            </div>

            {/* Meta Info */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar size={14} strokeWidth={1.5} />
                {visitDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              {review.meal_type && (
                <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                  {MEAL_TYPE_LABELS[review.meal_type] ?? review.meal_type}
                </span>
              )}
              {review.occasion && (
                <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                  {OCCASION_LABELS[review.occasion] ?? review.occasion}
                </span>
              )}
            </div>

            {/* Comment */}
            {review.comment && (
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-foreground/90 leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>
            )}

            {/* Restaurant Links */}
            {(restaurant.google_maps_url || restaurant.website) && (
              <div className="mt-6 flex items-center gap-2">
                {restaurant.google_maps_url && (
                  <a
                    href={restaurant.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <MapPin size={14} strokeWidth={1.5} />
                    View on Maps
                  </a>
                )}
                {restaurant.website && (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <Globe size={14} strokeWidth={1.5} />
                    Website
                  </a>
                )}
              </div>
            )}

            {/* Reviewer */}
            {user?.username && (
              <div className="mt-6 border-t border-border pt-6">
                <Link
                  href={`/u/${user.username}`}
                  className="flex items-center gap-3 group"
                >
                  {user.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <User size={18} className="text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewed by</p>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      @{user.username}
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </article>

        {/* Footer / CTA */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Track your own restaurant experiences
          </p>
          <a
            href="/"
            className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start your ForkList
          </a>
        </div>
      </div>
    </div>
  );
}
