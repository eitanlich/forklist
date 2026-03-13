"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapPin, Calendar, Globe, User, Pencil, Trash2, ArrowLeft, Share2, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/user";
import { deleteReview } from "@/lib/actions/reviews";
import { ShareModal } from "@/components/share/ShareModal";
import { toggleLike, getLikedBy, type LikeUser } from "@/lib/actions/likes";

interface ReviewContentProps {
  review: any;
  initialLikeInfo: { count: number; hasLiked: boolean };
  initialLikedBy: LikeUser[];
  initialTotalLikes: number;
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

export function ReviewContent({ 
  review, 
  initialLikeInfo,
  initialLikedBy,
  initialTotalLikes,
}: ReviewContentProps) {
  const { locale } = useI18n();
  const { user } = useUser();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Like state - initialized from server
  const [likeCount, setLikeCount] = useState(initialLikeInfo.count);
  const [hasLiked, setHasLiked] = useState(initialLikeInfo.hasLiked);
  const [likedByUsers, setLikedByUsers] = useState<LikeUser[]>(initialLikedBy);
  const [totalLikes, setTotalLikes] = useState(initialTotalLikes);

  // Refresh liked by list when like state changes
  const refreshLikedBy = async () => {
    const likedBy = await getLikedBy(review.id, 10);
    setLikedByUsers(likedBy.users);
    setTotalLikes(likedBy.total);
    setLikeCount(likedBy.total); // Keep count in sync
  };

  // Check if review is anonymized (private user, not authorized)
  const isAnonymized = review._isAnonymized === true;
  
  // Check ownership on client side (can't be owner if anonymized)
  const isOwner = !isAnonymized && user?.id === review.user_id;

  const restaurant = review.restaurant as any;
  const reviewUser = review.user as any;
  const visitDate = new Date(review.visited_at);

  const OCCASION_LABELS: Record<string, Record<string, string>> = {
    en: {
      date: "Date Night",
      family: "Family",
      friends: "Friends",
      business: "Business",
      solo: "Solo",
      delivery: "Delivery / Take Away",
      other: "Other",
    },
    es: {
      date: "Cita",
      family: "Familia",
      friends: "Amigos",
      business: "Negocios",
      solo: "Solo",
      delivery: "Delivery / Take Away",
      other: "Otro",
    },
  };

  const MEAL_TYPE_LABELS: Record<string, Record<string, string>> = {
    en: {
      breakfast: "Breakfast",
      brunch: "Brunch",
      lunch: "Lunch",
      snack: "Snack",
      dinner: "Dinner",
      drinks: "Drinks",
    },
    es: {
      breakfast: "Desayuno",
      brunch: "Brunch",
      lunch: "Almuerzo",
      snack: "Merienda",
      dinner: "Cena",
      drinks: "Tragos",
    },
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

      {/* Restaurant Card */}
      <article className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Restaurant Image */}
        {restaurant.photo_reference && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={`/api/places/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Restaurant Name & Location */}
          <Link
            href={`/restaurant/${restaurant.google_place_id}`}
            className="font-serif text-2xl font-semibold tracking-tight hover:text-primary transition-colors"
          >
            {restaurant.name}
          </Link>
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
              {locale === "es" ? "Comida" : "Food"} <Stars rating={review.rating_food} size={12} />
            </span>
            <span className="flex items-center gap-1.5">
              {locale === "es" ? "Servicio" : "Service"} <Stars rating={review.rating_service} size={12} />
            </span>
            <span className="flex items-center gap-1.5">
              {locale === "es" ? "Ambiente" : "Ambiance"} <Stars rating={review.rating_ambiance} size={12} />
            </span>
            <span className="flex items-center gap-1.5">
              {locale === "es" ? "Precio" : "Price"} <Stars rating={review.rating_price} size={12} />
            </span>
          </div>

          {/* Meta Info */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar size={14} strokeWidth={1.5} />
              {visitDate.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {review.meal_type && (
              <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                {MEAL_TYPE_LABELS[locale]?.[review.meal_type] ?? review.meal_type}
              </span>
            )}
            {review.occasion && (
              <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                {OCCASION_LABELS[locale]?.[review.occasion] ?? review.occasion}
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

          {/* Likes Section - hidden for anonymized reviews */}
          {!isAnonymized && (
          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center gap-4">
              {/* Like Button - inline to handle refresh */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  const wasLiked = hasLiked;
                  const prevCount = likeCount;
                  
                  // Optimistic update
                  setHasLiked(!wasLiked);
                  setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);
                  
                  const result = await toggleLike(review.id);
                  
                  if (result.error) {
                    // Revert on error
                    setHasLiked(wasLiked);
                    setLikeCount(prevCount);
                  } else {
                    // Refresh liked by list
                    await refreshLikedBy();
                  }
                }}
                className={`flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
                  hasLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive/70"
                }`}
              >
                <Heart
                  size={18}
                  strokeWidth={1.5}
                  className={hasLiked ? "fill-current" : ""}
                />
                {likeCount > 0 && (
                  <span className="text-sm font-medium tabular-nums">{likeCount}</span>
                )}
              </button>
              
              {/* Liked by users - only show if we have displayable users */}
              {likedByUsers.length > 0 && (() => {
                // Sort: put current user first if they liked
                const currentUserId = user?.id;
                const sortedUsers = [...likedByUsers].sort((a, b) => {
                  if (a.id === currentUserId) return -1;
                  if (b.id === currentUserId) return 1;
                  return 0;
                });
                const youText = locale === "es" ? "Yo" : "You";
                const andText = locale === "es" ? "y" : "and";
                const othersText = locale === "es" ? "más" : "others";
                
                const renderUserName = (u: LikeUser) => {
                  if (u.id === currentUserId) {
                    return <span className="font-medium">{youText}</span>;
                  }
                  return (
                    <Link href={`/u/${u.username}`} className="hover:text-foreground">
                      @{u.username}
                    </Link>
                  );
                };
                
                return (
                  <div className="flex items-center gap-2">
                    {/* Avatar stack */}
                    <div className="flex -space-x-2">
                      {sortedUsers.slice(0, 3).map((u) => (
                        <Link
                          key={u.id}
                          href={u.username ? `/u/${u.username}` : "#"}
                          className="relative h-7 w-7 rounded-full border-2 border-background overflow-hidden hover:z-10 transition-transform hover:scale-110"
                        >
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.username || ""} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary">
                              <User size={12} className="text-muted-foreground" />
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Names / count */}
                    <span className="text-sm text-muted-foreground">
                      {sortedUsers.length === 1 && sortedUsers[0]?.username ? (
                        renderUserName(sortedUsers[0])
                      ) : sortedUsers.length <= 3 ? (
                        sortedUsers.filter(u => u.username).map((u, i, arr) => (
                          <span key={u.id}>
                            {i > 0 && (i === arr.length - 1 ? ` ${andText} ` : ", ")}
                            {renderUserName(u)}
                          </span>
                        ))
                      ) : (
                        <>
                          {renderUserName(sortedUsers[0])}
                          {" "}{andText} {sortedUsers.length - 1} {othersText}
                        </>
                      )}
                    </span>
                  </div>
                );
              })()}
            </div>
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
                  {locale === "es" ? "Ver en Maps" : "View on Maps"}
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

          {/* Reviewer - show anonymous message for private users, link for public */}
          {!isOwner && (
            <div className="mt-6 border-t border-border pt-6">
              {isAnonymized ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <User size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "es" ? "Review de" : "Reviewed by"}
                    </p>
                    <p className="font-medium text-muted-foreground">
                      {locale === "es" ? "Usuario privado" : "Private user"}
                    </p>
                  </div>
                </div>
              ) : reviewUser?.username && (
                <Link
                  href={`/u/${reviewUser.username}`}
                  className="flex items-center gap-3 group"
                >
                  {reviewUser.avatar_url ? (
                    <img
                      src={reviewUser.avatar_url}
                      alt={reviewUser.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <User size={18} className="text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "es" ? "Review de" : "Reviewed by"}
                    </p>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      @{reviewUser.username}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="mt-6 flex gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <Share2 size={16} />
                {locale === "es" ? "Compartir" : "Share"}
              </button>
              <Link
                href={`/edit-review/${review.id}`}
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
                  ? (locale === "es" ? "..." : "...") 
                  : (locale === "es" ? "Eliminar" : "Delete")}
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Footer / CTA - only show if not owner and not logged in */}
      {!isOwner && !user && (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {locale === "es" 
              ? "Registrá tus experiencias en restaurantes" 
              : "Track your own restaurant experiences"}
          </p>
          <a
            href="/"
            className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {locale === "es" ? "Empezá tu ForkList" : "Start your ForkList"}
          </a>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        reviewId={review.id}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
