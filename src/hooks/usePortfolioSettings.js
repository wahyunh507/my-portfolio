import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';

export const DEFAULT_PORTFOLIO_SETTINGS = {
  id: 1,
  hero_title: 'Wahyu Nur Hidayat',
  hero_subtitle: 'Full-stack Developer & IoT Researcher',
  about_text:
    'An undergraduate student at Politeknik Elektronika Negeri Surabaya (PENS), actively researching within the Laboratorium IoT PENS. Experienced in full-stack and embedded software development, including leading the development of the Fiyansa Attendance app at PT Fiyansa Mulya. Passionate about integrating IoT (Tuya, ESP8266), backend systems (Laravel), and server administration (Ubuntu/Nginx).',
  skills_json: [
    { icon: 'reactjs.svg', language: 'ReactJS' },
    { icon: 'javascript.svg', language: 'JavaScript' },
    { icon: 'nodejs.svg', language: 'Node JS' },
    { icon: 'tailwind.svg', language: 'Tailwind CSS' },
    { icon: 'html.svg', language: 'HTML' },
    { icon: 'css.svg', language: 'CSS' },
  ],
  email: 'your-email@example.com',
  github_url: 'https://github.com/your-username',
  linkedin_url: 'https://www.linkedin.com/in/your-profile',
  profile_image_url: '/Photo.jpg',
  cv_url: null,
};

export function parseSubtitleWords(subtitle) {
  if (!subtitle) return [DEFAULT_PORTFOLIO_SETTINGS.hero_subtitle];
  return subtitle.split('|').map((s) => s.trim()).filter(Boolean);
}

export function usePortfolioSettings() {
  const [settings, setSettings] = useState(DEFAULT_PORTFOLIO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setSettings(DEFAULT_PORTFOLIO_SETTINGS);
    } else if (data) {
      setSettings({
        ...DEFAULT_PORTFOLIO_SETTINGS,
        ...data,
        skills_json: Array.isArray(data.skills_json)
          ? data.skills_json
          : DEFAULT_PORTFOLIO_SETTINGS.skills_json,
      });
    } else {
      setSettings(DEFAULT_PORTFOLIO_SETTINGS);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, error, refetch: fetchSettings };
}
