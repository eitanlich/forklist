"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toggleLike } from "@/lib/actions/likes";

interface LikeButtonProps {
  reviewId: string;
  initialLiked: boolean;
  initialCount: number;
  compact?: boolean;
}

export function LikeButton({
  reviewId,
  initialLiked,
  initialCount,
  compact = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // Optimistic update
    const wasLiked = liked;
    const prevCount = count;
    
    setLiked(!wasLiked);
    setCount(wasLiked ? prevCount - 1 : prevCount + 1);

    startTransition(async () => {
      const result = await toggleLike(reviewId);
      if (result.error) {
        // Revert on error
        setLiked(wasLiked);
        setCount(prevCount);
      } else {
        setLiked(result.liked);
      }
    });
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Heart
            size={14}
            className={liked ? "fill-destructive text-destructive" : ""}
          />
        )}
        {count > 0 && <span>{count}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
        liked
          ? "bg-destructive/10 text-destructive"
          : "bg-secondary text-muted-foreground hover:text-destructive"
      }`}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Heart
          size={16}
          className={liked ? "fill-current" : ""}
        />
      )}
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
