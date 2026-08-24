import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

// Matches DESIGN.md's "Components > Buttons" section: mustard-gold primary
// with charcoal-on-white text, thick padding, rounded-xl corners, responsive touch targets,
// and gentle scaling on hover/active states across all device screens.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-label-md rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] max-w-full font-semibold select-none whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary-container text-black font-bold hover:bg-primary-fixed hover:scale-[1.02] glow-hover shadow-md shadow-primary-container/20",
        default: "bg-primary-container text-black font-bold hover:bg-primary-fixed hover:scale-[1.02] glow-hover shadow-md shadow-primary-container/20",
        secondary: "bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary-container hover:text-primary-fixed",
        outline: "border border-outline-variant/60 text-on-surface hover:border-primary-container hover:text-primary-fixed hover:bg-surface-container/50",
        ghost: "text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container/50",
        destructive: "bg-error text-on-error hover:bg-error/90 hover:scale-[1.02] shadow-md shadow-error/20",
      },
      size: {
        sm: "px-3 py-1.5 text-xs min-h-[32px] rounded-lg",
        md: "px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm min-h-[38px] rounded-xl",
        lg: "px-5 py-2.5 sm:px-6 sm:py-3 text-sm min-h-[42px] rounded-xl",
        icon: "p-2 sm:p-2.5 rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0",
        full: "w-full px-4 py-2.5 sm:py-3 text-sm min-h-[40px] rounded-xl",
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

