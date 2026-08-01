import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Matches DESIGN.md's "Components > Input Fields": subtle border on the
// cream surface, replaced by a 2px mustard-gold stroke on focus.
// forwardRef so react-hook-form/native form APIs can register/focus this input directly.
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:border-primary focus:border-2",
        className
      )}
      // Forwards all native input props (type, value, onChange, etc.) untouched
      {...props}
    />
  )
);
Input.displayName = "Input";
