"use client";

import { useState, useEffect } from "react";
import { X, Plus, Check, Loader2 } from "lucide-react";
import { getLists, createList, addToList } from "@/lib/actions/lists";
import type { ListWithCount } from "@/lib/actions/lists";
import { useT } from "@/lib/i18n";

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
}

export default function AddToListModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
}: AddToListModalProps) {
  const t = useT();
  const [lists, setLists] = useState<ListWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen]);

  const fetchLists = async () => {
    setLoading(true);
    const result = await getLists();
    if ("success" in result && result.success) {
      setLists(result.lists);
    }
    setLoading(false);
  };

  const handleAddToList = async (listId: string) => {
    if (adding || added.includes(listId)) return;
    
    setAdding(listId);
    setError(null);

    const result = await addToList({
      list_id: listId,
      restaurant_id: restaurantId,
    });

    if ("error" in result) {
      setError(result.error);
    } else {
      setAdded([...added, listId]);
    }
    
    setAdding(null);
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim() || creating) return;

    setCreating(true);
    setError(null);

    const createResult = await createList({ name: newListName.trim() });
    
    if ("error" in createResult) {
      setError(createResult.error);
      setCreating(false);
      return;
    }

    // Add restaurant to the new list
    const addResult = await addToList({
      list_id: createResult.id,
      restaurant_id: restaurantId,
    });

    if ("error" in addResult) {
      setError(addResult.error);
    } else {
      setAdded([...added, createResult.id]);
      setNewListName("");
      setShowNewForm(false);
      await fetchLists();
    }

    setCreating(false);
  };

  const handleClose = () => {
    setShowNewForm(false);
    setNewListName("");
    setError(null);
    setAdded([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-lg font-semibold">
              {t("addToList")}
            </h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {restaurantName}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Existing lists */}
              {lists.map((list) => {
                const isAdded = added.includes(list.id);
                const isAdding = adding === list.id;

                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => handleAddToList(list.id)}
                    disabled={isAdded || isAdding}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                      isAdded
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-border bg-secondary hover:border-primary/20"
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="min-w-0 text-left">
                      <p className="font-medium">{list.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {list.item_count} {list.item_count === 1 ? t("place") : t("placesCount")}
                      </p>
                    </div>
                    {isAdding ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
                    ) : isAdded ? (
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <Plus className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                );
              })}

              {/* Create new list */}
              {showNewForm ? (
                <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder={t("listNamePlaceholder")}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewForm(false);
                        setNewListName("");
                      }}
                      className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateAndAdd}
                      disabled={!newListName.trim() || creating}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t("createAndAdd")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewForm(true)}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  <Plus size={18} />
                  <span>{t("createNewList")}</span>
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Footer */}
        {added.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-all hover:opacity-90"
            >
              {t("done")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
