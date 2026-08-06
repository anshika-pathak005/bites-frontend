import Image from "next/image";
import Link from "next/link";
import { Utensils, IceCream, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE_CONTENT } from "@/data/site-content";

// Landing page hero banner with headline, CTAs, and a decorated hero image.
export function HeroSection() {
  const { hero } = SITE_CONTENT;

  return (
    <section className="relative overflow-hidden px-margin-mobile md:px-margin-desktop py-stack-md sm:py-stack-lg max-w-container-max mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center min-h-[500px] sm:min-h-[600px]">
        <div className="space-y-stack-sm sm:space-y-stack-md z-10 text-center lg:text-left">
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-headline-xl text-on-surface font-bold leading-tight">
            {hero.title} <br className="hidden sm:inline" /> <span className="text-primary">{hero.highlight}</span> 
          </h1>
          <p className="text-body-md sm:text-body-lg font-body-md text-secondary max-w-lg mx-auto lg:mx-0">{hero.subtitle}</p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Link href={ROUTES.menu}>
              <Button size="lg" className="text-white">Explore Food</Button>
            </Link>
            <Link href={ROUTES.trackOrder}>
              <Button variant="outline" size="lg">Track Order</Button>
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center items-center mt-6 lg:mt-0">
          {/* Blurred glow behind the hero image */}
          <div className="absolute w-[110%] h-[110%] bg-primary-fixed/30 rounded-full blur-3xl -z-10" />
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[360px] md:max-w-[420px]">
            <Image
              src={hero.imageUrl}
              alt="Signature dish from Bites"
              fill
              className="object-cover rounded-full shadow-2xl border-4 sm:border-8 border-surface-container-lowest"
              priority
            />
            {/* Floating category badges over the hero image with responsive bounds */}
            <div className="absolute -top-2 sm:-top-4 right-0 sm:-right-4 bg-surface-container-lowest border border-outline-variant/30 shadow-lg rounded-full px-3 py-1.5 sm:px-5 sm:py-3 flex items-center gap-1.5 sm:gap-2">
              <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="font-label-md text-xs sm:text-label-md font-semibold text-on-surface">Dishes</span>
            </div>
            <div className="absolute bottom-6 sm:bottom-1/4 left-0 sm:-left-6 bg-surface-container-lowest border border-outline-variant/30 shadow-lg rounded-full px-3 py-1.5 sm:px-5 sm:py-3 flex items-center gap-1.5 sm:gap-2">
              <IceCream className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="font-label-md text-xs sm:text-label-md font-semibold text-on-surface">Dessert</span>
            </div>
            <div className="absolute -bottom-2 sm:-bottom-4 right-6 sm:right-1/4 bg-surface-container-lowest border border-outline-variant/30 shadow-lg rounded-full px-3 py-1.5 sm:px-5 sm:py-3 flex items-center gap-1.5 sm:gap-2">
              <Wine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="font-label-md text-xs sm:text-label-md font-semibold text-on-surface">Drinks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
