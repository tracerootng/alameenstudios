import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  heroImage: string;
}

const words = ["WEDDINGS", "PORTRAITS", "MEMORIES", "STORIES", "MOMENTS"];

export function HeroSection({ heroImage }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
    >
      {/* === FULL-BG IMAGE === */}
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <img
          src={heroImage}
          alt="Alameen Studios — Luxury Wedding Photography"
          className="absolute inset-0 w-full h-full object-cover object-[50%_37%] scale-105"
        />
        {/* Layered overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />
        {/* Cinematic grain */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }} />
      </motion.div>

      {/* === MAIN CONTENT === */}
      <motion.div
        className="relative z-10 flex flex-col justify-center flex-1 px-8 lg:px-20 xl:px-32 pt-28 pb-20"
        style={{ y: textY, opacity: fadeOut }}
      >
        {/* Label pill */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-10 h-px bg-primary" />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-primary">
              Alameen Studios · Est. 2020
            </span>
          </motion.div>
        )}

        {/* Giant number watermark */}
        <div className="absolute left-8 lg:left-20 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <span className="font-display font-bold text-[22vw] leading-none text-primary/[0.04]">01</span>
        </div>

        {/* Main heading */}
        <div className="relative z-10 max-w-3xl">
          {mounted && (
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="font-display leading-[0.9] mb-2"
            >
              {/* Static top line */}
              <span className="block text-[7vw] lg:text-[6.5vw] xl:text-[5.5vw] tracking-[0.04em] text-foreground font-medium">
                BEYOND
              </span>

              {/* Animated word swap */}
              <div className="relative overflow-hidden h-[1.1em]" style={{ lineHeight: "1.05" }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-110%", opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                    className="block text-[7vw] lg:text-[6.5vw] xl:text-[5.5vw] tracking-[0.04em]"
                    style={{
                      background: "linear-gradient(135deg, hsl(36, 100%, 62%), hsl(32, 100%, 50%), hsl(28, 100%, 38%), hsl(40, 100%, 60%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {words[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Bottom italic line */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
                className="block font-light italic text-[4vw] lg:text-[3.5vw] xl:text-[3vw] tracking-[0.08em] text-foreground/60 mt-2"
              >
                That Last Forever
              </motion.span>
            </motion.h1>
          )}

          {/* Separator */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
            className="flex items-center gap-4 mt-8 mb-8 origin-left"
          >
            <div className="w-16 h-px bg-primary/50" />
            <span className="font-body text-[9px] tracking-[0.5em] uppercase text-muted-foreground">
              Luxury · Kano · Abuja · Global
            </span>
          </motion.div>

          {/* Subtext */}
          {mounted && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="font-body text-sm text-muted-foreground max-w-md leading-relaxed mb-12"
            >
              We craft visual legacies—cinematic, editorial, and emotionally layered wedding photographs designed to be your most treasured keepsakes.
            </motion.p>
          )}

          {/* CTAs */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              {/* Primary CTA */}
              <button
                onClick={() => scrollToSection("pricing")}
                data-cursor-hover
                className="group inline-flex items-center gap-4 bg-primary text-primary-foreground font-body text-xs tracking-[0.35em] uppercase px-8 py-4 transition-all duration-500 hover:shadow-[0_0_40px_hsl(32,100%,50%,0.35)] relative overflow-hidden"
              >
                <span className="relative z-10">View Packages</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative z-10"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
                <span className="absolute inset-0 bg-[linear-gradient(135deg,hsl(28,100%,38%),hsl(36,100%,62%),hsl(40,100%,60%),hsl(32,100%,50%))]" />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => scrollToSection("booking")}
                data-cursor-hover
                className="inline-flex items-center gap-3 font-body text-xs tracking-[0.35em] uppercase text-foreground/70 hover:text-primary transition-colors duration-300 border-b border-foreground/20 hover:border-primary pb-1 group"
              >
                Begin Inquiry
                <span className="block w-5 h-px bg-current transition-all duration-300 group-hover:w-8" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* === VERTICAL STAT STRIP (right side) === */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
        style={{ opacity: fadeOut }}
        className="absolute right-8 lg:right-14 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-end gap-8 z-10"
      >
        {[
          { val: "200+", label: "Stories" },
          { val: "50+", label: "Destinations" },
          { val: "3wk", label: "Delivery" },
        ].map((s) => (
          <div key={s.label} className="text-right">
            <p className="font-display text-xl text-primary leading-none">{s.val}</p>
            <p className="font-body text-[9px] tracking-[0.35em] uppercase text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* === BOTTOM BAR === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        style={{ opacity: fadeOut }}
        className="relative z-10 border-t border-white/5 mt-auto"
      >
        <div className="px-8 lg:px-20 xl:px-32 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-body text-[9px] tracking-[0.4em] uppercase text-muted-foreground/50">Scroll</span>
            <div className="w-12 h-px bg-gradient-to-r from-muted-foreground/30 to-transparent relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 w-6 bg-primary/60"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
          <span className="font-body text-[9px] tracking-[0.4em] uppercase text-muted-foreground/40 hidden sm:block">
            Wedding · Pre-Wedding · Studio
          </span>
        </div>
      </motion.div>
    </section>
  );
}
