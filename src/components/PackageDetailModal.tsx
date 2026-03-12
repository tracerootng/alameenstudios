import { X, Check, Camera, Star, Calendar, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "@/hooks/usePackages";

// Import fallback images
import weddingNairobi from "@/assets/wedding-nairobi.jpg";
import weddingMoscow from "@/assets/wedding-moscow.jpg";
import weddingHelsinki from "@/assets/wedding-helsinki.jpg";
import preweddingTier1 from "@/assets/prewedding-tier1.jpg";
import preweddingTier2 from "@/assets/prewedding-tier2.jpg";
import preweddingTier3 from "@/assets/prewedding-tier3.jpg";
import preweddingTier4 from "@/assets/prewedding-tier4.jpg";
import studioEssential from "@/assets/studio-essential.jpg";
import studioPremium from "@/assets/studio-premium.jpg";

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package | null;
  onInquire: () => void;
  onShowQR?: () => void;
}

// Fallback images mapping
const fallbackImages: Record<string, string> = {
  nairobi: weddingNairobi,
  moscow: weddingMoscow,
  helsinki: weddingHelsinki,
  "prewedding-tier1": preweddingTier1,
  "prewedding-tier2": preweddingTier2,
  "prewedding-tier3": preweddingTier3,
  "prewedding-tier4": preweddingTier4,
  "studio-essential": studioEssential,
  "studio-premium": studioPremium,
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  },
};

export function PackageDetailModal({ isOpen, onClose, package: pkg, onInquire, onShowQR }: PackageDetailModalProps) {
  if (!pkg) return null;

  const imageUrl = pkg.image_url || fallbackImages[pkg.slug] || fallbackImages.nairobi;
  const categoryLabel = pkg.category === "wedding" 
    ? "Wedding Collection" 
    : pkg.category === "prewedding" 
    ? "Pre-Wedding" 
    : "Studio Session";

  const formatPrice = (price: number) =>
    `N${new Intl.NumberFormat("en-NG").format(price)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/95 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-primary/30"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center border border-primary/40 bg-card/80 backdrop-blur-sm text-foreground hover:border-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Hero Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <motion.img
                src={imageUrl}
                alt={pkg.name}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              
              {/* Popular Badge */}
              {pkg.popular && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-6 left-0"
                >
                  <div className="flex items-center gap-2 bg-gold-gradient px-5 py-2">
                    <Star className="w-4 h-4 text-primary-foreground" fill="currentColor" />
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-primary-foreground font-medium">
                      Most Popular
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Package Type Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-6 left-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/50 bg-card/80 backdrop-blur-sm">
                  <Camera className="w-4 h-4 text-primary" />
                  <span className="font-body text-xs tracking-[0.3em] uppercase text-primary">
                    {categoryLabel}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-10">
                {pkg.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-body text-xs tracking-[0.4em] uppercase text-primary mb-3"
                  >
                    {pkg.subtitle}
                  </motion.p>
                )}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="font-display text-4xl md:text-5xl tracking-[0.15em] text-foreground mb-4"
                >
                  {pkg.name}
                </motion.h2>
                
                {/* Decorative Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex items-center justify-center gap-3 mb-6"
                >
                  <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/50" />
                  <div className="w-2 h-2 rotate-45 border border-primary" />
                  <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/50" />
                </motion.div>

                {/* Price */}
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 }}
                  className="font-display text-5xl md:text-6xl text-metallic-gold"
                >
                  {formatPrice(pkg.price)}
                </motion.p>
              </div>

              {/* Description */}
              {pkg.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-body text-base text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto mb-12"
                >
                  {pkg.description}
                </motion.p>
              )}

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Package Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                    className="bg-secondary/30 border border-primary/20 p-6"
                  >
                    <h3 className="font-display text-lg tracking-[0.15em] text-foreground mb-6">
                      Package Includes
                    </h3>
                    <ul className="space-y-4">
                      {pkg.features.map((feature, i) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center border border-primary/50 bg-primary/10 mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="font-body text-sm text-foreground/90">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Additional Features */}
                {pkg.additional_features && pkg.additional_features.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-secondary/30 border border-primary/20 p-6"
                  >
                    <h3 className="font-display text-lg tracking-[0.15em] text-foreground mb-6">
                      Additional Benefits
                    </h3>
                    <ul className="space-y-4">
                      {pkg.additional_features.map((feature, i) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.65 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center border border-primary/50 bg-primary/10 mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="font-body text-sm text-foreground/90">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Info Cards */}
              {(pkg.delivery_time || pkg.ideal_for) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-2 gap-4 mb-12"
                >
                  {pkg.delivery_time && (
                    <div className="text-center p-4 border border-primary/20 bg-card/50">
                      <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">
                        Delivery Time
                      </p>
                      <p className="font-display text-lg text-foreground">
                        {pkg.delivery_time}
                      </p>
                    </div>
                  )}
                  {pkg.ideal_for && (
                    <div className="text-center p-4 border border-primary/20 bg-card/50">
                      <Star className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">
                        Ideal For
                      </p>
                      <p className="font-display text-sm text-foreground leading-snug">
                        {pkg.ideal_for}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="text-center space-y-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    onInquire();
                  }}
                  className="px-12 py-4 bg-gold-gradient text-primary-foreground font-body text-sm tracking-[0.25em] uppercase hover:shadow-gold transition-shadow duration-300"
                >
                  Inquire About This Package
                </motion.button>
                
                {onShowQR && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onClose();
                      onShowQR();
                    }}
                    className="flex items-center justify-center gap-2 mx-auto px-8 py-3 border border-primary/30 text-primary font-body text-xs tracking-[0.2em] uppercase hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    Get QR Code to Share
                  </motion.button>
                )}
                
                <p className="font-body text-xs text-muted-foreground">
                  Our team will respond within 24 hours
                </p>
              </motion.div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/40" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
