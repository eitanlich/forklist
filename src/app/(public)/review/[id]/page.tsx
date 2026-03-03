import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicReview } from "@/lib/actions/reviews";
import { ReviewContent } from "./ReviewContent";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const review = await getPublicReview(id);

  if (!review) {
    return {
      title: "Review Not Found - ForkList",
    };
  }

  const restaurant = review.restaurant as any;
  const user = review.user as any;
  const username = user?.username || "Someone";
  
  const title = `${restaurant.name} - Review by @${username} | ForkList`;
  const description = review.comment 
    ? `"${review.comment.slice(0, 150)}${review.comment.length > 150 ? "..." : ""}" - ${review.rating_overall}/5 stars`
    : `${username} rated ${restaurant.name} ${review.rating_overall}/5 stars on ForkList`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://forklist.app";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${baseUrl}/review/${id}`,
      siteName: "ForkList",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function PublicReviewPage({ params }: Props) {
  const { id } = await params;
  const review = await getPublicReview(id);

  if (!review) {
    notFound();
  }

  return <ReviewContent review={review} />;
}
