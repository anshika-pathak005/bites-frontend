import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

// Matches DESIGN.md's "Components > Buttons" section: mustard-gold primary
// with charcoal-on-white text, thick padding, rounded-xl corners, responsive touch targets,
// and gentle scaling on hover/active states across all device screens.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-label-md rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] max-w-full font-semibold select-none whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary/90 hover:scale-[1.02] shadow-md hover:shadow-lg shadow-primary/20",
        secondary: "bg-surface-container-high text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed-variant",
        outline: "border-2 border-outline/80 text-on-surface hover:bg-surface-variant hover:border-primary",
        ghost: "text-primary hover:bg-primary-fixed/30",
        destructive: "bg-error text-on-error hover:bg-error/90 hover:scale-[1.02] shadow-md shadow-error/20",
      },
      size: {
        sm: "px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm min-h-[36px]",
        md: "px-4.5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm min-h-[44px]",
        lg: "px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base min-h-[48px]",
        icon: "p-2.5 sm:p-3 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0",
        full: "w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base min-h-[44px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

// Combines native button props with the cva variant/size props above.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// forwardRef so callers can attach a ref to the underlying <button> (e.g. for focus management).
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    // className last in cn() lets consumers override/extend the generated variant classes
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

