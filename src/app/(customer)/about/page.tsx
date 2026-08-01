import { SITE_CONTENT } from "@/data/site-content";

// Static "About Us" page rendered from site content — title, body copy, and stats.
export default function AboutPage() {
  const { about } = SITE_CONTENT;

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-lg">
      <div className="text-center mb-stack-lg">
        <span className="text-primary font-label-md text-label-md tracking-widest">ABOUT US</span>
        <h1 className="font-headline-lg text-headline-lg mt-2">{about.title}</h1>
      </div>

      {/* Body copy, one paragraph per array entry */}
      <div className="max-w-2xl mx-auto space-y-6">
        {about.body.map((paragraph, i) => (
          <p key={i} className="text-body-lg font-body-lg text-secondary">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Highlight stats (e.g. years in business, dishes served) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-stack-lg max-w-2xl mx-auto">
        {about.stats.map((stat) => (
          <div key={stat.label} className="text-center bg-surface-container-lowest rounded-2xl shadow-sm p-6">
            <p className="font-headline-lg text-headline-lg text-primary">{stat.value}</p>
            <p className="text-secondary text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
