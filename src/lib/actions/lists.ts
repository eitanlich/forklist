"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ListInput {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface AddToListInput {
  list_id: string;
  restaurant_id: string;
  notes?: string;
}

export async function createList(
  data: ListInput
): Promise<{ error: string } | { success: true; id: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  if (!data.name || data.name.trim().length === 0) {
    return { error: "List name is required" };
  }

  const supabase = createAdminClient();

  // Find user in Supabase
  let { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return { error: "Not authenticated" };

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({ clerk_id: clerkId, email, username: clerkUser.username ?? null })
      .select("id")
      .single();

    if (createError || !newUser) return { error: "Failed to create user profile" };
    user = newUser;
  }

  const { data: list, error: listError } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      is_public: data.is_public ?? false,
    })
    .select("id")
    .single();

  if (listError || !list) return { error: "Failed to create list" };

  return { success: true, id: list.id };
}

export async function getLists(): Promise<
  { error: string } | { success: true; lists: ListWithCount[] }
> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { success: true, lists: [] };

  // Get lists
  const { data: lists, error } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: "Failed to fetch lists" };

  // Get item counts for all lists in a single query
  const listIds = (lists || []).map((l) => l.id);
  const { data: itemCounts } = await supabase
    .from("list_items")
    .select("list_id")
    .in("list_id", listIds);

  // Count items per list
  const countMap: Record<string, number> = {};
  for (const item of itemCounts || []) {
    countMap[item.list_id] = (countMap[item.list_id] || 0) + 1;
  }

  const listsWithCount: ListWithCount[] = (lists || []).map((list) => ({
    id: list.id,
    user_id: list.user_id,
    name: list.name,
    description: list.description,
    is_public: list.is_public,
    created_at: list.created_at,
    updated_at: list.updated_at,
    item_count: countMap[list.id] || 0,
  }));

  return { success: true, lists: listsWithCount };
}

export async function getList(
  listId: string
): Promise<{ error: string } | { success: true; list: ListWithItems }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { error: "User not found" };

  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("*")
    .eq("id", listId)
    .single();

  if (listError || !list) return { error: "List not found" };

  // Check ownership or public access
  if (list.user_id !== user.id && !list.is_public) {
    return { error: "Not authorized" };
  }

  const { data: items, error: itemsError } = await supabase
    .from("list_items")
    .select("*, restaurant:restaurants(*)")
    .eq("list_id", listId)
    .order("added_at", { ascending: false });

  if (itemsError) return { error: "Failed to fetch list items" };

  return {
    success: true,
    list: {
      ...list,
      items: items || [],
    },
  };
}

export async function addToList(
  data: AddToListInput
): Promise<{ error: string } | { success: true }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { error: "User not found" };

  // Verify list belongs to user
  const { data: list } = await supabase
    .from("lists")
    .select("id, user_id")
    .eq("id", data.list_id)
    .single();

  if (!list) return { error: "List not found" };
  if (list.user_id !== user.id) return { error: "Not authorized" };

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from("list_items")
    .select("id")
    .eq("list_id", data.list_id)
    .eq("restaurant_id", data.restaurant_id)
    .single();

  if (existingItem) return { error: "Restaurant already in list" };

  const { error: insertError } = await supabase.from("list_items").insert({
    list_id: data.list_id,
    restaurant_id: data.restaurant_id,
    notes: data.notes?.trim() || null,
    visited: false,
  });

  if (insertError) return { error: "Failed to add to list" };

  // Update list's updated_at
  await supabase
    .from("lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", data.list_id);

  return { success: true };
}

export async function updateListPrivacy(
  listId: string,
  isPublic: boolean
): Promise<{ error: string } | { success: true }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { error: "User not found" };

  // Verify list belongs to user
  const { data: list } = await supabase
    .from("lists")
    .select("id, user_id")
    .eq("id", listId)
    .single();

  if (!list) return { error: "List not found" };
  if (list.user_id !== user.id) return { error: "Not authorized" };

  const { error: updateError } = await supabase
    .from("lists")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", listId);

  if (updateError) return { error: "Failed to update list privacy" };

  return { success: true };
}

export async function getPublicListsForUser(
  userId: string,
  includePrivate: boolean = false
): Promise<{ error: string } | { success: true; lists: ListWithCount[] }> {
  const supabase = createAdminClient();

  let query = supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!includePrivate) {
    query = query.eq("is_public", true);
  }

  const { data: lists, error } = await query;

  if (error) return { error: "Failed to fetch lists" };

  // Get item counts for all lists in a single query
  const listIds = (lists || []).map((l) => l.id);
  const { data: itemCounts } = await supabase
    .from("list_items")
    .select("list_id")
    .in("list_id", listIds);

  // Count items per list
  const countMap: Record<string, number> = {};
  for (const item of itemCounts || []) {
    countMap[item.list_id] = (countMap[item.list_id] || 0) + 1;
  }

  const listsWithCount: ListWithCount[] = (lists || []).map((list) => ({
    id: list.id,
    user_id: list.user_id,
    name: list.name,
    description: list.description,
    is_public: list.is_public,
    created_at: list.created_at,
    updated_at: list.updated_at,
    item_count: countMap[list.id] || 0,
  }));

  return { success: true, lists: listsWithCount };
}

export async function removeFromList(
  listItemId: string
): Promise<{ error: string } | { success: true }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { error: "User not found" };

  // Get item and verify ownership
  const { data: item } = await supabase
    .from("list_items")
    .select("id, list_id, lists(user_id)")
    .eq("id", listItemId)
    .single();

  if (!item) return { error: "Item not found" };
  
  // Handle Supabase join result - could be object or array
  const listsData = item.lists;
  const listUserId = Array.isArray(listsData) 
    ? (listsData[0] as { user_id: string } | undefined)?.user_id
    : (listsData as { user_id: string } | null)?.user_id;
  if (listUserId !== user.id) return { error: "Not authorized" };

  const { error: deleteError } = await supabase
    .from("list_items")
    .delete()
    .eq("id", listItemId);

  if (deleteError) return { error: "Failed to remove from list" };

  // Update list's updated_at
  await supabase
    .from("lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", item.list_id);

  return { success: true };
}

// Types
export interface List {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListWithCount extends List {
  item_count: number;
}

export interface ListItem {
  id: string;
  list_id: string;
  restaurant_id: string;
  notes: string | null;
  visited: boolean;
  added_at: string;
}

export interface ListItemWithRestaurant extends ListItem {
  restaurant: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    photo_reference: string | null;
    google_maps_url: string | null;
    website: string | null;
  };
}

export interface ListWithItems extends List {
  items: ListItemWithRestaurant[];
}
