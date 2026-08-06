import { Star } from "lucide-react";
import { SITE_CONTENT } from "@/data/site-content";

// Landing page section displaying customer testimonials from static site content.
export function TestimonialsSection() {
  return (
    <section className="py-stack-md sm:py-stack-lg bg-surface-container-low px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-stack-md sm:mb-stack-lg">
          <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">REVIEWS</span>
          <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface font-bold">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {SITE_CONTENT.testimonials.map((t) => (
            <div key={t.name} className="bg-surface-container-lowest p-5 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                {/* Render one filled star per rating point */}
                <div className="flex gap-1 text-primary mb-3 sm:mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-body-md sm:text-body-lg font-body-md italic text-secondary mb-6">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-fixed/60 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-outline-variant/30">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-label-md text-body-md sm:text-label-md font-semibold text-on-surface">{t.name}</h4>
                  <p className="text-xs text-secondary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
