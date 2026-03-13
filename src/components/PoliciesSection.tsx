import { motion } from "framer-motion";
import { Info, Clock, CreditCard, ShieldAlert, Camera, Package } from "lucide-react";
import { businessData } from "@/data/studioData";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

function PolicyCard({ title, icon, items }: { title: string, icon: React.ReactNode, items: { label: string, value: string | number }[] }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-card/40 border border-primary/10 p-8 hover:bg-card/60 hover:border-primary/30 transition-colors duration-500 group"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="font-display text-xl tracking-[0.08em] uppercase text-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 border-b border-primary/5 pb-3 last:border-0 last:pb-0">
            <span className="font-body text-sm text-muted-foreground">{item.label}</span>
            <span className="font-body text-sm text-foreground font-medium text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function PoliciesSection() {
  const { general_studio_policies: gen, wedding_policies: wed } = businessData;

  const formatPrice = (price: number) =>
    `N${new Intl.NumberFormat("en-NG").format(price)}`;

  return (
    <section id="policies" className="relative py-24 lg:py-36 bg-background">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="font-display text-[15vw] font-bold text-primary/[0.02] whitespace-nowrap">
          TERMS & POLICIES
        </span>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          variants={fadeInUp}
          className="text-center mb-16 lg:mb-24"
        >
          <p className="font-body text-xs tracking-[0.5em] uppercase text-primary mb-4">
            Studio Guidelines
          </p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[0.08em] text-foreground">
            Our <span className="italic text-metallic-gold">Policies</span>
          </h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <div className="w-1 h-1 rotate-45 bg-primary/50" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* General Studio Policies */}
          <div className="space-y-8">
            <h3 className="font-display text-2xl tracking-[0.1em] text-metallic-gold mb-6 border-b border-primary/20 pb-4 inline-block">
              General Studio Policies
            </h3>
            
            <div className="grid gap-6">
              <PolicyCard 
                title="Booking & Payments" 
                icon={<CreditCard className="w-6 h-6" />}
                items={[
                  { label: "Deposit Requirement", value: `${gen.booking_deposit_percentage}%` },
                  { label: "Refund Policy", value: gen.refund_policy }
                ]}
              />

              <PolicyCard 
                title="Time & Deliverables" 
                icon={<Clock className="w-6 h-6" />}
                items={[
                  { label: "Standard Turnaround", value: gen.turnaround_time_working_days },
                  { label: "Express Turnaround", value: gen.express_service_turnaround_days },
                  { label: "Express Service Fee", value: `+${gen.express_service_charge_percentage}% of total` },
                  { label: "Lateness Fee", value: `${formatPrice(gen.lateness_fee_per_30_mins)} per 30 mins` }
                ]}
              />

              <PolicyCard 
                title="Add-ons & Extras" 
                icon={<Camera className="w-6 h-6" />}
                items={[
                  { label: "Extra Edited Photo", value: formatPrice(gen.extra_photo_cost_per_copy) },
                  ...gen.additional_charges.map(charge => ({ label: "Additional Service", value: charge }))
                ]}
              />
            </div>
          </div>

          {/* Wedding Policies */}
          <div className="space-y-8 mt-12 lg:mt-0">
            <h3 className="font-display text-2xl tracking-[0.1em] text-metallic-gold mb-6 border-b border-primary/20 pb-4 inline-block">
              Wedding Policies
            </h3>
            
            <div className="grid gap-6">
              <PolicyCard 
                title="Wedding Booking" 
                icon={<ShieldAlert className="w-6 h-6" />}
                items={[
                  { label: "Deposit Policy", value: wed.deposit_policy },
                  { label: "Payment Rule", value: wed.payment_rule },
                  { label: "Quote Validity", value: wed.validity }
                ]}
              />

              <PolicyCard 
                title="Logistics & Delivery" 
                icon={<Package className="w-6 h-6" />}
                items={[
                  { label: "Turnaround Time", value: wed.turnaround_time },
                  { label: "Pricing Structure", value: wed.pricing_note },
                ]}
              />

              <PolicyCard 
                title="Exclusions" 
                icon={<Info className="w-6 h-6" />}
                items={
                  wed.exclusions.map((exclusion, i) => ({ label: `Not Included ${i + 1}`, value: exclusion }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
