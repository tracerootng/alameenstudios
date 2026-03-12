import { Instagram, Mail, Phone, CreditCard, Copy, Check } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="ml-2 p-2 rounded-full bg-primary/20 hover:bg-primary/40 transition-colors duration-300 group"
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-primary group-hover:text-metallic-gold transition-colors" />
      )}
    </motion.button>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.8]);

  return (
    <footer ref={containerRef} className="relative py-20 lg:py-36 bg-background overflow-hidden">
      {/* Watermark background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-display text-[18vw] font-bold tracking-widest text-primary/[0.03] whitespace-nowrap"
          aria-hidden="true"
        >
          ALAMEEN
        </span>
      </div>

      {/* Parallax Background Elements */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-20 left-10 w-96 h-96 border border-primary/8 rounded-full opacity-30" />
        <div className="absolute bottom-20 right-10 w-64 h-64 border border-primary/8 rounded-full opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-primary/[0.04] rounded-full" />
      </motion.div>
      
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Payment Information */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          variants={fadeInUp}
          style={{ opacity }}
          className="max-w-2xl mx-auto text-center mb-20"
        >
          {/* Section Label */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/60" />
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <p className="font-body text-xs tracking-[0.5em] uppercase text-primary font-semibold">
                Payment Details
              </p>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/60" />
          </div>
          
          {/* Payment Card */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.4 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-gradient-to-br from-charcoal-light via-card to-charcoal-light border border-primary/30 group-hover:border-primary/60 transition-colors duration-500 p-10 lg:p-14">
              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/60" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/60" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/60" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/60" />
              
              <motion.h3 
                className="font-display text-2xl lg:text-3xl tracking-[0.25em] text-metallic-gold mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                ALAMEEN STUDIOS
              </motion.h3>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-12 h-px bg-primary/60" />
                <div className="w-2 h-2 rotate-45 border border-primary" />
                <div className="w-12 h-px bg-primary/60" />
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <span className="font-body text-sm tracking-[0.2em] uppercase text-primary font-semibold">Bank</span>
                  <span className="hidden sm:block w-px h-4 bg-primary/40" />
                  <span className="font-display text-lg lg:text-xl text-foreground tracking-wide">
                    First City Monument Bank (FCMB)
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <span className="font-body text-sm tracking-[0.2em] uppercase text-primary font-semibold">Account</span>
                  <span className="hidden sm:block w-px h-4 bg-primary/40" />
                  <span className="font-display text-3xl lg:text-4xl text-metallic-gold tracking-[0.15em] font-medium">
                    8660588015
                  </span>
                  <CopyButton text="" label="Account number" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <div className="w-20 h-px bg-gradient-to-r from-transparent to-primary/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-primary/60" />
          <div className="w-20 h-px bg-gradient-to-l from-transparent to-primary/40" />
        </div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 mb-16">
          {/* Brand */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeInUp}
            className="text-center md:text-left"
          >
            {/* Logo Image */}
            <div className="mb-4 flex justify-center md:justify-start">
              <img src={logo} alt="Alameen Studios" className="h-12 w-auto object-contain" />
            </div>
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-4">
              Beyond The Ordinary
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Luxury wedding & portrait photography based in Abuja & Kaduna, Nigeria.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            variants={fadeInUp}
            className="text-center"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-6">
              Navigate
            </p>
            <nav className="space-y-3">
              {["Story", "Packages", "Booking", "FAQ"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase() === "packages" ? "pricing" : link.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = link.toLowerCase() === "packages" ? "pricing" : link.toLowerCase();
                    document.querySelector(`#${target}`)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="block font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variants={fadeInUp}
            className="text-center md:text-right"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-6">
              Get In Touch
            </p>
            <div className="space-y-4">
              <a
                href="mailto:yaseerkay@gmail.com"
                className="flex items-center justify-center md:justify-end gap-3 font-body text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="w-4 h-4 group-hover:text-primary transition-colors" />
                yaseerkay@gmail.com
              </a>
              <a
                href="tel:+2349160000500"
                className="flex items-center justify-center md:justify-end gap-3 font-body text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Phone className="w-4 h-4 group-hover:text-primary transition-colors" />
                +234 916 000 0500
              </a>
              <a
                href="https://instagram.com/alameen_studios"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-end gap-3 font-body text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Instagram className="w-4 h-4 group-hover:text-primary transition-colors" />
                @alameen_studios
              </a>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-primary/10">
          <p className="font-body text-xs tracking-wider text-muted-foreground">
            © {currentYear} Alameen Studios. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
