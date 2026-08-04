import { HeroSection } from "./_components/hero-section";
import { CategoriesSection } from "./_components/categories-section";
import { FeaturesSection } from "./_components/features-section";
import { CtaBanner } from "./_components/cta-banner";
import { TestimonialsSection } from "./_components/testimonials-section";
import { ChefsSection } from "./_components/chefs-section";

// Customer-facing landing page — composed entirely of the section components below.
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturesSection />
      <CtaBanner />
      <TestimonialsSection />
      <ChefsSection />
    </>
  );
}
