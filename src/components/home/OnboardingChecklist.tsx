"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Share2, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { ShareModal } from "@/components/share";

type ChecklistLabelKey = 
  | "checklistAccount"
  | "checklistUsername"
  | "checklistReview"
  | "checklistList"
  | "checklistShare";

interface ChecklistItem {
  id: string;
  labelKey: ChecklistLabelKey;
  completed: boolean;
  href?: string;
  action?: "share";
}

interface OnboardingChecklistProps {
  hasReviews: boolean;
  hasLists: boolean;
  hasShared: boolean;
  lastReviewId?: string | null;
  lastRestaurantName?: string | null;
  onDismiss: () => void;
}

export function OnboardingChecklist({
  hasReviews,
  hasLists,
  hasShared,
  lastReviewId,
  lastRestaurantName,
  onDismiss,
}: OnboardingChecklistProps) {
  const t = useT();
  const [showShareModal, setShowShareModal] = useState(false);

  const items: ChecklistItem[] = [
    {
      id: "account",
      labelKey: "checklistAccount",
      completed: true,
    },
    {
      id: "username",
      labelKey: "checklistUsername",
      completed: true,
    },
    {
      id: "review",
      labelKey: "checklistReview",
      completed: hasReviews,
      href: "/add",
    },
    {
      id: "list",
      labelKey: "checklistList",
      completed: hasLists,
      href: "/lists/new",
    },
    {
      id: "share",
      labelKey: "checklistShare",
      completed: hasShared,
      action: hasReviews ? "share" : undefined,
      href: hasReviews ? undefined : "/add",
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const allCompleted = completedCount === items.length;
  const progress = (completedCount / items.length) * 100;

  if (allCompleted) {
    return null;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="p-5">
          {/* Header */}
          <div className="mb-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {t("checklistTitle")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount} {t("of")} {items.length} {t("completed")}
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-secondary mb-5">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id}>
                {item.completed ? (
                  <div className="flex items-center gap-3 py-2 text-muted-foreground">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <Check size={14} className="text-primary" />
                    </div>
                    <span className="text-sm line-through">{t(item.labelKey)}</span>
                  </div>
                ) : item.action === "share" ? (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex w-full items-center gap-3 py-2 group"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-primary/50 group-hover:border-primary transition-colors">
                      <Share2 size={12} className="text-primary/50 group-hover:text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1 text-left">
                      {t(item.labelKey)}
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                  </button>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 py-2 group"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-primary/50 group-hover:border-primary transition-colors" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1">
                      {t(item.labelKey)}
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 py-2 text-muted-foreground">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30" />
                    <span className="text-sm">{t(item.labelKey)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && lastReviewId && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          reviewId={lastReviewId}
          restaurantName={lastRestaurantName || ""}
        />
      )}
    </>
  );
}
