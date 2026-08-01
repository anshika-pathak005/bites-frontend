import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

// Landing page call-to-action banner linking through to the menu.
export function CtaBanner() {
  return (
    <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-lg">
      <div className="relative bg-primary-container rounded-[2.5rem] p-8 md:p-12 overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-surface/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-surface/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-on-primary-container">
            <h2 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-4">
              Hungry? Your Next Favourite Meal Is One Click Away
            </h2>
            <p className="text-body-lg font-body-lg opacity-90">
              Fresh, fast, and delivered right to your door. Browse the menu and place your order in minutes.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <Link href={ROUTES.menu}>
              <Button variant="secondary" size="lg" className="bg-on-primary-container text-surface hover:scale-105">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
