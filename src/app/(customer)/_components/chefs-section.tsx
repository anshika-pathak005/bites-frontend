import Image from "next/image";
import { SITE_CONTENT } from "@/data/site-content";

// Landing page section showcasing the restaurant's chefs from static site content.
export function ChefsSection() {
  return (
    <section className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="text-center mb-stack-lg">
        <span className="text-primary font-label-md text-label-md tracking-widest">OUR CHEFS</span>
        <h2 className="font-headline-lg text-headline-lg mt-2">Meet Our Super Chefs</h2>
      </div>
      {/* Chef cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:w-1/2 md:mx-auto gap-6">
        {SITE_CONTENT.chefs.map((chef) => (
          <div key={chef.name} className="group text-center">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl mb-4 relative">
              <Image
                src={chef.imageUrl}
                alt={chef.name}
                fill
                className="object-cover group-hover:scale-110 transition-all duration-500"
              />
            </div>
            <h4 className="font-label-md text-label-md">{chef.name}</h4>
            <p className="text-sm text-secondary">{chef.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
