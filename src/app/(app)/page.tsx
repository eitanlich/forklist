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

  const totalReviews = reviews.length;
  const restaurantIds = new Set(reviews.map((r) => JSON.stringify(r.restaurant)));
  const uniqueRestaurants = restaurantIds.size;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating_overall, 0) / totalReviews;

  const occasionCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    if (r.occasion) {
      occasionCounts[r.occasion] = (occasionCounts[r.occasion] || 0) + 1;
    }
  });
  const topOccasion = Object.entries(occasionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const cuisineCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    const restaurant = Array.isArray(r.restaurant) ? r.restaurant[0] : r.restaurant;
    const cuisine = (restaurant as { cuisine_type: string | null } | null)?.cuisine_type;
    if (cuisine) {
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    }
  });
  const topCuisine = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { totalReviews, uniqueRestaurants, avgRating, topOccasion, topCuisine };
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
    <div className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:bg-card/80">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={15} strokeWidth={1.5} />
        <span className="text-sm font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="font-serif text-3xl font-semibold tracking-tight">{value}</p>
      {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}
    </div>
  );
}

export default async function HomePage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  const supabase = createAdminClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId!)
    .single();

  const stats = dbUser
    ? await getUserStats(dbUser.id)
    : { totalReviews: 0, uniqueRestaurants: 0, avgRating: null, topOccasion: null, topCuisine: null };

  const hasReviews = stats.totalReviews > 0;

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div className="space-y-1">
        <p className="text-base text-muted-foreground font-medium">Welcome back,</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">{firstName}</h1>
      </div>

      {/* Search CTA */}
      <Link
        href="/add"
        className="group flex items-center gap-4 rounded-2xl border border-border bg-secondary/50 px-5 py-4 text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:bg-secondary hover:text-foreground"
      >
        <Search size={18} strokeWidth={1.5} className="transition-transform duration-300 group-hover:scale-110" />
        <span className="text-base">Search for a restaurant...</span>
      </Link>

      {/* Stats Grid */}
      {hasReviews ? (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Utensils}
            label="Places"
            value={stats.uniqueRestaurants}
            subtext={`${stats.totalReviews} visits`}
          />
          <StatCard
            icon={Star}
            label="Rating"
            value={stats.avgRating?.toFixed(1) ?? "-"}
            subtext="average"
          />
          {stats.topOccasion && (
            <StatCard
              icon={Users}
              label="Occasion"
              value={OCCASION_LABELS[stats.topOccasion] ?? stats.topOccasion}
            />
          )}
          {stats.topCuisine && (
            <StatCard
              icon={TrendingUp}
              label="Cuisine"
              value={stats.topCuisine}
            />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <Utensils className="mx-auto h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-4 text-base text-muted-foreground">
            No visits logged yet. Start exploring!
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/add"
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-8 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <Plus size={22} strokeWidth={2} />
          </div>
          <span className="text-base font-medium">Log a Visit</span>
        </Link>

        <Link
          href="/history"
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-8 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-transform duration-300 group-hover:scale-110">
            <span className="font-serif text-xl font-semibold">H</span>
          </div>
          <span className="text-base font-medium">My History</span>
        </Link>
      </div>
    </div>
  );
}
