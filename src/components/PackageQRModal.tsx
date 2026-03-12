import { useRef, useCallback } from "react";
import { X, Download, Share2, Copy, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCode } from "react-qrcode-logo";
import { Package } from "@/hooks/usePackages";
import { toast } from "@/hooks/use-toast";
import brandLogo from "@/assets/brand-logo.png";

interface PackageQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package | null;
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

export function PackageQRModal({ isOpen, onClose, package: pkg }: PackageQRModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) =>
    `N${new Intl.NumberFormat("en-NG").format(price)}`;

  const getPackageUrl = useCallback(() => {
    if (!pkg) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/?package=${pkg.slug}`;
  }, [pkg]);

  const downloadQRCode = useCallback(() => {
    if (!qrRef.current || !pkg) return;
    
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    // Create a new canvas with padding and branding
    const paddedCanvas = document.createElement("canvas");
    const ctx = paddedCanvas.getContext("2d");
    if (!ctx) return;

    const padding = 40;
    const headerHeight = 80;
    const footerHeight = 60;
    
    paddedCanvas.width = canvas.width + padding * 2;
    paddedCanvas.height = canvas.height + padding * 2 + headerHeight + footerHeight;

    // Background
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);

    // Gold border
    ctx.strokeStyle = "#C9A050";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, paddedCanvas.width - 20, paddedCanvas.height - 20);

    // Header text
    ctx.fillStyle = "#C9A050";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ALAMEEN STUDIOS", paddedCanvas.width / 2, 45);
    
    ctx.fillStyle = "#F9F9F9";
    ctx.font = "20px serif";
    ctx.fillText(pkg.name.toUpperCase(), paddedCanvas.width / 2, 75);

    // QR Code
    ctx.drawImage(canvas, padding, headerHeight + padding / 2);

    // Footer text
    ctx.fillStyle = "#C9A050";
    ctx.font = "16px sans-serif";
    ctx.fillText(formatPrice(pkg.price), paddedCanvas.width / 2, paddedCanvas.height - footerHeight + 25);
    
    ctx.fillStyle = "#888888";
    ctx.font = "10px sans-serif";
    ctx.fillText("Scan to view package details", paddedCanvas.width / 2, paddedCanvas.height - 20);

    // Download
    const link = document.createElement("a");
    link.download = `alameen-${pkg.slug}-qr.png`;
    link.href = paddedCanvas.toDataURL("image/png");
    link.click();

    toast({
      title: "QR Code Downloaded",
      description: `${pkg.name} QR code saved to your device`,
    });
  }, [pkg]);

  const shareViaWhatsApp = useCallback(() => {
    if (!pkg) return;
    const url = getPackageUrl();
    const message = `✨ Check out the ${pkg.name} package from Alameen Studios!\n\n💰 ${formatPrice(pkg.price)}\n\n🔗 ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }, [pkg, getPackageUrl]);

  const copyLink = useCallback(async () => {
    const url = getPackageUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Package link copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  }, [getPackageUrl]);

  if (!pkg) return null;

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

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-12 h-12 border border-primary/40 mb-4"
                >
                  <QrCode className="w-6 h-6 text-primary" />
                </motion.div>
                <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-2">
                  Share Package
                </p>
                <h2 className="font-display text-2xl tracking-[0.1em] text-foreground">
                  {pkg.name}
                </h2>
                <p className="font-display text-xl text-metallic-gold mt-2">
                  {formatPrice(pkg.price)}
                </p>
              </div>

              {/* QR Code */}
              <motion.div
                ref={qrRef}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-8"
              >
                <div className="p-4 bg-white rounded-sm">
                  <QRCode
                    value={getPackageUrl()}
                    size={220}
                    bgColor="#FFFFFF"
                    fgColor="#121212"
                    qrStyle="squares"
                    eyeRadius={0}
                    logoImage={brandLogo}
                    logoWidth={50}
                    logoHeight={50}
                    removeQrCodeBehindLogo={true}
                    ecLevel="H"
                  />
                </div>
              </motion.div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
                <div className="w-1.5 h-1.5 rotate-45 border border-primary/50" />
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadQRCode}
                  className="w-full py-3 flex items-center justify-center gap-3 bg-gold-gradient text-primary-foreground font-body text-xs tracking-[0.2em] uppercase hover:shadow-gold transition-shadow"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </motion.button>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={shareViaWhatsApp}
                    className="py-3 flex items-center justify-center gap-2 border border-primary/40 text-primary font-body text-xs tracking-[0.15em] uppercase hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={copyLink}
                    className="py-3 flex items-center justify-center gap-2 border border-primary/40 text-primary font-body text-xs tracking-[0.15em] uppercase hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </motion.button>
                </div>
              </div>

              {/* Helper Text */}
              <p className="text-center font-body text-xs text-muted-foreground mt-6">
                Scan to view package details or share with clients
              </p>
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
