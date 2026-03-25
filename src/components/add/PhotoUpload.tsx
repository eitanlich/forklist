"use client";

import { useState, useRef } from "react";
import { Camera, Pencil, X, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import imageCompression from "browser-image-compression";

interface PhotoUploadProps {
  value: File | null;
  preview: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  disabled?: boolean;
}

// Compression options - maintains high quality while reducing file size
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Target max 1MB after compression
  maxWidthOrHeight: 1920, // Full HD - looks great on any screen
  useWebWorker: true, // Don't block UI
  fileType: "image/jpeg" as const,
  initialQuality: 0.85, // 85% quality - visually indistinguishable
};

export function PhotoUpload({ value, preview, onChange, disabled }: PhotoUploadProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(t("fileMustBeImage") || "File must be an image");
      return;
    }

    // Validate original file size (max 20MB before compression - generous limit)
    if (file.size > 20 * 1024 * 1024) {
      setError(t("imageTooLargeReview") || "Image must be less than 20MB");
      return;
    }

    setError(null);
    setIsCompressing(true);

    try {
      // Compress the image
      const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
      
      // Create preview from compressed file
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(compressedFile, e.target?.result as string);
        setIsCompressing(false);
      };
      reader.onerror = () => {
        setError("Failed to process image");
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error("Compression error:", err);
      setError("Failed to process image");
      setIsCompressing(false);
    }
  };

  const handleRemove = () => {
    onChange(null, null);
    setError(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {t("photo")} <span className="text-xs">({t("optional")})</span>
      </p>
      
      {preview ? (
        // Photo preview with edit/remove buttons
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary">
            <img
              src={preview}
              alt="Review photo preview"
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute -top-2 -right-2 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Change button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg backdrop-blur-sm transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Pencil className="h-3 w-3" />
            {t("change") || "Change"}
          </button>
        </div>
      ) : isCompressing ? (
        // Compressing state
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/50 bg-secondary/50 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {t("optimizingPhoto") || "Optimizing photo..."}
          </p>
        </div>
      ) : (
        // Upload button
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/50 py-8 transition-colors hover:border-primary/50 hover:bg-secondary disabled:opacity-50"
        >
          <div className="rounded-full bg-primary/10 p-3">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {t("addPhoto") || "Add a photo"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("photoHint") || "JPG, PNG or WebP, max 5MB"}
            </p>
          </div>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
