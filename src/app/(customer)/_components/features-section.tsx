import { Truck, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { SITE_CONTENT } from "@/data/site-content";

// Icon names in site-content.ts map to actual components here — keeps the
// data file free of JSX/imports so it stays pure, editable content.
const ICONS = { Truck, Sparkles, Clock, ShieldCheck } as const;

// Landing page section listing the site's selling points, each with an icon.
export function FeaturesSection() {
  return (
    <section className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="text-center mb-stack-lg">
        <span className="text-primary font-label-md text-label-md tracking-widest">WHY BITES</span>
        <h2 className="font-headline-lg text-headline-lg mt-2">More Than Just A Food Place</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SITE_CONTENT.features.map((feature) => {
          // Look up the actual icon component for this feature's icon name
          const Icon = ICONS[feature.icon as keyof typeof ICONS];
          return (
            <div key={feature.title} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-surface-container-lowest shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-label-md text-label-md">{feature.title}</h4>
              <p className="text-body-md text-secondary text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
