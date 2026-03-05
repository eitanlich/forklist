"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile, uploadAvatar, removeAvatar } from "@/lib/actions/profile";
import { Camera, Loader2, Pencil, User, X, Globe2, Lock } from "lucide-react";
import { useT, useI18n } from "@/lib/i18n";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ProfileFormProps {
  currentBio: string | null;
  currentAvatarUrl: string | null;
  isPrivate: boolean;
  onSuccess?: () => void;
}

export function ProfileForm({
  currentBio,
  currentAvatarUrl,
  isPrivate: initialPrivate,
  onSuccess,
}: ProfileFormProps) {
  const t = useT();
  const { locale } = useI18n();
  const [bio, setBio] = useState(currentBio ?? "");
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [pendingPrivacyChange, setPendingPrivacyChange] = useState<boolean | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);
  const [pendingRemoveAvatar, setPendingRemoveAvatar] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection - just preview, don't upload yet
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setError(t("fileMustBeImage") || "File must be an image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t("imageTooLarge") || "Image must be less than 2MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setPendingAvatarFile(file);
    setPendingRemoveAvatar(false);
    setError(null);
  };

  // Mark avatar for removal (don't remove yet)
  const handleRemoveClick = () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemoveAvatar = () => {
    setPendingRemoveAvatar(true);
    setPendingAvatarFile(null);
    setPendingAvatarPreview(null);
    setShowRemoveConfirm(false);
  };

  const cancelRemoveAvatar = () => {
    setShowRemoveConfirm(false);
  };

  // Determine what to show as current avatar
  const displayAvatarUrl = pendingRemoveAvatar 
    ? null 
    : (pendingAvatarPreview ?? avatarUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Handle avatar changes first
      if (pendingRemoveAvatar && avatarUrl) {
        const removeResult = await removeAvatar();
        if (removeResult.error) {
          setError(removeResult.error);
          setIsSaving(false);
          return;
        }
        setAvatarUrl(null);
      } else if (pendingAvatarFile) {
        const formData = new FormData();
        formData.append("avatar", pendingAvatarFile);
        const uploadResult = await uploadAvatar(formData);
        if (uploadResult.error) {
          setError(uploadResult.error);
          setIsSaving(false);
          return;
        }
        setAvatarUrl(uploadResult.url ?? null);
      }

      // Update profile (bio, privacy)
      const result = await updateProfile({ bio, is_private: isPrivate });

      if (result.error) {
        setError(result.error);
      } else {
        // Reset pending states
        setPendingAvatarFile(null);
        setPendingAvatarPreview(null);
        setPendingRemoveAvatar(false);
        onSuccess?.();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    bio !== (currentBio ?? "") || 
    isPrivate !== initialPrivate ||
    pendingAvatarFile !== null ||
    pendingRemoveAvatar;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-secondary">
            {displayAvatarUrl ? (
              <img
                src={displayAvatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          {/* Remove button - only show if has avatar (current or pending) */}
          {displayAvatarUrl && !showRemoveConfirm && (
            <button
              type="button"
              onClick={handleRemoveClick}
              disabled={isSaving}
              className="absolute -top-1 -right-1 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              aria-label="Remove avatar"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {/* Upload/Edit button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            {displayAvatarUrl ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">{t("avatarHint")}</p>
        
        {/* Pending change indicator */}
        {(pendingAvatarFile || pendingRemoveAvatar) && (
          <p className="text-xs text-primary">{t("unsavedChanges") || "Unsaved changes"}</p>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3">
          <p className="text-sm font-medium text-destructive">
            {t("removeAvatarConfirm") || "Remove profile photo?"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelRemoveAvatar}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={confirmRemoveAvatar}
              className="flex-1 rounded-lg bg-destructive py-2 text-sm font-medium text-destructive-foreground transition-colors hover:opacity-90"
            >
              {t("remove") || "Remove"}
            </button>
          </div>
        </div>
      )}

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t("bio")}</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          placeholder={t("bioPlaceholder")}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="text-right text-xs text-muted-foreground">
          {bio.length}/160
        </p>
      </div>

      {/* Privacy Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          {isPrivate ? (
            <Lock size={18} className="text-muted-foreground" />
          ) : (
            <Globe2 size={18} className="text-primary" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isPrivate ? t("privateProfile") : t("publicProfile")}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPrivate ? t("privateProfileHint") : t("publicProfileHint")}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!isPrivate}
          onClick={() => {
            setPendingPrivacyChange(!isPrivate);
            setShowPrivacyModal(true);
          }}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            !isPrivate ? "bg-primary" : "bg-secondary"
          } disabled:opacity-50`}
          aria-label={isPrivate ? t("makePublic") : t("makePrivate")}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              !isPrivate ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Privacy Change Confirmation Modal */}
      <ConfirmModal
        isOpen={showPrivacyModal}
        onClose={() => {
          setShowPrivacyModal(false);
          setPendingPrivacyChange(null);
        }}
        onConfirm={() => {
          if (pendingPrivacyChange !== null) {
            setIsPrivate(pendingPrivacyChange);
          }
          setShowPrivacyModal(false);
          setPendingPrivacyChange(null);
        }}
        title={
          pendingPrivacyChange
            ? locale === "es" ? "Hacer perfil privado" : "Make profile private"
            : locale === "es" ? "Hacer perfil público" : "Make profile public"
        }
        message={
          pendingPrivacyChange
            ? locale === "es"
              ? "Solo los seguidores aprobados podrán ver tu perfil y reviews. Los seguidores actuales mantendrán su acceso."
              : "Only approved followers will be able to see your profile and reviews. Current followers will keep their access."
            : locale === "es"
              ? "Cualquiera podrá ver tu perfil y reviews. Las solicitudes de seguimiento pendientes serán aprobadas automáticamente."
              : "Anyone will be able to see your profile and reviews. Pending follow requests will be automatically approved."
        }
        confirmText={
          pendingPrivacyChange
            ? locale === "es" ? "Hacer privado" : "Make private"
            : locale === "es" ? "Hacer público" : "Make public"
        }
        cancelText={locale === "es" ? "Cancelar" : "Cancel"}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={!hasChanges || isSaving}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("saving")}
          </>
        ) : (
          t("saveChanges")
        )}
      </Button>
    </form>
  );
}
