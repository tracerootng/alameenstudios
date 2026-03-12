import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const luxuryButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 font-body text-sm tracking-[0.15em] uppercase transition-all duration-500 ease-out disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        gold: "bg-gold-gradient text-primary-foreground border-0 hover:shadow-gold-glow",
        outline: "bg-transparent border border-primary/40 text-primary hover:border-primary hover:bg-primary/10",
        ghost: "bg-transparent text-primary hover:text-gold-light",
        shimmer: "bg-gold-gradient text-primary-foreground border-0 hover:shadow-gold-intense shimmer",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 px-6 py-2 text-xs",
        lg: "h-14 px-12 py-4",
        xl: "h-16 px-16 py-5 text-base",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "default",
    },
  }
);

export interface LuxuryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof luxuryButtonVariants> {
  asChild?: boolean;
}

const LuxuryButton = React.forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(luxuryButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
LuxuryButton.displayName = "LuxuryButton";

export { LuxuryButton, luxuryButtonVariants };
