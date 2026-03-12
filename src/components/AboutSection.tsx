import { Gem, Sparkles, Crown } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

import { SLIDESHOW_PHOTOS as aboutImages } from "@/lib/photos";

const stats = [
  { value: "200+", label: "Stories Told" },
  { value: "50+", label: "Destinations" },
  { value: "3wk", label: "Delivery" },
  { value: "8yrs", label: "Excellence" },
];

const pillars = [
  {
    icon: Gem,
    title: "Artistry & Storytelling",
    description: "Meticulously edited, emotionally resonant imagery that authentically encapsulates your most precious moments.",
  },
  {
    icon: Sparkles,
    title: "Global Inspiration",
    description: "Rooted in Nigeria with bases in Kano and Abuja, we are globally inspired and available for destination weddings worldwide.",
  },
  {
    icon: Crown,
    title: "Elite Standards",
    description: "Ensuring a 3-week turnaround and lead photographer editing, we maintain an unwavering commitment to unparalleled, consistent quality.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export function AboutSection() {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"]
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.02, 1.08]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % aboutImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={containerRef} id="about" className="relative py-24 lg:py-36 overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-40 left-0 w-[1px] h-64 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-40 right-0 w-[1px] h-64 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          variants={fadeInUp}
          className="text-center mb-20 lg:mb-28"
        >
          <p className="font-body text-xs tracking-[0.5em] uppercase text-primary mb-4">
            The Story
          </p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[0.08em] text-foreground">
            Behind Every <span className="italic text-metallic-gold">Frame</span>
          </h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <div className="w-1 h-1 rotate-45 bg-primary/50" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>
        </motion.div>

        {/* Two-column editorial layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 lg:mb-32">
          {/* Left: Cinematic Slideshow */}
          <motion.div
            ref={imageRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.1 }}
            variants={fadeInUp}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={aboutImages[currentIndex]}
                  alt="Alameen Studios portfolio"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ y: imageY, scale: imageScale }}
                />
              </AnimatePresence>
              
              {/* Cinematic overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Overlay quote */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display text-lg italic text-foreground/90 leading-snug">
                  "Emotion over poses.<br />Story over snapshots."
                </p>
              </div>
            </div>

            {/* Frame borders */}
            <div className="absolute inset-0 border border-primary/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-primary/60" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-primary/60" />

            {/* Slide Indicators */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              {aboutImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span
                    className={`block w-6 h-0.5 transition-all duration-500 ${
                      index === currentIndex ? "bg-primary w-10" : "bg-white/30 hover:bg-white/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right: Bio Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            variants={fadeInUp}
            className="flex flex-col justify-center pt-10 lg:pt-0"
          >
            <p className="font-body text-xs tracking-[0.5em] uppercase text-primary mb-6">
              Alameen Studios
            </p>
            <h3 className="font-display text-2xl lg:text-3xl tracking-[0.06em] text-foreground mb-8 leading-snug">
              We go beyond simply taking pictures—<br />
              <span className="italic text-muted-foreground font-light">we capture the heart</span><br />
              and soul of your unique narrative.
            </h3>
            
            <div className="space-y-5 mb-10">
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Every fleeting glance, tear of joy, and stolen moment is preserved with deliberate intention and refined artistry. By cultivating genuine connections, we ensure you feel completely at ease, allowing your authentic emotions to unfold naturally before our lens.
              </p>
            </div>

            {/* Gold callout quote */}
            <div className="relative border-l-2 border-primary/60 pl-6 py-2 mb-10">
              <div className="absolute top-0 left-0 w-2 h-2 -translate-x-[5px] -translate-y-[1px] bg-primary" />
              <p className="font-display text-lg italic text-primary">
                "Crafting timeless legacies, one frame at a time."
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 border-t border-primary/20 pt-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <p className="font-display text-2xl text-primary">{stat.value}</p>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.15 + index * 0.15 }}
              variants={fadeInUp}
              className="group text-center relative"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 border border-primary/0 group-hover:border-primary/20 pointer-events-none" />

              <div className="relative p-8">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 border border-primary/30 group-hover:border-primary transition-colors duration-500 relative">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />
                  <pillar.icon className="w-7 h-7 text-primary relative z-10" strokeWidth={1} />
                </div>

                {/* Divider */}
                <div className="w-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mb-6" />

                <h3 className="font-display text-lg tracking-[0.12em] text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {pillar.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
