-- ============================
-- PROFILE IMAGE & CV ASSETS
-- Run in Supabase SQL Editor (after portfolio_settings exists)
-- ============================

ALTER TABLE public.portfolio_settings
  ADD COLUMN IF NOT EXISTS profile_image_url text,
  ADD COLUMN IF NOT EXISTS cv_url text;

-- Storage bucket for profile photo and CV PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "public read portfolio assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

CREATE POLICY "admin upload portfolio assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "admin update portfolio assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'portfolio-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "admin delete portfolio assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
