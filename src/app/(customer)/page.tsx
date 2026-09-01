import { HeroSection } from "./_components/hero-section";
import { CategoriesSection } from "./_components/categories-section";
import { FeaturesSection } from "./_components/features-section";
import { RecommendationsSection } from "@/components/customer/recommendations-section";
import { CtaBanner } from "./_components/cta-banner";
import { TestimonialsSection } from "./_components/testimonials-section";

// Customer-facing landing page — composed of modular Midnight Culinary dark theme sections
export default function HomePage() {
  return (
    <div className="flex flex-col gap-y-4 sm:gap-y-8">
      <HeroSection />
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <RecommendationsSection />
      </div>
      <CategoriesSection />
      <FeaturesSection />
      <CtaBanner />
      <TestimonialsSection />
    </div>
  );
}
