"use client";

import { useState, useEffect } from "react";
import { X, Link2, MessageCircle, Share2, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import { markFirstShare } from "@/lib/actions/profile";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  restaurantName: string;
}

export function ShareModal({ isOpen, onClose, reviewId, restaurantName }: ShareModalProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API is available
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Mark first share when modal opens
  useEffect(() => {
    if (isOpen) {
      markFirstShare();
    }
  }, [isOpen]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const reviewUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/review/${reviewId}`
    : `/review/${reviewId}`;

  const shareText = `${t("shareTextPrefix")} ${restaurantName} ${t("shareTextSuffix")}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = reviewUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${reviewUrl}`)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${restaurantName} - ForkList`,
          text: shareText,
          url: reviewUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card p-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-semibold">{t("shareReview")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Share options */}
        <div className="space-y-3">
          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-left transition-colors hover:bg-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {copied ? <Check size={20} /> : <Link2 size={20} />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {copied ? t("linkCopied") : t("copyLink")}
              </p>
              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                {reviewUrl}
              </p>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-left transition-colors hover:bg-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{t("shareWhatsApp")}</p>
              <p className="text-sm text-muted-foreground">{t("shareWhatsAppDesc")}</p>
            </div>
          </button>

          {/* Native Share (if available) */}
          {canShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Share2 size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{t("shareMore")}</p>
                <p className="text-sm text-muted-foreground">{t("shareMoreDesc")}</p>
              </div>
            </button>
          )}
        </div>

        {/* Bottom padding for mobile safe area */}
        <div className="h-4 sm:hidden" />
      </div>
    </div>
  );
}
