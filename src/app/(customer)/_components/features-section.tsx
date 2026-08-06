import { Truck, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { SITE_CONTENT } from "@/data/site-content";

// Icon names in site-content.ts map to actual components here — keeps the
// data file free of JSX/imports so it stays pure, editable content.
const ICONS = { Truck, Sparkles, Clock, ShieldCheck } as const;

// Landing page section listing the site's selling points, each with an icon.
export function FeaturesSection() {
  return (
    <section className="py-stack-md sm:py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="text-center mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">WHY BITES</span>
        <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface font-bold">More Than Just A Food Place</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {SITE_CONTENT.features.map((feature) => {
          // Look up the actual icon component for this feature's icon name
          const Icon = ICONS[feature.icon as keyof typeof ICONS];
          return (
            <div key={feature.title} className="flex flex-col items-center text-center gap-3 p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary-fixed/50 flex items-center justify-center">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="font-label-md text-body-md sm:text-label-md font-semibold text-on-surface">{feature.title}</h3>
              <p className="text-secondary text-xs sm:text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
