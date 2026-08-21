import Link from "next/link";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// Midnight Culinary call-to-action banner linking through to the menu.
export function CtaBanner() {
  return (
    <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg">
      <div className="relative rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container border border-primary-container/30 shadow-2xl">
        {/* Ambient atmospheric background glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-highest border border-primary-container/40 text-primary-fixed text-xs font-semibold uppercase tracking-wider mb-4">
              <Flame className="w-3.5 h-3.5 text-primary-container" />
              <span>Late Night Cravings</span>
            </div>

            <h2 className="font-headline-lg sm:font-display-lg text-3xl sm:text-4xl md:text-5xl font-bold text-primary-fixed mb-4 leading-[1.2] tracking-tight">
              Hungry For Something <span className="text-primary-container italic font-normal">Extraordinary?</span>
            </h2>

            <p className="font-body-md sm:font-body-lg text-sm sm:text-base text-on-surface-variant max-w-xl leading-relaxed">
              Fresh, artisanal dishes crafted by expert chefs and delivered piping hot to your door in under 30 minutes.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-start lg:justify-end gap-3">
            <Link href={ROUTES.menu} className="w-full sm:w-auto lg:w-full">
              <button className="w-full bg-primary-container text-white px-6 py-3 rounded-xl font-body-md text-sm font-semibold hover:bg-primary-fixed hover:scale-105 transition-all duration-200 glow-hover flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 cursor-pointer">
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href={ROUTES.about} className="w-full sm:w-auto lg:w-full">
              <button className="w-full bg-surface-container-high/80 border border-outline-variant/60 text-on-surface hover:border-primary-container hover:text-primary-fixed px-5 py-3 rounded-xl font-body-md text-xs sm:text-sm font-semibold hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-primary-container" />
                <span>Our Story</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
