import { Star } from "lucide-react";
import { SITE_CONTENT } from "@/data/site-content";

// Landing page section displaying customer testimonials from static site content.
export function TestimonialsSection() {
  return (
    <section className="py-stack-lg bg-surface-container-low px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-stack-lg">
          <span className="text-primary font-label-md text-label-md tracking-widest">REVIEWS</span>
          <h2 className="font-headline-lg text-headline-lg mt-2">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SITE_CONTENT.testimonials.map((t) => (
            <div key={t.name} className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
              {/* Render one filled star per rating point */}
              <div className="flex gap-1 text-primary-container mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" fill="currentColor" />
                ))}
              </div>
              <p className="text-body-lg font-body-lg italic text-secondary mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed" />
                <div>
                  <h5 className="font-label-md text-label-md">{t.name}</h5>
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
