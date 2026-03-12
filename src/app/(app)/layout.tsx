import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { I18nProvider } from "@/lib/i18n";
import { UserProvider } from "@/lib/user";

async function ensureUserExists() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return true; // Not logged in, let middleware handle it
  
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  
  // If user doesn't exist in DB but has Clerk session, something is broken
  // This happens when account deletion partially failed
  if (!user) {
    return false;
  }
  return true;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userExists = await ensureUserExists();
  
  // User has Clerk session but no DB record - force sign out
  if (!userExists) {
    redirect("/api/auth/force-signout");
  }
  
  return (
    <I18nProvider>
      <UserProvider>
        <div className="flex min-h-dvh flex-col">
          <Header />
          {/* More generous padding for boutique feel */}
          <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-24 pt-8 md:px-8 md:pb-10">
            {children}
          </main>
          <BottomNav />
        </div>
      </UserProvider>
    </I18nProvider>
  );
}
