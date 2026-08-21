import { cn } from "@/lib/utils";

// Matches DESIGN.md's "Components > Chips/Badges": luxury dark surface
// with a subtle amber border and glowing text.
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary-container/40 bg-surface-container px-2.5 py-0.5 font-label-sm text-[11px] font-semibold text-primary-fixed shadow-sm",
        className
      )}
      {...props}
    />
  );
}
