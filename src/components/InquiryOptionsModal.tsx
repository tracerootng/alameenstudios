import { X, MessageCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InquiryOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: string;
  packageType: string;
  packagePrice: string;
  onBookWebsite: () => void;
}

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

export function InquiryOptionsModal({ 
  isOpen, 
  onClose, 
  packageName, 
  packageType, 
  packagePrice,
  onBookWebsite 
}: InquiryOptionsModalProps) {
  const whatsappNumber = "2349160000500";
  
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello! I'm interested in the ${packageName} ${packageType} package (${packagePrice}). I would like to inquire about availability and booking details.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    onClose();
  };

  const handleWebsiteBooking = () => {
    onClose();
    onBookWebsite();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
            className="relative w-full max-w-md bg-card border border-primary/30"
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

            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-body text-xs tracking-[0.4em] uppercase text-primary mb-3"
                >
                  How would you like to inquire?
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-display text-2xl md:text-3xl tracking-[0.1em] text-foreground mb-2"
                >
                  {packageName}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-body text-sm text-muted-foreground"
                >
                  {packageType} • {packagePrice}
                </motion.p>
              </div>

              {/* Decorative Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="flex items-center justify-center gap-3 mb-8"
              >
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
                <div className="w-1.5 h-1.5 rotate-45 border border-primary" />
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
              </motion.div>

              {/* Options */}
              <div className="space-y-4">
                {/* WhatsApp Option */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-4 p-5 border border-green-500/40 bg-green-500/5 hover:border-green-500 hover:bg-green-500/10 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-green-500/20 border border-green-500/30 group-hover:bg-green-500/30 transition-colors">
                    <MessageCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-display text-lg tracking-[0.1em] text-foreground mb-1">
                      WhatsApp
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      Send an instant message with package details
                    </p>
                  </div>
                </motion.button>

                {/* Website Booking Option */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWebsiteBooking}
                  className="w-full flex items-center gap-4 p-5 border border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/20 border border-primary/30 group-hover:bg-primary/30 transition-colors">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-display text-lg tracking-[0.1em] text-foreground mb-1">
                      Book on Website
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      Fill out our inquiry form with your details
                    </p>
                  </div>
                </motion.button>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="font-body text-xs text-muted-foreground text-center mt-6"
              >
                We typically respond within 24 hours
              </motion.p>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-primary/40" />
            <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-primary/40" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-primary/40" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-primary/40" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
