"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Heart, UserPlus, Check, X, Loader2 } from "lucide-react";
import { useT, useI18n } from "@/lib/i18n";
import { 
  getActivityNotifications, 
  type ActivityNotification 
} from "@/lib/actions/notifications";
import { 
  getPendingFollowRequests, 
  acceptFollowRequest, 
  rejectFollowRequest,
  type FollowRequest 
} from "@/lib/actions/follows";

interface NotificationsContentProps {
  isPrivate: boolean;
  initialRequestsCount: number;
}

type TabType = "activity" | "requests";

function formatTimeAgo(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return locale === "es" ? "ahora" : "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${diffWeeks}w`;
}

function ActivityTab() {
  const t = useT();
  const { locale } = useI18n();
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getActivityNotifications();
      setNotifications(result.notifications);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          {locale === "es" ? "No hay actividad reciente" : "No recent activity"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((notification) => (
        <div key={notification.id} className="flex items-center gap-3 py-3 px-4">
          {/* Avatar */}
          <Link href={notification.user.username ? `/u/${notification.user.username}` : "#"}>
            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
              {notification.user.avatarUrl ? (
                <img
                  src={notification.user.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <Link 
                href={notification.user.username ? `/u/${notification.user.username}` : "#"}
                className="font-semibold hover:underline"
              >
                @{notification.user.username || "user"}
              </Link>
              {" "}
              {notification.type === "like" ? (
                <>
                  {locale === "es" ? "le gustó tu reseña de" : "liked your review of"}
                  {" "}
                  <Link 
                    href={`/review/${notification.review.id}`}
                    className="font-medium hover:underline"
                  >
                    {notification.review.placeName}
                  </Link>
                </>
              ) : (
                locale === "es" ? "comenzó a seguirte" : "started following you"
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTimeAgo(notification.createdAt, locale)}
            </p>
          </div>

          {/* Icon indicator */}
          <div className="flex-shrink-0">
            {notification.type === "like" ? (
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            ) : (
              <UserPlus className="h-4 w-4 text-primary" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RequestsTab() {
  const { locale } = useI18n();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const result = await getPendingFollowRequests();
      if (result.requests) {
        setRequests(result.requests);
      }
      setIsLoading(false);
    }
    load();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <UserPlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          {locale === "es" ? "No hay solicitudes pendientes" : "No pending requests"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {requests.map((request) => (
        <div key={request.id} className="flex items-center gap-3 py-3 px-4">
          {/* Avatar */}
          <Link href={request.username ? `/u/${request.username}` : "#"}>
            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
              {request.avatar_url ? (
                <img
                  src={request.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link 
              href={request.username ? `/u/${request.username}` : "#"}
              className="font-semibold text-sm hover:underline"
            >
              @{request.username || "user"}
            </Link>
            {request.bio && (
              <p className="text-xs text-muted-foreground truncate">{request.bio}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(request.follower_id)}
              disabled={processingIds.has(request.follower_id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
              title={locale === "es" ? "Aceptar" : "Accept"}
            >
              {processingIds.has(request.follower_id) ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
            </button>
            <button
              onClick={() => handleReject(request.follower_id)}
              disabled={processingIds.has(request.follower_id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 transition-all"
              title={locale === "es" ? "Rechazar" : "Reject"}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsContent({ isPrivate, initialRequestsCount }: NotificationsContentProps) {
  const { locale } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>("activity");

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <h1 className="font-serif text-2xl font-semibold text-foreground">
        {locale === "es" ? "Notificaciones" : "Notifications"}
      </h1>

      {/* Tabs */}
      <div className="flex rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "activity"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary/50"
          }`}
        >
          {locale === "es" ? "Actividad" : "Activity"}
        </button>
        {isPrivate && (
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "requests"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            {locale === "es" ? "Solicitudes" : "Requests"}
            {initialRequestsCount > 0 && activeTab !== "requests" && (
              <span className="absolute top-2 right-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                {initialRequestsCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {activeTab === "activity" ? <ActivityTab /> : <RequestsTab />}
      </div>
    </div>
  );
}
