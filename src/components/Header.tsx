import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Story", href: "#about" },
  { name: "Packages", href: "#pricing" },
  { name: "Booking", href: "#booking" },
  { name: "FAQ", href: "#faq" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);

      // Active section detection
      const sections = ["home", "about", "pricing", "booking", "faq"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const getLinkSection = (href: string) =>
    href === "#about" ? "about" : href === "#pricing" ? "pricing" : href.replace("#", "");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? "bg-[hsl(220_15%_5%/0.96)] backdrop-blur-xl border-b border-primary/8 shadow-[0_1px_40px_hsl(220_15%_3%/0.8)]"
            : "bg-transparent"
        }`}
      >
        <div className="px-6 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between h-20 lg:h-[76px]">

            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => { e.preventDefault(); scrollTo("#home"); }}
              className="relative flex items-center group"
              data-cursor-hover
            >
              <img src={logo} alt="Alameen Studios" className="h-9 lg:h-10 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity duration-300" />
            </a>

            {/* Desktop Nav — centered */}
            <nav className="hidden lg:flex items-center gap-0 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => {
                const section = getLinkSection(link.href);
                const isActive = activeSection === section;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                    data-cursor-hover
                    className="relative px-5 py-2 group"
                  >
                    <span className={`font-body text-[10px] tracking-[0.35em] uppercase transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}>
                      {link.name}
                    </span>
                    {/* Animated underline */}
                    <motion.span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: isActive || hoveredLink === link.name ? "60%" : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </a>
                );
              })}
            </nav>

            {/* Right side: CTA + counter */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2 opacity-50">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <span className="font-body text-[9px] tracking-[0.3em] uppercase text-muted-foreground">Available</span>
              </div>
              <Link
                to="/library"
                data-cursor-hover
                className="relative overflow-hidden font-body text-[10px] tracking-[0.35em] uppercase text-primary border border-primary/40 px-5 py-2.5 group transition-all duration-500 hover:border-primary hover:shadow-[0_0_20px_hsl(32_100%_50%/0.2)]"
              >
                <span className="relative z-10">Library</span>
                <span className="absolute inset-0 bg-primary/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-8 h-6 flex flex-col justify-between"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={isMobileMenuOpen ? { rotate: 45, y: 10 } : { rotate: 0, y: 0 }}
                className="block w-full h-px bg-foreground origin-center"
              />
              <motion.span
                animate={isMobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                className="block w-2/3 h-px bg-primary"
              />
              <motion.span
                animate={isMobileMenuOpen ? { rotate: -45, y: -10 } : { rotate: 0, y: 0 }}
                className="block w-full h-px bg-foreground origin-center"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu — full-screen overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-[hsl(220_15%_4%/0.98)] backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            {/* Decorative background numeral */}
            <span className="absolute font-display text-[30vw] text-primary/[0.03] select-none pointer-events-none font-bold leading-none">
              A
            </span>

            <nav className="relative flex flex-col items-center gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                  className="font-display text-3xl md:text-4xl tracking-[0.15em] uppercase text-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: navLinks.length * 0.08 }}
              >
                <Link
                  to="/library"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-display text-3xl tracking-[0.15em] uppercase text-primary"
                >
                  Library
                </Link>
              </motion.div>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-12 font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground"
            >
              Alameen Studios · Est. 2020
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
