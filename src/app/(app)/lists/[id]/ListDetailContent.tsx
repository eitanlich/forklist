"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Globe, Trash2, List } from "lucide-react";
import type { ListWithItems } from "@/lib/actions/lists";
import { removeFromList } from "@/lib/actions/lists";
import { useT } from "@/lib/i18n";

interface ListDetailContentProps {
  list: ListWithItems;
}

export default function ListDetailContent({ list }: ListDetailContentProps) {
  const t = useT();
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (itemId: string) => {
    if (removingId) return;
    setRemovingId(itemId);

    const result = await removeFromList(itemId);
    
    if ("success" in result) {
      router.refresh();
    }
    
    setRemovingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/lists"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            {list.name}
          </h1>
          {list.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {list.description}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {list.items.length} {list.items.length === 1 ? t("place") : t("placesCount")}
          </p>
        </div>
      </div>

      {/* Items */}
      {list.items.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <List className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          <div className="space-y-2">
            <p className="text-lg font-medium">{t("emptyList")}</p>
            <p className="text-sm text-muted-foreground">
              {t("emptyListHint")}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {list.items.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/20"
            >
              <div className="flex gap-4 p-4">
                {item.restaurant.photo_reference && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/places/photo?ref=${encodeURIComponent(item.restaurant.photo_reference)}`}
                    alt={item.restaurant.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-serif text-lg font-semibold tracking-tight">
                      {item.restaurant.name}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={removingId === item.id}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      aria-label={t("removeFromList")}
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  {item.restaurant.city && (
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin size={13} strokeWidth={1.5} />
                      {item.restaurant.city}
                    </div>
                  )}

                  {item.notes && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Links */}
              {(item.restaurant.google_maps_url || item.restaurant.website) && (
                <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                  {item.restaurant.google_maps_url && (
                    <a
                      href={item.restaurant.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                    >
                      <MapPin size={14} strokeWidth={1.5} />
                      {t("maps")}
                    </a>
                  )}
                  {item.restaurant.website && (
                    <a
                      href={item.restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                    >
                      <Globe size={14} strokeWidth={1.5} />
                      {t("website")}
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
