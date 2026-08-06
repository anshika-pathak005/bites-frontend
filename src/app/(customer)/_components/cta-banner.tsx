import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

// Landing page call-to-action banner linking through to the menu.
export function CtaBanner() {
  return (
    <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg">
      <div className="relative bg-primary-container rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-surface/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-surface/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="text-on-primary-container">
            <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl lg:text-headline-xl font-bold mb-3 sm:mb-4 leading-tight">
              Hungry? Your Next Favourite Meal Is One Click Away
            </h2>
            <p className="text-body-md sm:text-body-lg font-body-md opacity-90">
              Fresh, fast, and delivered right to your door. Browse the menu and place your order in minutes.
            </p>
          </div>
          <div className="flex lg:justify-end pt-2 lg:pt-0">
            <Link href={ROUTES.menu} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-on-primary-container text-white hover:scale-105 shadow-xl font-semibold">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
