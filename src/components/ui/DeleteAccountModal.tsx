"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  locale?: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  locale = "en",
}: DeleteAccountModalProps) {
  const [deleteText, setDeleteText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setDeleteText("");
      // Focus input after modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const canDelete = deleteText === "DELETE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canDelete && !isLoading) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="w-[90%] max-w-md rounded-2xl bg-card border border-destructive/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with warning icon */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {locale === "es" ? "Eliminar cuenta" : "Delete account"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "es"
              ? "Esta acción es permanente y no se puede deshacer. Se eliminarán todas tus reseñas, listas y datos."
              : "This action is permanent and cannot be undone. All your reviews, lists, and data will be deleted."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <p className="mb-2 text-sm text-muted-foreground">
            {locale === "es"
              ? 'Escribí "DELETE" para confirmar:'
              : 'Type "DELETE" to confirm:'}
          </p>
          <input
            ref={inputRef}
            type="text"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value.toUpperCase())}
            placeholder="DELETE"
            disabled={isLoading}
            className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive disabled:opacity-50"
          />
        </form>

        {/* Actions */}
        <div className="border-t border-border">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete || isLoading}
            className="w-full py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {locale === "es" ? "Eliminando..." : "Deleting..."}
              </>
            ) : (
              locale === "es" ? "Eliminar mi cuenta" : "Delete my account"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3.5 text-sm text-muted-foreground hover:bg-secondary/50 transition-colors border-t border-border disabled:opacity-50"
          >
            {locale === "es" ? "Cancelar" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
