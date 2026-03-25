-- Add photo_url column to reviews table
-- Run this in Supabase SQL Editor

ALTER TABLE reviews
ADD COLUMN photo_url TEXT DEFAULT NULL;

-- Create index for queries that filter by photo presence (optional, for future "reviews with photos" filter)
CREATE INDEX idx_reviews_has_photo ON reviews ((photo_url IS NOT NULL));

-- Create storage bucket for review photos (run in Storage section or via SQL)
-- Note: You may need to create this via the Supabase Dashboard > Storage > New Bucket
-- Bucket name: review-photos
-- Public: Yes (so images can be displayed without auth)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Storage policy to allow authenticated users to upload their own photos
-- (Run this after creating the bucket)

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload review photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-photos'
);

-- Allow users to update their own photos
CREATE POLICY "Users can update own review photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'review-photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own review photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'review-photos');

-- Allow public read access (photos are public)
CREATE POLICY "Public read access for review photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-photos');
