"use client";

import Link from "next/link";
import { List, Plus, ChevronRight } from "lucide-react";
import type { ListWithCount } from "@/lib/actions/lists";
import { useT } from "@/lib/i18n";

interface ListsContentProps {
  lists: ListWithCount[];
}

export default function ListsContent({ lists }: ListsContentProps) {
  const t = useT();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          {t("myLists")}
        </h1>
        <Link
          href="/lists/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
        >
          <Plus size={18} />
          {t("newList")}
        </Link>
      </div>

      {/* Content */}
      {lists.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <List className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <div className="space-y-2">
            <p className="text-lg font-medium">{t("noListsYet")}</p>
            <p className="text-base text-muted-foreground">
              {t("createFirstList")}
            </p>
          </div>
          <Link
            href="/lists/new"
            className="mt-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
          >
            {t("createList")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:bg-card/80"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-lg font-semibold tracking-tight">
                  {list.name}
                </h2>
                {list.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {list.description}
                  </p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {list.item_count} {list.item_count === 1 ? t("place") : t("placesCount")}
                </p>
              </div>
              <ChevronRight
                size={20}
                className="text-muted-foreground transition-transform group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
