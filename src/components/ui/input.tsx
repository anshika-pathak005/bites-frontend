import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Matches DESIGN.md's "Components > Input Fields": Dark #201f1f background with #a08e7a border.
// On focus, transitions to primary-container with glowing ring.
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-outline-variant/50 bg-surface-container px-4 py-3 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
