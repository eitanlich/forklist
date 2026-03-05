"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Check, X, ArrowLeft } from "lucide-react";
import { 
  getPendingFollowRequests, 
  acceptFollowRequest, 
  rejectFollowRequest,
  type FollowRequest 
} from "@/lib/actions/follows";
import { useI18n } from "@/lib/i18n";

export function RequestsContent() {
  const { locale } = useI18n();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const result = await getPendingFollowRequests();
    setRequests(result.requests);
    setLoading(false);
  };

  const handleAccept = async (followerId: string) => {
    setProcessingIds((prev) => new Set(prev).add(followerId));
    
    const result = await acceptFollowRequest(followerId);
    
    if (result.success) {
      setRequests((prev) => prev.filter((r) => r.follower_id !== followerId));
    }
    
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(followerId);
      return next;
    });
  };

  const handleReject = async (followerId: string) => {
    setProcessingIds((prev) => new Set(prev).add(followerId));
    
    const result = await rejectFollowRequest(followerId);
    
    if (result.success) {
      setRequests((prev) => prev.filter((r) => r.follower_id !== followerId));
    }
    
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(followerId);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return locale === "es" ? "Hoy" : "Today";
    if (diffDays === 1) return locale === "es" ? "Ayer" : "Yesterday";
    if (diffDays < 7) return locale === "es" ? `Hace ${diffDays} días` : `${diffDays} days ago`;
    
    return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/settings/profile"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-serif text-2xl font-semibold">
            {locale === "es" ? "Solicitudes de seguimiento" : "Follow Requests"}
          </h1>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {locale === "es" 
                ? "No tenés solicitudes pendientes" 
                : "No pending follow requests"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                {/* Avatar */}
                <Link href={`/u/${request.username}`}>
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
                    {request.avatar_url ? (
                      <img
                        src={request.avatar_url}
                        alt={request.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/u/${request.username}`} className="hover:underline">
                    <p className="font-medium text-foreground truncate">
                      @{request.username}
                    </p>
                  </Link>
                  {request.bio && (
                    <p className="text-sm text-muted-foreground truncate">
                      {request.bio}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(request.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(request.follower_id)}
                    disabled={processingIds.has(request.follower_id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
                    title={locale === "es" ? "Aceptar" : "Accept"}
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleReject(request.follower_id)}
                    disabled={processingIds.has(request.follower_id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 transition-all"
                    title={locale === "es" ? "Rechazar" : "Reject"}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
