"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Star, MapPin } from "lucide-react";
import type { ReviewWithRestaurant, Occasion } from "@/types";
import { updateReview } from "@/lib/actions/reviews";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

function StarRating({
  label,
  value,
  onChange,
  size = "sm",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  size?: "lg" | "sm";
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const starSize = size === "lg" ? 32 : 24;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-muted-foreground ${size === "lg" ? "text-base" : "text-sm"}`}>
          {label}
        </span>
        {value > 0 && (
          <span className={`font-semibold text-primary ${size === "lg" ? "text-xl" : "text-sm"}`}>
            {value}
          </span>
        )}
      </div>
      <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="transition-transform duration-100 hover:scale-110 active:scale-95"
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              size={starSize}
              className={active >= star ? "text-primary" : "text-muted-foreground/30"}
              fill={active >= star ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: "date", label: "Date Night" },
  { value: "friends", label: "Friends" },
  { value: "family", label: "Family" },
  { value: "business", label: "Business" },
  { value: "solo", label: "Solo" },
  { value: "other", label: "Other" },
];

export default function EditReviewForm({ review }: { review: ReviewWithRestaurant }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [ratings, setRatings] = useState({
    overall: review.rating_overall,
    food: review.rating_food,
    service: review.rating_service,
    ambiance: review.rating_ambiance,
    price: review.rating_price,
  });
  const [occasion, setOccasion] = useState<Occasion | undefined>(review.occasion ?? undefined);
  const [comment, setComment] = useState(review.comment ?? "");
  // Parse date from string to Date object
  const [visitedAt, setVisitedAt] = useState<Date | undefined>(
    review.visited_at ? new Date(review.visited_at + 'T00:00:00') : undefined
  );

  const allRated = Object.values(ratings).every((r) => r > 0);

  function setRating(key: keyof typeof ratings, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!allRated) return;
    if (!visitedAt) {
      setError("Please select a date");
      return;
    }
    setError(null);

    const formattedDate = format(visitedAt, "yyyy-MM-dd");
    console.log("Submitting with date:", formattedDate);

    startTransition(async () => {
      try {
        const result = await updateReview(review.id, {
          rating_overall: ratings.overall,
          rating_food: ratings.food,
          rating_service: ratings.service,
          rating_ambiance: ratings.ambiance,
          rating_price: ratings.price,
          comment: comment.trim() || undefined,
          occasion,
          visited_at: formattedDate,
        });

        if ("error" in result) {
          setError(result.error);
        } else {
          // Use window.location for more reliable redirect
          window.location.href = "/history";
        }
      } catch (err) {
        console.error("Update error:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  const { restaurant } = review;

  return (
    <div className="space-y-6">
      {/* Back + restaurant card */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          {restaurant.photo_reference && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
              alt={restaurant.name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold leading-snug">{restaurant.name}</p>
            {restaurant.city && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={11} />
                {restaurant.city}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Overall rating */}
      <div className="rounded-xl border border-border bg-card p-5">
        <StarRating
          label="Overall"
          value={ratings.overall}
          onChange={(v) => setRating("overall", v)}
          size="lg"
        />
      </div>

      {/* Sub-ratings */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <StarRating label="Food" value={ratings.food} onChange={(v) => setRating("food", v)} />
        <StarRating label="Service" value={ratings.service} onChange={(v) => setRating("service", v)} />
        <StarRating label="Ambiance" value={ratings.ambiance} onChange={(v) => setRating("ambiance", v)} />
        <StarRating label="Price / Value" value={ratings.price} onChange={(v) => setRating("price", v)} />
      </div>

      {/* Occasion */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Occasion</p>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setOccasion((prev) => (prev === value ? undefined : value))}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-150 ${
                occasion === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm text-muted-foreground">
          Notes <span className="text-xs">(optional)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="What stood out? Anything you'd recommend?"
          className="w-full resize-none rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Date visited</p>
        <DatePicker
          value={visitedAt}
          onChange={setVisitedAt}
          maxDate={new Date()}
          placeholder="Select date"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allRated || isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-semibold text-primary-foreground transition-opacity duration-200 disabled:opacity-40"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}
