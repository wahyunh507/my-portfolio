import { useEffect } from "react";
import { Linkedin, Github, ExternalLink } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const SocialLinks = ({ githubUrl = "", linkedinUrl = "" }) => {
  useEffect(() => {
    AOS.init({ offset: 10 });
  }, []);

  const links = [
    linkedinUrl && {
      name: "LinkedIn",
      displayName: "Let's Connect",
      subText: "on LinkedIn",
      icon: Linkedin,
      url: linkedinUrl,
      color: "#0A66C2",
      gradient: "from-[#0A66C2] to-[#0077B5]",
      isPrimary: true,
    },
    githubUrl && {
      name: "GitHub",
      displayName: "Github",
      subText: "View repositories",
      icon: Github,
      url: githubUrl,
      color: "#ffffff",
      gradient: "from-[#333] to-[#24292e]",
    },
  ].filter(Boolean);

  if (links.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 py-8 backdrop-blur-xl text-center text-gray-500 text-sm">
        Social links will appear here once configured in General Settings.
      </div>
    );
  }

  const primary = links.find((l) => l.isPrimary) || links[0];
  const secondary = links.filter((l) => l !== primary);

  return (
    <div className="w-full bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 py-8 backdrop-blur-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2" data-aos="fade-down">
        <span className="inline-block w-8 h-1 bg-indigo-500 rounded-full"></span>
        Connect With Me
      </h3>

      <div className="flex flex-col gap-4">
        <a
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${primary.gradient}`} />
          <div className="relative flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 rounded-md transition-all duration-500 group-hover:scale-110 group-hover:opacity-30" style={{ backgroundColor: primary.color }} />
              <div className="relative p-2 rounded-md">
                <primary.icon className="w-6 h-6 transition-all duration-500 group-hover:scale-105" style={{ color: primary.color }} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold pt-[0.2rem] text-gray-200 tracking-tight leading-none group-hover:text-white transition-colors duration-300">
                {primary.displayName}
              </span>
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {primary.subText}
              </span>
            </div>
          </div>
          <ExternalLink className="relative w-5 h-5 text-gray-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </a>

        {secondary.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {secondary.map((link, index) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500"
                data-aos="fade-up"
                data-aos-delay={200 + index * 100}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${link.gradient}`} />
                <div className="relative p-2 rounded-lg">
                  <link.icon className="w-5 h-5" style={{ color: link.color }} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-200 group-hover:text-white">{link.displayName}</span>
                  <span className="text-xs text-gray-400 truncate">{link.subText}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialLinks;
