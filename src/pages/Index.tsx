import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { PricingSection } from "@/components/PricingSection";
import { BookingSection } from "@/components/BookingSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";

import { HERO_PHOTO as heroImage } from "@/lib/photos";

const Index = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const packageSlug = searchParams.get("package");
    if (packageSlug) {
      // Scroll to pricing section and trigger package modal via custom event
      setTimeout(() => {
        const pricingSection = document.querySelector("#pricing");
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth" });
        }
        // Dispatch custom event to open the package modal
        window.dispatchEvent(new CustomEvent("openPackage", { detail: { slug: packageSlug } }));
      }, 500);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection heroImage={heroImage} />
        <AboutSection />
        <PricingSection />
        <BookingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
