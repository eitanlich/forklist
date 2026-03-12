"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, MapPin, Star } from "lucide-react";
import type { ReviewWithRestaurant } from "@/types";
import { deleteReview } from "@/lib/actions/reviews";
import { useT, useI18n } from "@/lib/i18n";

export default function DeleteReviewForm({ review }: { review: ReviewWithRestaurant }) {
  const router = useRouter();
  const t = useT();
  const { locale } = useI18n();
  const [error, setError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteReview(review.id);

      if ("error" in result) {
        setError(result.error);
        setIsDeleting(false);
        return;
      }
      
      // Success - force full navigation
      window.location.href = "/history";
    } catch {
      setError("Failed to delete review");
      setIsDeleting(false);
    }
  }

  const { restaurant } = review;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{t("deleteReview")}</h1>
      
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {t("back")}
      </button>

      {/* Warning */}
      <div className="flex items-start gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-medium text-foreground">{t("areYouSure")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("deleteWarning")}
          </p>
        </div>
      </div>

      {/* Review card preview */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex gap-4">
          {restaurant.photo_reference && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
              alt={restaurant.name}
              className="h-20 w-20 shrink-0 rounded-lg object-cover opacity-60"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold">{restaurant.name}</p>
            {restaurant.city && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={11} />
                {restaurant.city}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={review.rating_overall >= star ? "text-primary" : "text-muted-foreground/25"}
                  fill={review.rating_overall >= star ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("visited")} {new Date(review.visited_at).toLocaleDateString(locale === "es" ? "es-ES" : "en-US")}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-border bg-secondary py-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-4 text-sm font-semibold text-destructive-foreground transition-opacity duration-200 disabled:opacity-40"
        >
          {isDeleting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t("deleting")}
            </>
          ) : (
            t("deleteReview")
          )}
        </button>
      </div>
    </div>
  );
}
