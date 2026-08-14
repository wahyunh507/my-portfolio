-- ============================
-- PORTFOLIO SETTINGS (singleton CMS)
-- Run once in Supabase SQL Editor
-- ============================
CREATE TABLE public.portfolio_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_title text NOT NULL DEFAULT '',
  hero_subtitle text NOT NULL DEFAULT '',
  about_text text NOT NULL DEFAULT '',
  skills_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  email text,
  github_url text,
  linkedin_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read portfolio settings"
ON public.portfolio_settings FOR SELECT USING (true);

CREATE POLICY "admin update portfolio settings"
ON public.portfolio_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

INSERT INTO public.portfolio_settings (
  id,
  hero_title,
  hero_subtitle,
  about_text,
  skills_json,
  email,
  github_url,
  linkedin_url
) VALUES (
  1,
  'Wahyu Nur Hidayat',
  'Full-stack Developer & IoT Researcher',
  'An undergraduate student at Politeknik Elektronika Negeri Surabaya (PENS), actively researching within the Laboratorium IoT PENS. Experienced in full-stack and embedded software development, including leading the development of the Fiyansa Attendance app at PT Fiyansa Mulya. Passionate about integrating IoT (Tuya, ESP8266), backend systems (Laravel), and server administration (Ubuntu/Nginx).',
  '[
    {"icon": "reactjs.svg", "language": "ReactJS"},
    {"icon": "javascript.svg", "language": "JavaScript"},
    {"icon": "nodejs.svg", "language": "Node JS"},
    {"icon": "tailwind.svg", "language": "Tailwind CSS"},
    {"icon": "html.svg", "language": "HTML"},
    {"icon": "css.svg", "language": "CSS"}
  ]'::jsonb,
  'your-email@example.com',
  'https://github.com/your-username',
  'https://www.linkedin.com/in/your-profile'
);
