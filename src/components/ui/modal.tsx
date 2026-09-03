"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * "md" (default) suits short forms. "lg" is for forms with side-by-side
   * fields — the address form in particular, which reads badly when the
   * flat/building and landmark/pincode pairs are squeezed into a narrow column.
   */
  size?: "md" | "lg";
}

// Generic centered popup for forms (create/edit, etc). Backdrop click closes
// it; content scrolls internally if it's taller than the viewport.
export function Modal({ open, title, onClose, children, size = "md" }: ModalProps) {
  // Portal straight to <body> — the admin sidebar's mobile top bar is a flex
  // item with its own z-index, which (per the flexbox spec) gives it a
  // stacking context that out-paints this modal's z-50 even though 50 > 30,
  // because that comparison never happens: the modal's ancestor content div
  // has no z-index of its own, so the modal never gets compared against the
  // sidebar directly. Rendering to document.body sidesteps that entirely.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative z-10 flex items-center justify-center min-h-full p-3 sm:p-4">
        <div
          className={`relative bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${
            size === "lg" ? "max-w-3xl" : "max-w-xl"
          }`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-outline-variant/30 sticky top-0 bg-surface-container-lowest/95 backdrop-blur-md z-10">
            <h3 className="font-headline-md text-lg sm:text-headline-md font-bold text-on-surface">{title}</h3>
            <button onClick={onClose} className="p-1.5 sm:p-2 rounded-xl hover:bg-surface-variant text-on-surface transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
