import { Star, Quote } from "lucide-react";
import { SITE_CONTENT } from "@/data/site-content";

// Landing page section displaying customer testimonials in luxury dark cards
export function TestimonialsSection() {
  return (
    <section className="py-stack-md sm:py-stack-lg bg-surface-container-low px-margin-mobile md:px-margin-desktop border-t border-b border-outline-variant/20">
      <div className="max-w-container-max mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-1.5 w-6 bg-primary-container rounded-full" />
            <span className="text-primary-container font-label-md text-xs sm:text-label-md tracking-widest uppercase font-semibold">
              VOICES OF BITES
            </span>
            <span className="h-1.5 w-6 bg-primary-container rounded-full" />
          </div>
          <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-primary-fixed font-bold tracking-tight mb-3">
            What Our Customers Say
          </h2>
          <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant max-w-md mx-auto">
            Discover why late-night food lovers make Bites their first choice.
          </p>
        </div>

        {/* Reviews 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SITE_CONTENT.testimonials.map((t, idx) => (
            <div
              key={t.name}
              className="bg-surface-container p-6 sm:p-8 rounded-2xl shadow-xl border border-outline-variant/30 hover:border-primary-container/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top amber glow accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Header with stars and subtle quote icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-primary-container">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary-container text-primary-container" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-outline-variant/40 group-hover:text-primary-container/40 transition-colors" />
                </div>

                {/* Quote text */}
                <p className="font-body-md text-sm sm:text-base italic text-on-surface-variant mb-6 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-outline-variant/20">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-container/30 to-surface-container-high text-primary-fixed flex items-center justify-center font-bold text-sm shrink-0 border border-primary-container/30 shadow-inner">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-title-lg text-sm sm:text-base font-semibold text-primary-fixed">
                    {t.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
