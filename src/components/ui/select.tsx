"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Root/Value are used as-is — no visual styling needed on these themselves.
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

// Closed trigger box — matches Input's border/focus styling so it reads as
// the same design system, not a bolted-on library widget.
export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-on-surface outline-none transition-all focus:border-primary focus:border-2 disabled:opacity-50 disabled:pointer-events-none data-[placeholder]:text-on-surface-variant/60",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-on-surface-variant shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// The dropdown panel — this is the part native <select> could never let us
// theme. Portaled by Radix automatically, so it isn't clipped/covered by
// any ancestor's overflow or stacking context.
export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={4}
        className={cn(
          "z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-lg",
          "w-[var(--radix-select-trigger-width)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// One option row — highlighted/selected states use the same primary-tinted
// tone as the rest of the theme (Badge, active nav links, etc).
export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex items-center rounded-md px-2.5 py-1.5 sm:px-3 sm:py-2 pr-7 sm:pr-8 text-xs sm:text-sm text-on-surface outline-none cursor-pointer select-none transition-colors",
        "data-[highlighted]:bg-primary-fixed/40",
        "data-[state=checked]:bg-primary-fixed/60 data-[state=checked]:font-semibold",
        "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 sm:right-3">
        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
