"use client";

import { Home, Briefcase, MapPin, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/address.types";

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: (address: Address) => void;
  onEdit?: (address: Address) => void;
  onDelete?: (address: Address) => void;
  selectable?: boolean;
}

export function AddressCard({
  address,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  selectable = true,
}: AddressCardProps) {
  const isHome = address.label.toLowerCase() === "home";
  const isWork = address.label.toLowerCase() === "work";

  const IconComponent = isHome ? Home : isWork ? Briefcase : MapPin;

  return (
    <div
      onClick={() => selectable && onSelect?.(address)}
      className={cn(
        "relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 bg-surface-container-lowest",
        selectable ? "cursor-pointer" : "",
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-md bg-primary-fixed/10"
          : "border-outline-variant/40 hover:border-outline-variant/80 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface">
            <IconComponent className="w-3.5 h-3.5 text-primary" />
            {address.label}
          </span>
          {address.isDefault && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] py-0 px-2">
              Default
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(address)}
              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors"
              aria-label="Edit address"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(address)}
              className="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error-container/20 transition-colors"
              aria-label="Delete address"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-on-surface font-medium line-clamp-2 leading-relaxed">
        {address.fullAddress}
      </p>

      {(address.landmark || address.pincode) && (
        <div className="flex items-center gap-2 mt-1.5 text-[11px] sm:text-xs text-secondary">
          {address.landmark && <span>Near {address.landmark}</span>}
          {address.landmark && address.pincode && <span>•</span>}
          {address.pincode && <span>PIN: {address.pincode}</span>}
        </div>
      )}

      {selected && (
        <div className="absolute top-3.5 right-3.5 pointer-events-none text-primary">
          <CheckCircle2 className="w-5 h-5 fill-primary text-white" />
        </div>
      )}
    </div>
  );
}
