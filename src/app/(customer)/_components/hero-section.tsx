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
    <section className="relative overflow-hidden px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center min-h-[600px]">
        <div className="space-y-stack-md z-10">
          <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl text-on-surface leading-tight">
            {hero.title} <br /> <span className="text-primary">{hero.highlight}</span> 
          </h1>
          <p className="text-body-lg font-body-lg text-secondary max-w-lg">{hero.subtitle}</p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href={ROUTES.menu}>
              <Button size="lg">Explore Food</Button>
            </Link>
            <Link href={ROUTES.trackOrder}>
              <Button variant="outline" size="lg">Track Order</Button>
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center items-center">
          {/* Blurred glow behind the hero image */}
          <div className="absolute w-[120%] h-[120%] bg-primary-fixed/30 rounded-full blur-3xl -z-10" />
          <div className="relative w-full aspect-square max-w-[420px]">
            <Image
              src={hero.imageUrl}
              alt="Signature dish from Bites"
              fill
              className="object-cover rounded-full shadow-2xl border-8 border-surface-container-lowest"
              priority
            />
            {/* Floating category badges over the hero image */}
            <div className="absolute -top-4 -right-4 bg-surface-container-lowest shadow-xl rounded-full px-5 py-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" />
              <span className="font-label-md text-label-md">Dishes</span>
            </div>
            <div className="absolute bottom-1/4 -left-8 bg-surface-container-lowest shadow-xl rounded-full px-5 py-3 flex items-center gap-2">
              <IceCream className="w-4 h-4 text-primary" />
              <span className="font-label-md text-label-md">Dessert</span>
            </div>
            <div className="absolute -bottom-4 right-1/4 bg-surface-container-lowest shadow-xl rounded-full px-5 py-3 flex items-center gap-2">
              <Wine className="w-4 h-4 text-primary" />
              <span className="font-label-md text-label-md">Drinks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
