import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges Tailwind class names, resolving conflicts (e.g. "p-2 p-4" -> "p-4").
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// One shared money formatter so every price on the site (menu cards, cart,
// checkout, order tracking, admin) renders identically, safely falling back to ₹0 if undefined or NaN.
export function formatPrice(amount?: number | null) {
  const val = typeof amount === "number" && !isNaN(amount) ? amount : Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}
