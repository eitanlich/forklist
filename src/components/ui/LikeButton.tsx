"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/lib/actions/likes";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  reviewId: string;
  initialLiked: boolean;
  initialCount: number;
  showCount?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function LikeButton({
  reviewId,
  initialLiked,
  initialCount,
  showCount = true,
  size = "md",
  className,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Sync with props when they change
  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const iconSize = size === "sm" ? 14 : 18;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPending) return;

    // Optimistic update
    const wasLiked = liked;
    const prevCount = count;
    
    setLiked(!wasLiked);
    setCount(wasLiked ? prevCount - 1 : prevCount + 1);
    setIsPending(true);
    
    // Animation on like
    if (!wasLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    try {
      const result = await toggleLike(reviewId);
      
      if (result.error) {
        // Revert on error
        console.error("Like error:", result.error);
        setLiked(wasLiked);
        setCount(prevCount);
      }
    } catch (err) {
      // Revert on exception
      console.error("Like exception:", err);
      setLiked(wasLiked);
      setCount(prevCount);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 transition-all",
        "hover:scale-105 active:scale-95",
        "disabled:opacity-50",
        liked ? "text-destructive" : "text-muted-foreground hover:text-destructive/70",
        className
      )}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart
        size={iconSize}
        strokeWidth={1.5}
        className={cn(
          "transition-all duration-200",
          liked && "fill-current",
          isAnimating && "animate-like-bounce"
        )}
      />
      {showCount && count > 0 && (
        <span className={cn(
          "text-sm font-medium tabular-nums",
          size === "sm" && "text-xs"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
