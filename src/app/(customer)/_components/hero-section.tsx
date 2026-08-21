import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Star, Truck, Utensils } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// Midnight Culinary hero section with full burger photo visibility,
// compact typography, transparent subtext, and refined CTA buttons.
export function HeroSection() {
  return (
    <section className="relative -mt-20 pt-24 sm:pt-28 pb-12 sm:pb-16 min-h-[580px] sm:min-h-[640px] md:min-h-[700px] lg:min-h-[750px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Gourmet Burger Image - Zoomed Out with Full Framing */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <Image
          src="/images/hero-burger.png"
          alt="Midnight Gourmet Burger"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%] sm:object-[center_30%] brightness-[0.7] contrast-[1.7] blur-[1px]"
        />
        {/* Transparent atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-surface" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Floating Mini Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-container/75 backdrop-blur-md border border-primary-container/40 text-primary-fixed mb-4 sm:mb-5 shadow-glow animate-float">
          <Sparkles className="w-3.5 h-3.5 text-primary-container" />
          <span className="font-label-md text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
            The Midnight Culinary Experience
          </span>
        </div>

        {/* Hero Title - Extra Bold, Dim White Shade, Subtle Glow Highlight */}
        <h1 className="font-display-lg font-black font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-neutral-200 mb-4 sm:mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)] tracking-wider [word-spacing:0.25em] leading-tight sm:leading-[1.1] uppercase text-center">
          Bite Into <span className="relative inline-block text-[#F5A64E] font-black font-extrabold [text-shadow:_0_0_18px_rgba(245,166,78,0.55),_0_0_36px_rgba(245,166,78,0.25)]">Perfection</span>
        </h1>

        {/* Hero Subtitle - Clean, readable dim white */}
        <p className="font-body-md text-xs sm:text-sm md:text-base text-stone-300/80 max-w-lg mx-auto mb-6 sm:mb-8 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
          Crafted with passion, delivered with love. Experience the ultimate late-night culinary journey with farm-fresh ingredients and fine-dining mastery.
        </p>

        {/* Compact Rich-Amber Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link href={ROUTES.menu} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-primary-container text-white px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl font-body-md text-xs sm:text-sm font-semibold hover:bg-primary-fixed hover:scale-105 transition-all duration-200 glow-hover flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 cursor-pointer">
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <Link href={ROUTES.trackOrder} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-surface-container/80 backdrop-blur-md border border-outline-variant/50 text-on-surface hover:border-primary-container hover:text-primary-fixed px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-body-md text-xs sm:text-sm font-semibold hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md">
              <Truck className="w-4 h-4 text-primary-container" />
              <span>Track Order</span>
            </button>
          </Link>
        </div>

        {/* Floating Quick Feature Highlights */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-8 sm:mt-10 w-full max-w-xl border-t border-outline-variant/20 pt-5 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-center sm:text-left bg-surface-container/50 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl border border-outline-variant/20">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary-container shrink-0">
              <Star className="w-3.5 h-3.5 fill-primary-container" />
            </div>
            <div>
              <div className="font-title-lg text-xs font-bold text-primary-fixed">4.9 / 5.0</div>
              <div className="text-[10px] text-on-surface-variant">5k+ Reviews</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-center sm:text-left bg-surface-container/50 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl border border-outline-variant/20">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary-container shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-title-lg text-xs font-bold text-primary-fixed">30 Mins</div>
              <div className="text-[10px] text-on-surface-variant">Fast Delivery</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-center sm:text-left bg-surface-container/50 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl border border-outline-variant/20">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary-container shrink-0">
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-title-lg text-xs font-bold text-primary-fixed">100% Fresh</div>
              <div className="text-[10px] text-on-surface-variant">Farm Sourced</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
