import { SITE_CONTENT } from "@/data/site-content";

// Static "About Us" page rendered from site content — title, body copy, and stats.
export default function AboutPage() {
  const { about } = SITE_CONTENT;

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg">
      <div className="text-center mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">ABOUT US</span>
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface font-bold">{about.title}</h1>
      </div>

      {/* Body copy, one paragraph per array entry */}
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {about.body.map((paragraph, i) => (
          <p key={i} className="text-body-md sm:text-body-lg font-body-md text-secondary leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Highlight stats (e.g. years in business, dishes served) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-stack-md sm:mt-stack-lg max-w-2xl mx-auto">
        {about.stats.map((stat) => (
          <div key={stat.label} className="text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 sm:p-6">
            <p className="font-headline-lg text-3xl sm:text-headline-lg text-primary font-bold">{stat.value}</p>
            <p className="text-secondary text-xs sm:text-sm font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
