-- ============================================================
-- SECURITY & ASSETS UPGRADE
-- Run in Supabase SQL Editor (idempotent, safe to re-run)
-- Requires: public.portfolio_settings, public.profiles,
--           public.portfolio_comments tables already exist.
-- ============================================================

-- ============================================================
-- 1. PORTFOLIO SETTINGS: profile photo & CV columns + defaults
-- ============================================================
ALTER TABLE public.portfolio_settings
  ADD COLUMN IF NOT EXISTS profile_image_url text,
  ADD COLUMN IF NOT EXISTS cv_url text;

-- Update column defaults so fresh installs reflect the current status
ALTER TABLE public.portfolio_settings
  ALTER COLUMN hero_subtitle SET DEFAULT 'Master''s Degree Student in Applied Informatics at PENS | IoT | Digital Twin | DevOps AI',
  ALTER COLUMN about_text SET DEFAULT 'Master''s Degree student in Applied Informatics at Politeknik Elektronika Negeri Surabaya (PENS), specializing in IoT, Digital Twin, and AI-assisted DevOps. Passionate about building intelligent connected systems, digital twin simulations, and automated deployment pipelines that bridge research and production.';

-- Refresh the live singleton row to the new status (keeps other fields intact)
UPDATE public.portfolio_settings
SET hero_subtitle = 'Master''s Degree Student in Applied Informatics at PENS | IoT | Digital Twin | DevOps AI',
    about_text    = 'Master''s Degree student in Applied Informatics at Politeknik Elektronika Negeri Surabaya (PENS), specializing in IoT, Digital Twin, and AI-assisted DevOps. Passionate about building intelligent connected systems, digital twin simulations, and automated deployment pipelines that bridge research and production.'
WHERE id = 1;

-- ============================================================
-- 2. STORAGE BUCKETS: size limits & allowed MIME types
-- ============================================================
-- portfolio-assets: profile photo + CV (5MB, images + pdf)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-assets',
  'portfolio-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public            = true,
    file_size_limit   = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[];

-- profile-images: public comment avatars (2MB, images only — blocks SVG/HTML XSS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public            = true,
    file_size_limit   = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- ============================================================
-- 3. STORAGE RLS: portfolio-assets (public read, admin-only write)
-- ============================================================
DROP POLICY IF EXISTS "public read portfolio assets" ON storage.objects;
CREATE POLICY "public read portfolio assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "admin upload portfolio assets" ON storage.objects;
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

DROP POLICY IF EXISTS "admin update portfolio assets" ON storage.objects;
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

DROP POLICY IF EXISTS "admin delete portfolio assets" ON storage.objects;
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

-- ============================================================
-- 4. COMMENT SPAM GUARDS: length CHECK constraints
-- ============================================================
ALTER TABLE public.portfolio_comments
  DROP CONSTRAINT IF EXISTS portfolio_comments_user_name_len_check;
ALTER TABLE public.portfolio_comments
  ADD CONSTRAINT portfolio_comments_user_name_len_check
  CHECK (char_length(user_name) <= 80);

ALTER TABLE public.portfolio_comments
  DROP CONSTRAINT IF EXISTS portfolio_comments_content_len_check;
ALTER TABLE public.portfolio_comments
  ADD CONSTRAINT portfolio_comments_content_len_check
  CHECK (char_length(content) <= 1000);
