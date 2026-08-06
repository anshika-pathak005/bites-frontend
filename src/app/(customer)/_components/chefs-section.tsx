import Image from "next/image";
import { SITE_CONTENT } from "@/data/site-content";

// Landing page section showcasing the restaurant's chefs from static site content.
export function ChefsSection() {
  return (
    <section className="py-stack-md sm:py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="text-center mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">OUR CHEFS</span>
        <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface font-bold">Meet Our Super Chefs</h2>
      </div>
      {/* Chef cards grid - balanced across all devices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {SITE_CONTENT.chefs.map((chef) => (
          <div key={chef.name} className="group text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="aspect-[4/5] overflow-hidden rounded-xl mb-3 relative bg-surface-container">
              <Image
                src={chef.imageUrl}
                alt={chef.name}
                fill
                className="object-cover group-hover:scale-105 transition-all duration-500"
              />
            </div>
            <h4 className="font-label-md text-body-md sm:text-label-md font-semibold text-on-surface line-clamp-1">{chef.name}</h4>
            <p className="text-xs sm:text-sm text-secondary mt-0.5">{chef.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
