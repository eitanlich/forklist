import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReviewWithRestaurant } from "@/types";
import { BookOpen, MapPin, Calendar, Star } from "lucide-react";
import Link from "next/link";

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const OCCASION_LABELS: Record<string, string> = {
  date: "Date Night",
  family: "Family",
  friends: "Friends",
  business: "Business",
  solo: "Solo",
  other: "Other",
};

function ReviewCard({ review }: { review: ReviewWithRestaurant }) {
  const { restaurant } = review;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex gap-4 p-4">
        {/* Photo */}
        {restaurant.photo_reference && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
            alt={restaurant.name}
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
          />
        )}

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold leading-snug">{restaurant.name}</h2>

          {restaurant.city && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={11} />
              {restaurant.city}
            </div>
          )}

          {/* Overall stars */}
          <div className="mt-2">
            <Stars rating={review.rating_overall} size={16} />
          </div>

          {/* Sub-ratings */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Food <Stars rating={review.rating_food} size={10} /></span>
            <span>Service <Stars rating={review.rating_service} size={10} /></span>
            <span>Ambiance <Stars rating={review.rating_ambiance} size={10} /></span>
            <span>Price <Stars rating={review.rating_price} size={10} /></span>
          </div>

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar size={11} />
              {formatDate(review.visited_at)}
            </div>
            {review.occasion && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {OCCASION_LABELS[review.occasion] ?? review.occasion}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm italic text-muted-foreground line-clamp-3">
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>
      )}
    </article>
  );
}

export default async function HistoryPage() {
  const { userId: clerkId } = await auth();

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId!)
    .single();

  const reviews: ReviewWithRestaurant[] = [];

  if (user) {
    const { data } = await supabase
      .from("reviews")
      .select("*, restaurant:restaurants(*)")
      .eq("user_id", user.id)
      .order("visited_at", { ascending: false });

    if (data) reviews.push(...(data as ReviewWithRestaurant[]));
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">My History</h1>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start logging your restaurant visits
            </p>
          </div>
          <Link
            href="/add"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Log your first visit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
