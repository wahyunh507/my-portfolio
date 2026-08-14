import { useEffect, useState, memo } from 'react';
import { Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { supabase } from '../supabase';

const DEFAULT_EXPERIENCE = [
  { id: 1, title: 'Software Engineer (MagangHub Program)', organization: 'PT. Fiyansa Mulya', start_date: '16 Dec 2025', end_date: '15 Jun 2026' },
  { id: 2, title: 'Research Assistant', organization: 'Human Centric Multimedia Laboratorium, PENS', start_date: '15 June 2023', end_date: 'Now' },
  { id: 3, title: 'Freelance', organization: 'PT. Fiyansa Mulya', start_date: 'Oct 2024', end_date: 'Now' },
];

const DEFAULT_EDUCATION = [
  { id: 1, degree: "Master's Degree in Applied Informatics and Computer Engineering", institution: 'Politeknik Elektronika Negeri Surabaya', start_date: 'July 2025', end_date: 'Now' },
  { id: 2, degree: "Bachelor's Degree in Informatics and Computer Engineering", institution: 'Politeknik Elektronika Negeri Surabaya', start_date: 'May 2024', end_date: 'May 2025' },
  { id: 3, degree: 'Diploma III Informatics and Computer Engineering', institution: 'Politeknik Elektronika Negeri Surabaya', start_date: 'July 2021', end_date: 'Sep 2024' },
];

const TimelineItem = memo(({ icon: Icon, title, subtitle, period, description, index, color = 'indigo' }) => (
  <div className="relative pl-8 sm:pl-10 pb-10 last:pb-0" data-aos="fade-up" data-aos-delay={index * 100}>
    <div className="absolute left-0 top-1 flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-indigo-500/20 z-10`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-500/50 to-purple-500/20 min-h-[calc(100%+1rem)] absolute top-8" />
    </div>
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
      <div className="relative">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
          {period}
        </span>
        <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">{title}</h3>
        <p className="text-indigo-300/90 text-sm mt-1">{subtitle}</p>
        {description && <p className="text-gray-400 text-sm mt-3 leading-relaxed">{description}</p>}
      </div>
    </div>
  </div>
));

const TimelineSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="pl-10">
        <div className="h-28 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    ))}
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="text-center mb-10" data-aos="fade-up">
    <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
      {title}
    </h2>
    <p className="mt-2 text-gray-400 text-sm sm:text-base flex items-center justify-center gap-2">
      <Sparkles className="w-4 h-4 text-purple-400" />
      {subtitle}
      <Sparkles className="w-4 h-4 text-purple-400" />
    </p>
  </div>
);

export default function Resume() {
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ once: true, offset: 80 });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [expRes, eduRes] = await Promise.all([
        supabase.from('portfolio_experience').select('*').order('order_index', { ascending: true }),
        supabase.from('portfolio_education').select('*').order('order_index', { ascending: true }),
      ]);
      setExperience(expRes.data?.length ? expRes.data : DEFAULT_EXPERIENCE);
      setEducation(eduRes.data?.length ? eduRes.data : DEFAULT_EDUCATION);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <section
      id="Resume"
      className="px-[5%] sm:px-[5%] lg:px-[10%] py-16 sm:py-20 text-white overflow-hidden"
    >
      <SectionHeader title="Education & Experience" subtitle="My academic journey and professional path" />

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div>
          <div className="flex items-center gap-2 mb-8" data-aos="fade-right">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-semibold text-white">Education</h3>
          </div>
          {loading ? (
            <TimelineSkeleton />
          ) : (
            <div className="relative">
              {education.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  icon={GraduationCap}
                  title={item.degree}
                  subtitle={item.institution}
                  period={`${item.start_date} — ${item.end_date}`}
                  description={item.description}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-8" data-aos="fade-left">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Experience</h3>
          </div>
          {loading ? (
            <TimelineSkeleton />
          ) : (
            <div className="relative">
              {experience.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  icon={Briefcase}
                  title={item.title}
                  subtitle={item.organization}
                  period={`${item.start_date} — ${item.end_date}`}
                  description={item.description}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
