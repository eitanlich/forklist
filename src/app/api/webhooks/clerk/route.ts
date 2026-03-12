import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Verify the webhook signature with svix
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createAdminClient();

  if (evt.type === "user.created") {
    const { id, email_addresses, username } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    
    // Only use username if explicitly set in Clerk, otherwise leave null for onboarding
    const { error } = await supabase.from("users").insert({
      clerk_id: id,
      email,
      username: username || null,
    });

    if (error) {
      console.error("Error inserting user:", error);
      return new Response("Database error", { status: 500 });
    }
  }

  if (evt.type === "user.updated") {
    const { id, email_addresses, username } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";

    const { error } = await supabase
      .from("users")
      .update({ email, username: username ?? null })
      .eq("clerk_id", id);

    if (error) {
      console.error("Error updating user:", error);
      return new Response("Database error", { status: 500 });
    }
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    
    if (id) {
      // Delete user from Supabase (CASCADE will handle reviews, follows, likes)
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("clerk_id", id);

      if (error) {
        console.error("Error deleting user:", error);
        return new Response("Database error", { status: 500 });
      }
    }
  }

  return new Response("OK", { status: 200 });
}
