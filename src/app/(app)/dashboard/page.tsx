import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, Search, Utensils, Star, Users, TrendingUp } from "lucide-react";

interface UserStats {
  totalReviews: number;
  uniqueRestaurants: number;
  avgRating: number | null;
  topOccasion: string | null;
  topCuisine: string | null;
}

const OCCASION_LABELS: Record<string, string> = {
  date: "Date Night",
  family: "Family",
  friends: "Friends",
  business: "Business",
  solo: "Solo",
  other: "Other",
};

async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createAdminClient();

  // Get all reviews for this user with restaurant data
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating_overall, occasion, restaurant:restaurants(cuisine_type)")
    .eq("user_id", userId);

  if (!reviews || reviews.length === 0) {
    return {
      totalReviews: 0,
      uniqueRestaurants: 0,
      avgRating: null,
      topOccasion: null,
      topCuisine: null,
    };
  }

  // Calculate stats
  const totalReviews = reviews.length;
  
  // Count unique restaurants (by counting unique restaurant objects)
  const restaurantIds = new Set(reviews.map((r) => JSON.stringify(r.restaurant)));
  const uniqueRestaurants = restaurantIds.size;

  // Average rating
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating_overall, 0) / totalReviews;

  // Top occasion (most frequent)
  const occasionCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    if (r.occasion) {
      occasionCounts[r.occasion] = (occasionCounts[r.occasion] || 0) + 1;
    }
  });
  const topOccasion =
    Object.entries(occasionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Top cuisine (most frequent)
  const cuisineCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    const cuisine = (r.restaurant as { cuisine_type: string | null })?.cuisine_type;
    if (cuisine) {
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    }
  });
  const topCuisine =
    Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalReviews,
    uniqueRestaurants,
    avgRating,
    topOccasion,
    topCuisine,
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-serif text-2xl font-semibold">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  // Get user from Supabase
  const supabase = createAdminClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId!)
    .single();

  const stats = dbUser
    ? await getUserStats(dbUser.id)
    : {
        totalReviews: 0,
        uniqueRestaurants: 0,
        avgRating: null,
        topOccasion: null,
        topCuisine: null,
      };

  const hasReviews = stats.totalReviews > 0;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="font-serif text-3xl font-semibold">{firstName}</h1>
      </div>

      {/* Search CTA */}
      <Link
        href="/add"
        className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Search size={16} />
        <span className="text-sm">Search for a restaurant...</span>
      </Link>

      {/* Stats Grid */}
      {hasReviews ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Utensils}
            label="Restaurants"
            value={stats.uniqueRestaurants}
            subtext={`${stats.totalReviews} total visits`}
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value={stats.avgRating?.toFixed(1) ?? "-"}
            subtext="across all reviews"
          />
          {stats.topOccasion && (
            <StatCard
              icon={Users}
              label="Top Occasion"
              value={OCCASION_LABELS[stats.topOccasion] ?? stats.topOccasion}
            />
          )}
          {stats.topCuisine && (
            <StatCard
              icon={TrendingUp}
              label="Favorite Cuisine"
              value={stats.topCuisine}
            />
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
          <Utensils className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No visits logged yet. Start exploring!
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/add"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-6 transition-colors hover:border-primary/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus size={20} />
          </div>
          <span className="text-sm font-medium">Log a Visit</span>
        </Link>

        <Link
          href="/history"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-6 transition-colors hover:border-primary/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <span className="font-serif text-lg font-semibold">H</span>
          </div>
          <span className="text-sm font-medium">My History</span>
        </Link>
      </div>
    </div>
  );
}
