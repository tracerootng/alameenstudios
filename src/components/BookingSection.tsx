import { useState } from "react";
import { Send, Calendar, MapPin, User, Mail, Phone, MessageSquare, Package, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { LuxuryButton } from "./ui/LuxuryButton";
import { useToast } from "@/hooks/use-toast";
import { usePackages } from "@/hooks/usePackages";
import { supabase } from "@/lib/supabase";
import { bookingSchema, getErrorMessage, logError } from "@/lib/security";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, icon, error, children }: FieldProps) {
  return (
    <div className="relative group">
      <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3 block transition-colors group-focus-within:text-primary">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-4 text-primary/40 group-focus-within:text-primary transition-colors z-10">
          {icon}
        </span>
        {children}
      </div>
      {/* Gold underline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/20">
        <div className="h-full w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5 font-body">{error}</p>}
    </div>
  );
}

export function BookingSection() {
  const { toast } = useToast();
  const { packages, loading: packagesLoading, formatPrice } = usePackages();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    date: "",
    package: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const packageOptions = [
    { value: "", label: "Select a package", slug: "" },
    ...packages.map((pkg) => ({
      value: pkg.slug,
      label: `${pkg.name} — ${pkg.category === "wedding" ? "Wedding" : pkg.category === "prewedding" ? "Pre-Wedding" : "Studio"} (${formatPrice(pkg.price)})`,
      slug: pkg.slug,
    })),
    { value: "custom", label: "Custom Package — Let's discuss", slug: "custom" },
  ];

  const validateForm = () => {
    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Please fix the errors", description: "Some fields need attention.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedPkg = packages.find((p) => p.slug === formData.package);
      const packageLabel = selectedPkg
        ? `${selectedPkg.name} (${formatPrice(selectedPkg.price)})`
        : formData.package === "custom" ? "Custom Package" : null;
      const packageId = selectedPkg?.id || null;

      const { error } = await supabase.from("bookings").insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        event_date: formData.date,
        package_id: packageId,
        package_name: packageLabel,
        message: formData.message?.trim() || null,
        status: "pending",
      });
      if (error) throw error;

      toast({ title: "Inquiry Received", description: "Thank you for your interest. We'll be in touch within 24 hours." });
      setFormData({ name: "", email: "", phone: "", location: "", date: "", package: "", message: "" });
      setErrors({});
    } catch (error) {
      logError("BookingSubmission", error);
      toast({ title: "Submission Failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePackageSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, package: value }));
    setIsDropdownOpen(false);
  };

  const selectedPackage = packageOptions.find((p) => p.value === formData.package);

  const inputClass = "w-full bg-transparent pl-12 pr-4 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground/40 outline-none border-b border-primary/20 focus:border-primary transition-colors duration-300";

  return (
    <section id="booking" className="relative py-24 lg:py-36">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
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
              Begin Your Journey
            </p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[0.08em] text-foreground mb-6">
              Book Your <span className="italic text-metallic-gold">Session</span>
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rotate-45 bg-primary/50" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mt-6 leading-relaxed">
              Share the details of your special day, and we'll craft a personalized experience just for you.
            </p>
          </motion.div>

          {/* Glassmorphism form container */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            variants={fadeInUp}
            className="relative"
          >
            {/* Outer glow */}
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-60 pointer-events-none" />

            <div className="relative bg-card/40 backdrop-blur-xl border border-primary/15 p-8 lg:p-12">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-primary/40" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-primary/40" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-primary/40" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-primary/40" />

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Name */}
                  <FormField label="Full Name" icon={<User className="w-4 h-4" />} error={errors.name}>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      required maxLength={100} className={inputClass} placeholder="Your name"
                    />
                  </FormField>

                  {/* Email */}
                  <FormField label="Email Address" icon={<Mail className="w-4 h-4" />} error={errors.email}>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      required maxLength={255} className={inputClass} placeholder="your@email.com"
                    />
                  </FormField>

                  {/* Phone */}
                  <FormField label="Phone Number" icon={<Phone className="w-4 h-4" />} error={errors.phone}>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      required maxLength={25} className={inputClass} placeholder="+234 xxx xxxx xxx"
                    />
                  </FormField>

                  {/* Location */}
                  <FormField label="Wedding Location" icon={<MapPin className="w-4 h-4" />} error={errors.location}>
                    <input
                      type="text" name="location" value={formData.location} onChange={handleChange}
                      required maxLength={200} className={inputClass} placeholder="City, Country"
                    />
                  </FormField>
                </div>

                {/* Package Selection */}
                <div className="relative group">
                  <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3 block group-focus-within:text-primary transition-colors">
                    Select Package
                  </label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 z-10" />
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      disabled={packagesLoading}
                      className="w-full bg-transparent border-b border-primary/20 pl-12 pr-4 py-4 font-body text-sm text-left outline-none flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span className={formData.package ? "text-foreground" : "text-muted-foreground/40"}>
                        {packagesLoading ? "Loading packages..." : (selectedPackage?.label || "Select a package")}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-primary/50 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-md border border-primary/20 z-50 max-h-72 overflow-y-auto shadow-2xl"
                      >
                        {packageOptions.slice(1).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handlePackageSelect(option.value)}
                            className={`w-full px-12 py-3.5 font-body text-sm text-left transition-colors hover:bg-primary/10 border-b border-primary/5 last:border-0 ${
                              formData.package === option.value ? "bg-primary/15 text-primary" : "text-foreground"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <FormField label="Event Date" icon={<Calendar className="w-4 h-4" />} error={errors.date}>
                  <input
                    type="date" name="date" value={formData.date} onChange={handleChange}
                    required className={`w-full bg-transparent pl-12 pr-4 py-4 font-body text-sm text-foreground outline-none border-b border-primary/20 focus:border-primary transition-colors duration-300`}
                  />
                </FormField>

                {/* Message */}
                <div className="relative group">
                  <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3 block group-focus-within:text-primary transition-colors">
                    Tell Us About Your Vision
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                    <textarea
                      name="message" value={formData.message} onChange={handleChange}
                      rows={5} maxLength={2000}
                      className="w-full bg-transparent border-b border-primary/20 focus:border-primary pl-12 pr-4 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-300 resize-none"
                      placeholder="Share the details of your special day..."
                    />
                  </div>
                  {errors.message && <p className="text-red-400 text-xs mt-1.5">{errors.message}</p>}
                </div>

                {/* Submit */}
                <div className="text-center pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: "0 0 40px hsl(var(--primary) / 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block"
                  >
                    <LuxuryButton type="submit" size="lg" disabled={isSubmitting} className="bg-primary border-0 text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_30px_hsl(32,100%,50%,0.3)] min-w-[240px] relative overflow-hidden group">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      {isSubmitting ? (
                        <span className="animate-pulse tracking-widest">Sending...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Inquiry
                        </>
                      )}
                    </LuxuryButton>
                  </motion.div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Important Notes */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            variants={fadeInUp}
            className="mt-16 p-8 border border-primary/15 bg-primary/3 relative"
          >
            <div className="absolute top-0 left-0 w-6 h-6 border-l border-t border-primary/40" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-primary/40" />
            <h3 className="font-display text-base tracking-[0.15em] text-foreground text-center mb-6">
              Important Notes
            </h3>
            <ul className="space-y-4">
              {[
                "Travel and accommodation outside Kano/Abuja are billed separately and discussed during consultation.",
                "Your date is not secured until the booking fee is received and confirmed.",
                "Availability operates on a first-come, first-served basis.",
              ].map((note, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1 h-1 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                  <p className="font-body text-sm text-muted-foreground">{note}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
      )}
    </section>
  );
}
