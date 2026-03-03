"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  Utensils,
  Users,
  Globe,
  ExternalLink,
  Pencil,
  Trash2
} from "lucide-react";
import { useT, useI18n } from "@/lib/i18n";
import { deleteReview } from "@/lib/actions/reviews";

interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  photo_reference: string | null;
  cuisine_type: string | null;
  google_maps_url: string | null;
  website: string | null;
}

interface Review {
  id: string;
  user_id: string;
  rating_overall: number;
  rating_food: number | null;
  rating_service: number | null;
  rating_ambiance: number | null;
  rating_price: number | null;
  comment: string | null;
  occasion: string | null;
  meal_type: string | null;
  visited_at: string;
  created_at: string;
  restaurant: Restaurant | Restaurant[];
}

interface ReviewDetailContentProps {
  review: Review;
  isOwner: boolean;
}

export function ReviewDetailContent({ review, isOwner }: ReviewDetailContentProps) {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const restaurant = Array.isArray(review.restaurant) 
    ? review.restaurant[0] 
    : review.restaurant;

  const photoUrl = restaurant?.photo_reference
    ? `/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`
    : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  const handleDelete = async () => {
    const confirmMsg = locale === "es" 
      ? "¿Seguro que querés eliminar esta review?" 
      : "Are you sure you want to delete this review?";
    
    if (!confirm(confirmMsg)) return;

    setDeleting(true);
    const result = await deleteReview(review.id);
    
    if ("error" in result) {
      alert(result.error);
      setDeleting(false);
    } else {
      router.push("/history");
    }
  };

  const ratingItems = [
    { key: "food", label: t("food"), value: review.rating_food },
    { key: "service", label: t("service"), value: review.rating_service },
    { key: "ambiance", label: t("ambiance"), value: review.rating_ambiance },
    { key: "price", label: locale === "es" ? "Valor" : "Value", value: review.rating_price },
  ].filter(item => item.value !== null);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={20} />
        <span>{locale === "es" ? "Volver" : "Back"}</span>
      </button>

      {/* Restaurant photo */}
      {photoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-secondary">
          <img
            src={photoUrl}
            alt={restaurant?.name || "Restaurant"}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Restaurant info */}
      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold">{restaurant?.name}</h1>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {restaurant?.city && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {restaurant.city}
              {restaurant.country && `, ${restaurant.country}`}
            </span>
          )}
          {restaurant?.cuisine_type && (
            <span className="flex items-center gap-1">
              <Utensils size={14} />
              {restaurant.cuisine_type}
            </span>
          )}
        </div>

        {/* External links */}
        <div className="flex gap-3 pt-2">
          {restaurant?.google_maps_url && (
            <a
              href={restaurant.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <MapPin size={14} />
              Google Maps
              <ExternalLink size={12} />
            </a>
          )}
          {restaurant?.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Globe size={14} />
              Website
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Overall rating */}
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <span className="text-xl font-bold">{review.rating_overall}</span>
        </div>
        <div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= review.rating_overall ? "text-primary fill-primary" : "text-muted-foreground"}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("overallRating")}
          </p>
        </div>
      </div>

      {/* Detailed ratings */}
      {ratingItems.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {ratingItems.map((item) => (
            <div key={item.key} className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-primary fill-primary" />
                  <span className="font-semibold">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visit details */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
          <Calendar size={14} className="text-muted-foreground" />
          <span>{formatDate(review.visited_at)}</span>
        </div>
        {review.meal_type && (
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
            <Utensils size={14} className="text-muted-foreground" />
            <span>{review.meal_type}</span>
          </div>
        )}
        {review.occasion && (
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
            <Users size={14} className="text-muted-foreground" />
            <span>{review.occasion}</span>
          </div>
        )}
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm leading-relaxed">{review.comment}</p>
        </div>
      )}

      {/* Owner actions */}
      {isOwner && (
        <div className="flex gap-3 pt-4 border-t border-border">
          <Link
            href={`/review/${review.id}/edit`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Pencil size={16} />
            {locale === "es" ? "Editar" : "Edit"}
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting 
              ? (locale === "es" ? "Eliminando..." : "Deleting...") 
              : (locale === "es" ? "Eliminar" : "Delete")}
          </button>
        </div>
      )}
    </div>
  );
}
