import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

// Matches DESIGN.md's "Components > Buttons" section: mustard-gold primary
// with charcoal-on-white text, thick padding, rounded-xl corners, and a
// gentle scale-up on hover instead of a color darken.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-label-md text-label-md rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:scale-[1.02] shadow-lg shadow-primary/20",
        secondary: "bg-surface-container-high text-on-surface hover:bg-primary-fixed",
        outline: "border-2 border-outline text-on-surface hover:bg-surface-variant",
        ghost: "text-primary hover:bg-primary-fixed/40",
        destructive: "bg-error text-on-error hover:scale-[1.02]",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3",
        lg: "px-8 py-4",
        icon: "p-3 rounded-full",
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
