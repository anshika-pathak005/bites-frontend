import { cn } from "@/lib/utils";

// Matches DESIGN.md's "Components > Chips/Badges": desaturated primary tone
// with a subtle border, used for dietary tags ("Vegan"), Best Seller, etc.
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-outline-variant bg-primary-fixed/50 px-3 py-1 font-label-sm text-label-sm text-on-primary-fixed-variant",
        className
      )}
      // Spread last so callers can still override className/other props via cn() above
      {...props}
    />
  );
}
