"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { UsernameForm, ProfileForm } from "@/components/profile";
import { ExternalLink, Share2, Copy, Check, Trash2, Loader2, LogOut, UserPlus, ChevronRight } from "lucide-react";
import { useT, useI18n } from "@/lib/i18n";
import { deleteAccount } from "@/lib/actions/profile";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DeleteAccountModal } from "@/components/ui/DeleteAccountModal";

interface ProfileSettingsContentProps {
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  pendingRequestCount?: number;
}

export function ProfileSettingsContent({
  username,
  bio,
  avatarUrl,
  isPrivate,
  pendingRequestCount = 0,
}: ProfileSettingsContentProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const t = useT();
  const { locale } = useI18n();
  const [currentUsername, setCurrentUsername] = useState(username);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleUsernameSuccess = () => {
    router.refresh();
    // Re-fetch to get updated username
    setCurrentUsername(currentUsername);
  };

  const handleProfileSuccess = () => {
    router.refresh();
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/u/${username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("shareProfileTitle"),
          text: t("shareProfileText"),
          url,
        });
      } catch {
        // User cancelled or error, fall back to copy
        await copyToClipboard(url);
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteAccount();
    
    if (result.success) {
      // Redirect to home, Clerk will handle sign out
      window.location.href = "/";
    } else {
      setIsDeleting(false);
      setShowDeleteModal(false);
      alert(result.error || "Error deleting account");
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="space-y-8">
      {/* Follow Requests Section - show if private or has pending requests */}
      {(isPrivate || pendingRequestCount > 0) && (
        <Link href="/requests">
          <section className="rounded-xl border border-border bg-card p-6 hover:bg-card/80 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-medium text-foreground">
                    {locale === "es" ? "Solicitudes de seguimiento" : "Follow Requests"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {pendingRequestCount > 0
                      ? locale === "es"
                        ? `${pendingRequestCount} solicitud${pendingRequestCount > 1 ? "es" : ""} pendiente${pendingRequestCount > 1 ? "s" : ""}`
                        : `${pendingRequestCount} pending request${pendingRequestCount > 1 ? "s" : ""}`
                      : locale === "es"
                        ? "No hay solicitudes pendientes"
                        : "No pending requests"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pendingRequestCount > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {pendingRequestCount}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </section>
        </Link>
      )}

      {/* Username Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-foreground">
          {t("username")}
        </h2>
        <UsernameForm
          currentUsername={username}
          onSuccess={handleUsernameSuccess}
        />
        {username && (
          <div className="mt-4 rounded-lg bg-secondary/50 p-3">
            <p className="text-sm text-muted-foreground">
              {t("yourPublicProfile")}:{" "}
              <a
                href={`/u/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                forklist.app/u/{username}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}
      </section>

      {/* Profile Section - only show if username is claimed */}
      {username && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-lg font-medium text-foreground">
            {t("profile")}
          </h2>
          <ProfileForm
            currentBio={bio}
            currentAvatarUrl={avatarUrl}
            isPrivate={isPrivate}
            onSuccess={handleProfileSuccess}
          />
        </section>
      )}

      {/* Share Profile Section */}
      {username && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-lg font-medium text-foreground">
            {t("shareProfile")}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("shareProfileDesc")}
          </p>
          <button
            type="button"
            onClick={handleShareProfile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5" />
                {t("linkCopied")}
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5" />
                {t("shareProfileButton")}
              </>
            )}
          </button>
        </section>
      )}

      {/* Sign Out */}
      <section className="rounded-xl border border-border bg-card p-6">
        <button
          type="button"
          onClick={() => setShowSignOutModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-medium text-foreground transition-colors hover:bg-secondary/80"
        >
          <LogOut size={18} />
          {locale === "es" ? "Cerrar sesión" : "Sign out"}
        </button>
      </section>

      {/* Sign Out Modal */}
      <ConfirmModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        title={locale === "es" ? "Cerrar sesión" : "Sign out"}
        message={locale === "es" ? "¿Estás seguro que querés cerrar sesión?" : "Are you sure you want to sign out?"}
        confirmText={locale === "es" ? "Cerrar sesión" : "Sign out"}
        cancelText={locale === "es" ? "Cancelar" : "Cancel"}
        destructive
        isLoading={isSigningOut}
      />

      {/* Danger Zone - Delete Account */}
      <section className="rounded-xl border border-destructive/50 bg-card p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-destructive">
          {t("dangerZone")}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("deleteAccountDesc")}
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive bg-destructive/10 py-3 font-medium text-destructive transition-all hover:bg-destructive/20"
        >
          <Trash2 className="h-5 w-5" />
          {t("deleteAccount")}
        </button>
      </section>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        locale={locale}
      />
    </div>
  );
}
