import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReviewWithRestaurant } from "@/types";
import { BookOpen, MapPin, Calendar, Star } from "lucide-react";
import Link from "next/link";

// Don't cache this page - always fetch fresh data
export const dynamic = "force-dynamic";

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
          <h2 className="font-serif text-lg font-semibold tracking-tight">{restaurant.name}</h2>

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
            <span className="flex items-center gap-1.5">Food <Stars rating={review.rating_food} size={12} /></span>
            <span className="flex items-center gap-1.5">Service <Stars rating={review.rating_service} size={12} /></span>
            <span className="flex items-center gap-1.5">Ambiance <Stars rating={review.rating_ambiance} size={12} /></span>
            <span className="flex items-center gap-1.5">Price <Stars rating={review.rating_price} size={12} /></span>
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
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">My History</h1>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <div className="space-y-2">
            <p className="text-lg font-medium">No reviews yet</p>
            <p className="text-base text-muted-foreground">
              Start logging your restaurant visits
            </p>
          </div>
          <Link
            href="/add"
            className="mt-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
          >
            Log your first visit
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
