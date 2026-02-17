import { HeroSection } from "@/components/marketing/hero-section";
import { StatsBar } from "@/components/marketing/stats-bar";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeaturesSection } from "@/components/marketing/features-section";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
