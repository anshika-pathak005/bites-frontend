import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Multi-line text input styled to match Input; vertically resizable, min height of 8rem.
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:border-primary focus:border-2 min-h-32 resize-y",
        className
      )}
      // Forwards all native textarea props (value, onChange, rows, etc.) untouched
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
