import Image from "next/image";
import Link from "next/link";
import { Sparkles, UtensilsCrossed, ShieldCheck, Heart, Award, ArrowRight } from "lucide-react";
import { SITE_CONTENT } from "@/data/site-content";
import { ROUTES } from "@/constants/routes";

export default function AboutPage() {
  const { about, chefs } = SITE_CONTENT;

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg space-y-12 sm:space-y-16">
      {/* Top Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-primary-container/40 text-primary shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-bold tracking-wider uppercase">Our Journey & Passion</span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface tracking-tight">
          Crafting Unforgettable Culinary Moments
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          From a humble neighborhood kitchen to the city&apos;s favorite late-night culinary destination, discover the story behind Bites.
        </p>
      </div>

      {/* Main Story & Hero Image Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-10 shadow-xl">
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Food That Speaks to the Soul
          </h2>
          {about.body.map((paragraph, i) => (
            <p key={i} className="text-xs sm:text-sm text-secondary leading-relaxed">
              {paragraph}
            </p>
          ))}
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            Every sauce is simmered in-house, every pasta is hand-folded, and every burger patty is freshly pressed on order. We never cut corners because we believe late-night dining should match fine dining quality.
          </p>
        </div>

        <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl">
          <Image
            src="/images/about-page-burgur.png"
            alt="Bites Gourmet Kitchen"
            width={600}
            height={600}
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
            <p className="font-bold text-primary">Farm Fresh & Handcrafted Daily</p>
            <p className="text-secondary/90 text-[11px] mt-0.5">Sourced from local organic farms every morning.</p>
          </div>
        </div>
      </div>

      {/* Core Brand Pillars Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-on-surface">Why Food Lovers Choose Bites</h2>
          <p className="text-xs sm:text-sm text-secondary mt-1">Built on uncompromising quality, speed, and safety.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-2 shadow-sm hover:border-primary-container/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-on-surface">Artisanal Crafting</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Every dish is crafted from scratch using house-blended spices and signature recipes.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-2 shadow-sm hover:border-primary-container/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary">
              <Heart className="w-5 h-5" />
            </div>
            <div className="h-0" />
            <h3 className="text-sm font-bold text-on-surface">Made with Love</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Prepared by master chefs who care genuinely about every order that leaves our kitchen.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-2 shadow-sm hover:border-primary-container/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-on-surface">100% Clean Kitchen</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Adhering to strict international hygiene and temperature standards for maximum freshness.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-2 shadow-sm hover:border-primary-container/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-on-surface">Midnight Delivery</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Delivering hot, piping meals right when late-night cravings strike until 3 AM.
            </p>
          </div>
        </div>
      </div>

      {/* Chef Master Craftsmen Spotlight */}
      {/* <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-outline-variant/20 pb-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Meet the Culinary Masters</span>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface mt-0.5">The Team Behind the Magic</h2>
          </div>
          <p className="text-xs text-secondary max-w-sm">Combining over 25 years of international fine dining experience.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {chefs.map((chef) => (
            <div key={chef.name} className="flex items-center gap-4 bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/20">
              <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border border-outline-variant/30">
                <Image src={chef.imageUrl} alt={chef.name} fill className="object-cover" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container border border-primary-container/30">
                  {chef.role}
                </span>
                <h3 className="text-base font-bold text-on-surface">{chef.name}</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Specializing in authentic Italian pasta reduction and woodfired gourmet techniques.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {about.stats.map((stat) => (
          <div key={stat.label} className="text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 space-y-1">
            <p className="font-headline-lg text-3xl sm:text-4xl text-primary font-bold">{stat.value}</p>
            <p className="text-secondary text-xs sm:text-sm font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom Action CTA */}
      <div className="text-center pt-4">
        <Link href={ROUTES.menu}>
          <button className="bg-primary text-black px-8 py-3.5 rounded-xl font-bold text-sm glow-hover inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-primary-container/20">
            <span>Explore Midnight Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
