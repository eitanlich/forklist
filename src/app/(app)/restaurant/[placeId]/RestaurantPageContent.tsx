"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useI18n, useT } from "@/lib/i18n";
import { toggleLike } from "@/lib/actions/likes";

interface GoogleData {
  google_place_id: string;
  name: string;
  address: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  photo_reference: string | null;
  cuisine_type: string | null;
  website: string | null;
  google_maps_url: string | null;
  phone: string | null;
  price_level: number | null;
  opening_hours: {
    open_now?: boolean | null;
    weekday_text?: string[];
  } | null;
  instagram: string | null;
}

interface Review {
  id: string;
  rating_overall: number;
  comment: string | null;
  visited_at: string;
  user: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  like_count: number;
  liked_by_me: boolean;
}

interface Props {
  googlePlaceId: string;
  googleData: GoogleData;
}

function PriceLevel({ level }: { level: number | null }) {
  if (level === null) return null;
  const symbols = ["", "$", "$$", "$$$", "$$$$"];
  return <span className="text-muted-foreground">{symbols[level] || ""}</span>;
}

function OpenStatus({ openingHours, t }: { openingHours: GoogleData["opening_hours"]; t: ReturnType<typeof useT> }) {
  if (!openingHours || openingHours.open_now === null || openingHours.open_now === undefined) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2 w-2 rounded-full ${openingHours.open_now ? "bg-green-500" : "bg-red-500"}`} />
      <span className={openingHours.open_now ? "text-green-600" : "text-red-600"}>
        {openingHours.open_now ? t("openNow") : t("closed")}
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

function ReviewCard({ review, locale, t }: { review: Review; locale: string; t: ReturnType<typeof useT> }) {
  const [liked, setLiked] = useState(review.liked_by_me);
  const [likeCount, setLikeCount] = useState(review.like_count);
  const [isLiking, setIsLiking] = useState(false);

  async function handleLike() {
    if (isLiking) return;
    setIsLiking(true);
    
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    
    const result = await toggleLike(review.id);
    if ("error" in result) {
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
        <Link href={`/u/${review.user.username}`} className="flex items-center gap-3">
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
        <p className="mt-3 text-sm text-foreground/90 line-clamp-3">{review.comment}</p>
      )}
      
      <div className="mt-3 flex items-center justify-between">
        <Link href={`/review/${review.id}`} className="text-xs text-primary hover:underline">
          {t("viewFullReview")}
        </Link>
        
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
        >
          <Heart size={16} className={liked ? "text-red-500" : ""} fill={liked ? "currentColor" : "none"} />
          {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
        </button>
      </div>
    </div>
  );
}

// Translate day names from English to Spanish
function translateHours(text: string, locale: string): string {
  if (locale !== "es") return text;
  
  const dayTranslations: Record<string, string> = {
    "Monday": "Lunes",
    "Tuesday": "Martes",
    "Wednesday": "Miércoles",
    "Thursday": "Jueves",
    "Friday": "Viernes",
    "Saturday": "Sábado",
    "Sunday": "Domingo",
    "Closed": "Cerrado",
    "Open 24 hours": "Abierto 24 horas",
  };
  
  let translated = text;
  for (const [en, es] of Object.entries(dayTranslations)) {
    translated = translated.replace(en, es);
  }
  return translated;
}

export default function RestaurantPageContent({ googlePlaceId, googleData }: Props) {
  const { locale } = useI18n();
  const t = useT();
  const [showHours, setShowHours] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch ForkList reviews for this restaurant
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/restaurants/reviews?placeId=${googlePlaceId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews ?? []);
          setAvgRating(data.avgRating ?? null);
        }
      } catch {
        // No reviews or error
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [googlePlaceId]);

  // Count action buttons to show
  const actionButtons = [
    googleData.instagram && { href: `https://instagram.com/${googleData.instagram}`, icon: Instagram, label: "Instagram", external: true },
    googleData.google_maps_url && { href: googleData.google_maps_url, icon: MapPin, label: t("maps"), external: true },
    googleData.website && !googleData.website.includes("instagram.com") && { href: googleData.website, icon: Globe, label: t("website"), external: true },
    googleData.phone && { href: `tel:${googleData.phone}`, icon: Phone, label: t("call"), external: false },
    { href: `/add?placeId=${googlePlaceId}`, icon: Plus, label: t("logAVisit"), external: false },
  ].filter(Boolean) as { href: string; icon: any; label: string; external: boolean }[];

  return (
    <div className="space-y-6">
      {/* Hero image */}
      {googleData.photo_reference && (
        <div className="relative -mx-4 -mt-4 h-48 sm:mx-0 sm:mt-0 sm:rounded-2xl sm:overflow-hidden">
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(googleData.photo_reference)}&maxWidth=800`}
            alt={googleData.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Restaurant info */}
      <div className="space-y-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">{googleData.name}</h1>
          
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {avgRating && (
              <div className="flex items-center gap-1">
                <Star size={16} className="text-primary" fill="currentColor" />
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? t("review") : t("reviews")})
                </span>
              </div>
            )}
            
            <PriceLevel level={googleData.price_level} />
            
            {googleData.cuisine_type && (
              <span className="capitalize text-muted-foreground">{googleData.cuisine_type}</span>
            )}
          </div>
          
          {googleData.city && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={14} />
              <span>{googleData.city}</span>
            </div>
          )}
          
          <div className="mt-2">
            <OpenStatus openingHours={googleData.opening_hours} t={t} />
          </div>
        </div>

        {/* Action buttons */}
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(actionButtons.length, 5)}, 1fr)` }}>
          {actionButtons.map((btn) => (
            <ActionButton key={btn.label} {...btn} />
          ))}
        </div>

        {/* Opening hours */}
        {googleData.opening_hours?.weekday_text && googleData.opening_hours.weekday_text.length > 0 && (
          <div className="rounded-xl border border-border bg-card">
            <button
              onClick={() => setShowHours(!showHours)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="font-medium">{t("hours")}</span>
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
                  {googleData.opening_hours.weekday_text.map((line, i) => (
                    <li key={i} className="text-muted-foreground">{translateHours(line, locale)}</li>
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
          <h2 className="font-serif text-xl font-semibold">{t("reviewsOnForkList")}</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
            <p className="text-muted-foreground">
              {t("noReviewsYetRestaurant")}
            </p>
            <Link
              href={`/add?placeId=${googlePlaceId}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={16} />
              {t("logAVisit")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} locale={locale} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
