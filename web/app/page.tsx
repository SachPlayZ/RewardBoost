import { HeroSection } from "@/components/hero-section";
import { DashboardPreview } from "@/components/dashboard-preview";
import { SocialProof } from "@/components/social-proof";
import { BentoSection } from "@/components/bento-section";
import { LargeTestimonial } from "@/components/large-testimonial";
import { PricingSection } from "@/components/pricing-section";
import { TestimonialGridSection } from "@/components/testimonial-grid-section";
import { FAQSection } from "@/components/faq-section";
import { CTASection } from "@/components/cta-section";

import { AnimatedSection } from "@/components/animated-section";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0">
      <div className="relative z-10">
        <main className="w-full relative">
          <AnimatedSection>
            <HeroSection />
          </AnimatedSection>
          {/* Dashboard Preview Wrapper */}
          <div className="absolute bottom-[-150px] md:bottom-[-400px] left-1/2 transform -translate-x-1/2 z-30">
            <DashboardPreview />
          </div>
        </main>

        <AnimatedSection
          className="relative z-10 max-w-[1320px] mx-auto px-6 mt-[411px] md:mt-[400px]"
          delay={0.2}
          direction="up"
        >
          <SocialProof />
        </AnimatedSection>

        <AnimatedSection
          id="features-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-16"
          delay={0.3}
        >
          <BentoSection />
        </AnimatedSection>

        <AnimatedSection
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
          direction="left"
        >
          <LargeTestimonial />
        </AnimatedSection>

        <AnimatedSection
          id="pricing-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
          direction="up"
        >
          <PricingSection />
        </AnimatedSection>

        <AnimatedSection
          id="testimonials-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
          direction="right"
        >
          <TestimonialGridSection />
        </AnimatedSection>

        <AnimatedSection
          id="faq-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
          direction="up"
        >
          <FAQSection />
        </AnimatedSection>

        <AnimatedSection
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
          direction="scale"
        >
          <CTASection />
        </AnimatedSection>
      </div>

      <div className="mt-16 md:mt-24">
        <Footer />
      </div>
    </div>
  );
}
