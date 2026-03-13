import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Do you travel for destination weddings?",
    answer:
      "Absolutely! While we're based in Kano, Nigeria, we're globally inspired and destination-ready. We've captured beautiful moments across the world. Travel and accommodation costs are discussed during your consultation and billed separately from your chosen package.",
  },
  {
    question: "What is your editing process like?",
    answer:
      "Every image is meticulously edited by our lead photographer to ensure consistent quality and artistic vision. We focus on natural skin tones, cinematic color grading, and subtle enhancements that bring out the emotion in every frame without over-processing.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking 6–12 months in advance for wedding coverage, especially for peak seasons. However, we do accommodate shorter timelines when our calendar permits. Your date is secured once the booking fee is received.",
  },
  {
    question: "How large is your team?",
    answer:
      "For standard wedding coverage, I personally lead the shoot. For larger events or our premium packages, we bring a second professional photographer to ensure comprehensive coverage. Every team member is carefully vetted to maintain our quality standards.",
  },
  {
    question: "What is the turnaround time for final images?",
    answer:
      "Our standard turnaround time is 3 weeks from your wedding date. This allows us to give each image the attention it deserves during the editing process. Rush delivery options are available upon request for an additional fee.",
  },
  {
    question: "Do you provide raw/unedited files?",
    answer:
      "We don't provide raw files as they don't represent our artistic vision. Each image we deliver has been carefully curated and edited to meet our signature style. You'll receive a generous gallery of fully edited images that tell your complete story.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 lg:py-36">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            variants={fadeInUp}
            className="text-center mb-16 lg:mb-20"
          >
            <p className="font-body text-xs tracking-[0.5em] uppercase text-primary mb-4">
              Questions & Answers
            </p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[0.08em] text-foreground">
              Frequently <span className="italic text-metallic-gold">Asked</span>
            </h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rotate-45 bg-primary/50" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
          </motion.div>

          {/* Custom Numbered Accordion */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            variants={fadeInUp}
            className="space-y-0"
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const num = String(index + 1).padStart(2, "0");
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className={`group border-b ${isOpen ? "border-primary/40" : "border-primary/10"} transition-colors duration-300`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center gap-6 py-6 text-left group"
                  >
                    {/* Number */}
                    <span className={`font-display text-4xl transition-colors duration-300 leading-none flex-shrink-0 ${isOpen ? "text-primary" : "text-primary/20 group-hover:text-primary/40"}`}>
                      {num}
                    </span>

                    {/* Question */}
                    <span className={`font-display text-base md:text-lg tracking-wide flex-1 transition-colors duration-300 ${isOpen ? "text-primary" : "text-foreground group-hover:text-primary/80"}`}>
                      {faq.question}
                    </span>

                    {/* Icon */}
                    <motion.div
                      animate={{ rotate: isOpen ? 0 : 0 }}
                      className={`flex-shrink-0 w-8 h-8 border transition-colors duration-300 flex items-center justify-center ${isOpen ? "border-primary text-primary" : "border-primary/20 text-muted-foreground group-hover:border-primary/40"}`}
                    >
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </motion.div>
                  </button>

                  {/* Answer with smooth animation */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pl-16 pr-10">
                          <p className="font-body text-sm leading-relaxed text-muted-foreground">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
