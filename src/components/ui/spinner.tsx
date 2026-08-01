import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// One consistent loading indicator used everywhere a query is in flight —
// avoids every page inventing its own loading UI.
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-primary", className)} />;
}
