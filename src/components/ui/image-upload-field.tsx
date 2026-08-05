"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { useImageUpload } from "@/features/admin/uploads/hooks/use-image-upload";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  // Lets the parent form disable Save while an upload is in flight.
  onUploadingChange?: (uploading: boolean) => void;
}

// File-picker + preview for an image field. Uploads immediately on
// selection and hands the hosted URL back via onChange — replaces typing a
// Cloudinary URL in by hand.
export function ImageUploadField({ value, onChange, onUploadingChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error } = useImageUpload();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset now so re-selecting the same file after a failed upload still fires this handler
    e.target.value = "";
    if (!file) return;

    onUploadingChange?.(true);
    const url = await upload(file);
    onUploadingChange?.(false);
    if (url) onChange(url);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant bg-surface-container shrink-0">
            <Image src={value} alt="Preview" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
            <ImagePlus className="w-5 h-5" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-label-sm hover:bg-surface-variant transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </span>
          ) : (
            value ? "Change Image" : "Upload Image"
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
