"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import type { PlaceSuggestion, Occasion } from "@/types";
import { createReview } from "@/lib/actions/reviews";
import type { ReviewInput } from "@/lib/validations/review";

// Star rating — 1-5, with hover preview
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
        <span
          className={`text-muted-foreground ${size === "lg" ? "text-base" : "text-sm"}`}
        >
          {label}
        </span>
        {value > 0 && (
          <span
            className={`font-semibold text-primary ${size === "lg" ? "text-xl" : "text-sm"}`}
          >
            {value}.0
          </span>
        )}
      </div>
      <div
        className="flex gap-1"
        onMouseLeave={() => setHovered(0)}
      >
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
              className={
                active >= star ? "text-primary" : "text-muted-foreground/30"
              }
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

interface ReviewFormProps {
  restaurant: PlaceSuggestion;
  onBack: () => void;
}

export default function ReviewForm({ restaurant, onBack }: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [ratings, setRatings] = useState({
    overall: 0,
    food: 0,
    service: 0,
    ambiance: 0,
    price: 0,
  });
  const [occasion, setOccasion] = useState<Occasion | undefined>(undefined);
  const [comment, setComment] = useState("");
  const [visitedAt, setVisitedAt] = useState(
    new Date().toISOString().split("T")[0]
  );

  const allRated = Object.values(ratings).every((r) => r > 0);

  function setRating(key: keyof typeof ratings, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!allRated) return;
    setError(null);

    const data: ReviewInput = {
      google_place_id: restaurant.place_id,
      restaurant_name: restaurant.name,
      restaurant_address: restaurant.formatted_address,
      restaurant_city: restaurant.city,
      restaurant_lat: restaurant.lat,
      restaurant_lng: restaurant.lng,
      restaurant_photo_reference: restaurant.photo_reference,
      restaurant_cuisine_type: restaurant.cuisine_type,
      restaurant_website: restaurant.website,
      restaurant_google_maps_url: restaurant.google_maps_url,
      rating_overall: ratings.overall,
      rating_food: ratings.food,
      rating_service: ratings.service,
      rating_ambiance: ratings.ambiance,
      rating_price: ratings.price,
      comment: comment.trim() || undefined,
      occasion,
      visited_at: visitedAt,
    };

    startTransition(async () => {
      const result = await createReview(data);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.push("/history");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back + restaurant card */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Change restaurant
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
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {restaurant.formatted_address}
            </p>
            {restaurant.cuisine_type && (
              <span className="mt-1.5 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-muted-foreground">
                {restaurant.cuisine_type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overall rating — larger stars */}
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
        <StarRating
          label="Food"
          value={ratings.food}
          onChange={(v) => setRating("food", v)}
        />
        <StarRating
          label="Service"
          value={ratings.service}
          onChange={(v) => setRating("service", v)}
        />
        <StarRating
          label="Ambiance"
          value={ratings.ambiance}
          onChange={(v) => setRating("ambiance", v)}
        />
        <StarRating
          label="Price / Value"
          value={ratings.price}
          onChange={(v) => setRating("price", v)}
        />
      </div>

      {/* Occasion */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Occasion</p>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setOccasion((prev) => (prev === value ? undefined : value))
              }
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
        <label htmlFor="date" className="text-sm text-muted-foreground">
          Date visited
        </label>
        <input
          id="date"
          type="date"
          value={visitedAt}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          "Save Review"
        )}
      </button>

      {!allRated && (
        <p className="text-center text-xs text-muted-foreground">
          Rate all 5 categories to save
        </p>
      )}
    </div>
  );
}
