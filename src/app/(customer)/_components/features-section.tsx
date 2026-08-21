import { Truck, Sparkles, Clock, ShieldCheck, Utensils, Award, CheckCircle } from "lucide-react";
import { SITE_CONTENT } from "@/data/site-content";

// Map icon names from site-content.ts to Lucide components
const ICONS = {
  Truck,
  Sparkles,
  Clock,
  ShieldCheck,
  Utensils,
  Award,
  CheckCircle,
} as const;

// Landing page section listing the brand value propositions in luxury dark cards
export function FeaturesSection() {
  return (
    <section className="py-stack-md sm:py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="h-1.5 w-6 bg-primary-container rounded-full" />
          <span className="text-primary-container font-label-md text-xs sm:text-label-md tracking-widest uppercase font-semibold">
            WHY BITES
          </span>
          <span className="h-1.5 w-6 bg-primary-container rounded-full" />
        </div>
        <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-primary-fixed font-bold tracking-tight mb-3">
          The Bites Standard
        </h2>
        <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant max-w-xl mx-auto">
          We treat late-night dining with uncompromising quality, artisan craft, and rapid delivery.
        </p>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {SITE_CONTENT.features.map((feature, index) => {
          const Icon = ICONS[feature.icon as keyof typeof ICONS] || Sparkles;
          return (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary-container/60 hover:-translate-y-1.5 transition-all duration-300 shadow-lg group relative overflow-hidden"
            >
              {/* Subtle top amber glow accent line */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon Container with subtle inner shadow & glowing hover */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-container border border-outline-variant/40 flex items-center justify-center mb-4 sm:mb-5 text-primary-container group-hover:scale-110 group-hover:border-primary-container group-hover:shadow-glow transition-all duration-300 shrink-0">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              {/* Title & Description */}
              <h3 className="font-title-lg text-base sm:text-title-lg font-semibold text-on-surface mb-2 group-hover:text-primary-fixed transition-colors">
                {feature.title}
              </h3>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>

              {/* Step / Standard Index Indicator */}
              <span className="mt-4 text-[10px] tracking-widest uppercase font-semibold text-outline font-label-md">
                0{index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
