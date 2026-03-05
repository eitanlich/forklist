"use client";

import { useState, useEffect, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  // Sync with props when they change (e.g., after server fetch)
  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const iconSize = size === "sm" ? 14 : 18;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const wasLiked = liked;
    const prevCount = count;
    
    setLiked(!wasLiked);
    setCount(wasLiked ? prevCount - 1 : prevCount + 1);
    
    // Trigger animation on like
    if (!wasLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    startTransition(async () => {
      const result = await toggleLike(reviewId);
      
      // Revert on error
      if (result.error) {
        setLiked(wasLiked);
        setCount(prevCount);
      } else if (result.liked !== !wasLiked) {
        // Server state differs from optimistic, sync it
        setLiked(result.liked);
        setCount(result.liked ? prevCount + 1 : prevCount - 1);
      }
    });
  };

  return (
    <button
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
