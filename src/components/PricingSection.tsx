import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight, ArrowUpRight, Loader2, Star } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { generatePricingPDF } from "@/lib/generatePDF";
import { PackageDetailModal } from "./PackageDetailModal";
import { InquiryOptionsModal } from "./InquiryOptionsModal";
import { PackageQRModal } from "./PackageQRModal";
import { usePackages, Package } from "@/hooks/usePackages";
import { pickPhotoForIndex } from "@/lib/photos";

// ==========================
// Wedding Package Card — editorial full-width alternating row
// ==========================
function WeddingCard({ pkg, index, formatPrice, onDetail, onInquire }: {
  pkg: Package;
  index: number;
  formatPrice: (p: number) => string;
  onDetail: (p: Package) => void;
  onInquire: (p: Package) => void;
}) {
  const isEven = index % 2 === 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.0, 1.08]);
  const textX = useTransform(scrollYProgress, [0, 0.4, 1], [isEven ? -30 : 30, 0, isEven ? -15 : 15]);
  const imgSrc = pickPhotoForIndex(pkg.sort_order);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8 }}
      className={`group grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] cursor-pointer`}
      onClick={() => onDetail(pkg)}
      data-cursor-hover
    >
      {/* Image side */}
      <div className={`relative overflow-hidden ${isEven ? "lg:order-1" : "lg:order-2"} h-64 lg:h-auto`}>
        <motion.img
          src={imgSrc}
          alt={pkg.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: imageScale }}
        />
        {/* Overlay */}
        <div className={`absolute inset-0 ${isEven
          ? "bg-gradient-to-r from-transparent to-[hsl(220_15%_5%/0.8)]"
          : "bg-gradient-to-l from-transparent to-[hsl(220_15%_5%/0.8)]"
        }`} />

        {/* Popular badge */}
        {pkg.popular && (
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-4 py-2">
            <Star className="w-3 h-3 text-primary-foreground" fill="currentColor" />
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-primary-foreground">Most Popular</span>
          </div>
        )}

        {/* Index number */}
        <div className={`absolute bottom-6 ${isEven ? "right-6" : "left-6"}`}>
          <span className="font-display text-6xl font-bold text-white/10 leading-none select-none">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Content side */}
      <motion.div
        className={`relative flex flex-col justify-center px-12 lg:px-16 xl:px-24 py-16 bg-card/40 group-hover:bg-card/60 transition-colors duration-500 ${isEven ? "lg:order-2" : "lg:order-1"}`}
        style={{ x: textX }}
      >
        {/* Category tag */}
        <p className="font-body text-[9px] tracking-[0.5em] uppercase text-primary mb-4">
          Wedding Collection
        </p>

        {/* Name */}
        <h3 className="font-display text-3xl lg:text-4xl xl:text-5xl tracking-[0.06em] text-foreground mb-2">
          {pkg.name}
        </h3>

        {/* Subtitle */}
        {pkg.subtitle && (
          <p className="font-body text-sm text-muted-foreground mb-8">{pkg.subtitle}</p>
        )}

        {/* Price */}
        <div className="mb-8">
          <div className="inline-block relative">
            <p
              className="font-display text-4xl lg:text-5xl font-medium"
              style={{
                background: "linear-gradient(135deg, hsl(36, 100%, 62%), hsl(32, 100%, 50%), hsl(28, 100%, 38%), hsl(40, 100%, 60%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {formatPrice(pkg.price)}
            </p>
            {/* Underline glow */}
            <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
          </div>
        </div>

        {/* Features — show top 4 */}
        <ul className="space-y-3 mb-10">
          {pkg.features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 mt-1 w-4 h-4 rotate-45 border border-primary/40"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
              />
              <span className="font-body text-sm text-muted-foreground">{f}</span>
            </li>
          ))}
          {pkg.features.length > 4 && (
            <li className="font-body text-xs text-primary tracking-wider">
              +{pkg.features.length - 4} more inclusions
            </li>
          )}
        </ul>

        {/* CTA row */}
        <div className="flex items-center gap-6">
          <button
            data-cursor-hover
            onClick={(e) => { e.stopPropagation(); onInquire(pkg); }}
            className="group/btn inline-flex items-center gap-3 font-body text-xs tracking-[0.35em] uppercase text-primary border border-primary/40 px-8 py-4 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-500 relative overflow-hidden"
          >
            <span className="relative z-10">Inquire</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform group-hover/btn:translate-x-1" />
          </button>

          <button
            data-cursor-hover
            onClick={(e) => { e.stopPropagation(); onDetail(pkg); }}
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-primary transition-colors duration-300 group/view"
          >
            View Details
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/view:-translate-y-0.5 group-hover/view:translate-x-0.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==========================
// Compact card for Pre-Wedding / Studio
// ==========================
function CompactCard({ pkg, formatPrice, onDetail, onInquire }: {
  pkg: Package;
  formatPrice: (p: number) => string;
  onDetail: (p: Package) => void;
  onInquire: (p: Package) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = pickPhotoForIndex(pkg.sort_order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onDetail(pkg)}
      data-cursor-hover
      className="group relative cursor-pointer overflow-hidden"
      style={{ aspectRatio: "4/5" }}
    >
      {/* Image */}
      <motion.img
        src={imgSrc}
        alt={pkg.name}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700"
        animate={{ scale: hovered ? 1.07 : 1.0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />

      {/* Gradient overlay — always */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220_15%_4%)] via-[hsl(220_15%_5%/0.5)] to-transparent" />

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 border border-primary/50 pointer-events-none"
          >
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier badge */}
      <div className="absolute top-4 right-4 bg-primary/90 px-3 py-1">
        <span className="font-body text-[9px] tracking-[0.3em] uppercase text-primary-foreground">
          {pkg.subtitle || `Tier ${pkg.sort_order}`}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h4 className="font-display text-xl tracking-[0.08em] text-foreground mb-1">{pkg.name}</h4>
        <p className="font-display text-2xl mb-4" style={{
          background: "linear-gradient(90deg, hsl(36, 100%, 55%), hsl(28, 100%, 45%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {formatPrice(pkg.price)}
        </p>

        {/* CTA row — appears on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onInquire(pkg); }}
                data-cursor-hover
                className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground bg-primary px-4 py-2 hover:bg-primary/90 transition-colors"
              >
                Inquire
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDetail(pkg); }}
                data-cursor-hover
                className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                Details
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ==========================
// Main PricingSection
// ==========================
export function PricingSection() {
  const { packages, loading, formatPrice, getByCategory, getBySlug } = usePackages();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryPackage, setInquiryPackage] = useState<Package | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrPackage, setQRPackage] = useState<Package | null>(null);

  const weddingPackages = getByCategory("wedding");
  const preWeddingPackages = getByCategory("prewedding");
  const studioSessions = getByCategory("studio");

  useEffect(() => {
    const handleOpenPackage = (event: CustomEvent<{ slug: string }>) => {
      const pkg = getBySlug(event.detail.slug);
      if (pkg) { setSelectedPackage(pkg); setIsModalOpen(true); }
    };
    window.addEventListener("openPackage", handleOpenPackage as EventListener);
    return () => window.removeEventListener("openPackage", handleOpenPackage as EventListener);
  }, [getBySlug]);

  const openDetail = (pkg: Package) => { setSelectedPackage(pkg); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setTimeout(() => setSelectedPackage(null), 300); };
  const openInquiry = (pkg: Package | null) => { if (pkg) { setInquiryPackage(pkg); setIsInquiryModalOpen(true); } };
  const closeInquiry = () => { setIsInquiryModalOpen(false); setTimeout(() => setInquiryPackage(null), 300); };
  const openQR = (pkg: Package) => { setQRPackage(pkg); setIsQRModalOpen(true); };
  const closeQR = () => { setIsQRModalOpen(false); setTimeout(() => setQRPackage(null), 300); };

  const getCategoryLabel = (category: string) =>
    category === "wedding" ? "Wedding Collection" : category === "prewedding" ? "Pre-Wedding" : "Studio Session";

  if (loading) {
    return (
      <section id="pricing" className="py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </section>
    );
  }

  return (
    <>
      <section id="pricing" className="relative overflow-hidden">
        {/* === Section Header === */}
        <div className="relative border-t border-primary/10 overflow-hidden">
          <div className="px-8 lg:px-20 xl:px-32 py-24 lg:py-32">
            {/* Big watermark */}
            <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden">
              <span className="font-display font-bold text-[16vw] text-primary/[0.03] leading-none whitespace-nowrap pl-10">
                COLLECTIONS
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10 max-w-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-px bg-primary" />
                <p className="font-body text-[10px] tracking-[0.5em] uppercase text-primary">
                  Signature Collections
                </p>
              </div>
              <h2 className="font-display text-4xl lg:text-6xl xl:text-7xl tracking-[0.04em] text-foreground leading-[0.9] mb-6">
                Curated{" "}
                <span
                  className="italic font-light"
                  style={{
                    background: "linear-gradient(135deg, hsl(36, 100%, 62%), hsl(32, 100%, 50%), hsl(28, 100%, 62%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  for you
                </span>
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Each collection is thoughtfully designed to preserve your story with uncompromising quality and artistry.
              </p>
            </motion.div>
          </div>
        </div>

        {/* === Wedding Packages — Editorial Alternating Rows === */}
        <div className="border-t border-primary/8">
          {weddingPackages.map((pkg, index) => (
            <div key={pkg.id} className="border-b border-primary/8">
              <WeddingCard
                pkg={pkg}
                index={index}
                formatPrice={formatPrice}
                onDetail={openDetail}
                onInquire={(p) => openInquiry(p)}
              />
            </div>
          ))}
        </div>

        {/* === Pre-Wedding + Studio — Magazine Grid === */}
        <div className="px-8 lg:px-20 xl:px-32 py-24 border-t border-primary/8">
          {/* Pre-Wedding */}
          {preWeddingPackages.length > 0 && (
            <div className="mb-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex items-end justify-between mb-12"
              >
                <div>
                  <p className="font-body text-[9px] tracking-[0.5em] uppercase text-primary mb-2">Category</p>
                  <h3 className="font-display text-3xl lg:text-4xl tracking-[0.06em] text-foreground">Pre-Wedding</h3>
                </div>
                <div className="h-px flex-1 mx-10 bg-gradient-to-r from-primary/20 to-transparent" />
                <span className="font-body text-[9px] tracking-[0.4em] uppercase text-muted-foreground">
                  {preWeddingPackages.length} packages
                </span>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {preWeddingPackages.map((pkg) => (
                  <CompactCard
                    key={pkg.id}
                    pkg={pkg}
                    formatPrice={formatPrice}
                    onDetail={openDetail}
                    onInquire={(p) => openInquiry(p)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Studio Sessions */}
          {studioSessions.length > 0 && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex items-end justify-between mb-12"
              >
                <div>
                  <p className="font-body text-[9px] tracking-[0.5em] uppercase text-primary mb-2">Category</p>
                  <h3 className="font-display text-3xl lg:text-4xl tracking-[0.06em] text-foreground">Studio Sessions</h3>
                </div>
                <div className="h-px flex-1 mx-10 bg-gradient-to-r from-primary/20 to-transparent" />
                <span className="font-body text-[9px] tracking-[0.4em] uppercase text-muted-foreground">
                  {studioSessions.length} packages
                </span>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                {studioSessions.map((pkg) => (
                  <CompactCard
                    key={pkg.id}
                    pkg={pkg}
                    formatPrice={formatPrice}
                    onDetail={openDetail}
                    onInquire={(p) => openInquiry(p)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* === Download CTA === */}
        <div className="border-t border-primary/8 px-8 lg:px-20 xl:px-32 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div>
              <p className="font-body text-[10px] tracking-[0.4em] uppercase text-primary mb-1">Full Brochure</p>
              <p className="font-display text-xl lg:text-2xl tracking-wide text-foreground">
                Download our complete pricing guide
              </p>
            </div>
            <button
              onClick={() => generatePricingPDF()}
              data-cursor-hover
              className="group inline-flex items-center gap-4 font-body text-xs tracking-[0.35em] uppercase border border-primary/40 px-10 py-4 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 hover:shadow-[0_0_30px_hsl(32,100%,50%,0.2)] flex-shrink-0"
            >
              Download PDF
              <motion.span animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                ↓
              </motion.span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <PackageDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        package={selectedPackage}
        onInquire={() => openInquiry(selectedPackage)}
        onShowQR={() => selectedPackage && openQR(selectedPackage)}
      />
      <InquiryOptionsModal
        isOpen={isInquiryModalOpen}
        onClose={closeInquiry}
        packageName={inquiryPackage?.name || ""}
        packageType={inquiryPackage ? getCategoryLabel(inquiryPackage.category) : ""}
        packagePrice={inquiryPackage ? formatPrice(inquiryPackage.price) : ""}
        onBookWebsite={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
      />
      <PackageQRModal isOpen={isQRModalOpen} onClose={closeQR} package={qrPackage} />
    </>
  );
}
