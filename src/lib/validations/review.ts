import { z } from "zod";

export const reviewSchema = z.object({
  // Restaurant fields (upserted along with the review)
  google_place_id: z.string().min(1),
  restaurant_name: z.string().min(1),
  restaurant_address: z.string().nullish(),
  restaurant_city: z.string().nullish(),
  restaurant_lat: z.number().nullish(),
  restaurant_lng: z.number().nullish(),
  restaurant_photo_reference: z.string().nullish(),
  restaurant_cuisine_type: z.string().nullish(),
  restaurant_website: z.string().nullish(),
  restaurant_google_maps_url: z.string().nullish(),

  // Review fields — 1-5 star scale
  rating_overall: z.number().int().min(1).max(5),
  rating_food: z.number().int().min(1).max(5),
  rating_service: z.number().int().min(1).max(5),
  rating_ambiance: z.number().int().min(1).max(5),
  rating_price: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  occasion: z
    .enum(["date", "family", "friends", "business", "solo", "other"])
    .optional(),
  visited_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// For updating just the review fields (not restaurant)
export const updateReviewSchema = z.object({
  rating_overall: z.number().int().min(1).max(5),
  rating_food: z.number().int().min(1).max(5),
  rating_service: z.number().int().min(1).max(5),
  rating_ambiance: z.number().int().min(1).max(5),
  rating_price: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  occasion: z
    .enum(["date", "family", "friends", "business", "solo", "other"])
    .optional(),
  visited_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
