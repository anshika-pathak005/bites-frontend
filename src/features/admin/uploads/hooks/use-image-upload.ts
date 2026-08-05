import { useState } from "react";
import { uploadImage } from "../api/uploads.api";

// Uploads a single image file and returns its hosted URL. isUploading lets
// callers (e.g. a form's Save button) block submission until it resolves.
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<string | null> {
    setIsUploading(true);
    setError(null);
    try {
      return await uploadImage(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading, error };
}
