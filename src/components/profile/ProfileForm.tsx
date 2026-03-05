"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile, uploadAvatar, removeAvatar } from "@/lib/actions/profile";
import { Camera, Loader2, Pencil, User, X } from "lucide-react";
import { useT } from "@/lib/i18n";

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
  const [bio, setBio] = useState(currentBio ?? "");
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);
    setIsUploading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      setAvatarUrl(result.url);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    
    setIsUploading(true);
    setError(null);

    const result = await removeAvatar();
    setIsUploading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setAvatarUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const result = await updateProfile({ bio, is_private: isPrivate });
    setIsSaving(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess?.();
    }
  };

  const hasChanges = bio !== (currentBio ?? "") || isPrivate !== initialPrivate;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-secondary">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          {/* Remove button - only show if has avatar */}
          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
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
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : avatarUrl ? (
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
      </div>

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
      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">{t("privateProfile")}</p>
          <p className="text-xs text-muted-foreground">
            {t("privateProfileHint")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPrivate}
          onClick={() => setIsPrivate(!isPrivate)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isPrivate ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              isPrivate ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

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
