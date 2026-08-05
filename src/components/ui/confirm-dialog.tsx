"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Reusable "are you sure?" modal for any destructive/critical admin action
// (delete, deactivate, etc.) — renders nothing while closed, so it's safe
// to always mount at the bottom of a page and just toggle `open`.
export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Portal straight to <body> — see Modal for why (a sibling flex item with
  // its own z-index elsewhere in the tree can out-paint a deeply-nested
  // high z-index; portaling out sidesteps the whole stacking comparison).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-inverse-surface/60" onClick={onCancel} />
      <div className="relative z-10 flex items-center justify-center min-h-full p-4">
        <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
          <h3 className="font-headline-md text-headline-md">{title}</h3>
          <p className="text-secondary text-body-md">{message}</p>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {cancelLabel}
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "Please wait..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
