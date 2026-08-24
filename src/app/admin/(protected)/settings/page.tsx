"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { useRestaurantSettings, useUpdateRestaurantSettings } from "@/features/admin/settings/hooks/use-admin-settings";
import type { RestaurantSettingsPayload } from "@/features/admin/settings/api/admin-settings.api";

type SettingsFormState = Omit<
  RestaurantSettingsPayload,
  "minOrderAmount" | "maxDeliveryRadiusKm" | "cancellationWindowMinutes"
> & {
  minOrderAmount: number | "";
  maxDeliveryRadiusKm: number | "";
  cancellationWindowMinutes: number | "";
};

// Fallback shape for the form before real settings have loaded.
const EMPTY_FORM: SettingsFormState = {
  name: "",
  description: "",
  logoUrl: "",
  email: "",
  phone: "",
  address: "",
  openingTime: "09:00",
  closingTime: "23:00",
  isOpen: true,
  minOrderAmount: "",
  maxDeliveryRadiusKm: 8,
  cancellationWindowMinutes: 5,
};

// Every half-hour slot in a day, e.g. "00:00", "00:30", ... "23:30" — used to
// populate the opening/closing time pickers.
const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
});

function formatTimeLabel(time: string): string {
  if (!time) return "";
  const [hoursStr, minutes] = time.split(":");
  const hours = Number(hoursStr || 0);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes || "00"} ${period}`;
}

// Normalizes "09:00:00" -> "09:00" to match TIME_OPTIONS dropdown items
function normalizeTime(timeStr?: string | null, fallback = "09:00"): string {
  if (!timeStr) return fallback;
  const trimmed = timeStr.trim();
  if (trimmed.length >= 5) {
    return trimmed.substring(0, 5);
  }
  return fallback;
}

// Admin page for editing restaurant profile info, operating hours, delivery radius, and order policies.
export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useRestaurantSettings();
  const updateSettings = useUpdateRestaurantSettings();
  const [form, setForm] = useState<SettingsFormState>(EMPTY_FORM);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Populate form once real settings arrive
  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name ?? "",
        description: settings.description ?? "",
        logoUrl: settings.logoUrl ?? "",
        email: settings.email ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
        openingTime: normalizeTime(settings.openingTime, "09:00"),
        closingTime: normalizeTime(settings.closingTime, "23:00"),
        isOpen: settings.isOpen ?? true,
        minOrderAmount: settings.minOrderAmount ?? 0,
        maxDeliveryRadiusKm: settings.maxDeliveryRadiusKm ?? 8,
        cancellationWindowMinutes: settings.cancellationWindowMinutes ?? 5,
      });
    }
  }, [settings]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSettings.mutate({
      ...form,
      minOrderAmount: form.minOrderAmount === "" ? 0 : form.minOrderAmount,
      maxDeliveryRadiusKm: form.maxDeliveryRadiusKm === "" ? 8 : form.maxDeliveryRadiusKm,
      cancellationWindowMinutes: form.cancellationWindowMinutes === "" ? 5 : form.cancellationWindowMinutes,
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <span className="text-primary font-bold text-xs tracking-widest uppercase block mb-1">CONFIGURATION</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Restaurant Settings</h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">
          Basic info shown to customers, operating hours, delivery radius, and cancellation window.
        </p>
      </div>

      {/* Validation Error Banner */}
      {updateSettings.isError && (
        <div className="p-4 rounded-2xl bg-error-container/40 border border-error/40 text-error text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-on-surface">Update Failed</p>
            <p className="text-error/90 leading-relaxed">
              {updateSettings.error?.message || "Please check the input values and try again."}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
        <div>
          <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Restaurant Name *</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" />
        </div>
        <div>
          <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Description</label>
          <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
        </div>
        <div>
          <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Restaurant Logo</label>
          <ImageUploadField
            value={form.logoUrl ?? ""}
            onChange={(url) => setForm({ ...form, logoUrl: url })}
            onUploadingChange={setIsImageUploading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Contact Email</label>
            <Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Contact Phone</label>
            <div className="flex">
              <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-outline-variant/60 bg-surface-container-high text-on-surface-variant text-sm font-medium">
                +91
              </span>
              <Input
                type="tel"
                pattern="[0-9]{10}"
                title="10-digit phone number"
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-l-none rounded-r-xl"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Address</label>
          <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Opening Time *</label>
            <Select value={form.openingTime} onValueChange={(value) => setForm({ ...form, openingTime: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{formatTimeLabel(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Closing Time *</label>
            <Select value={form.closingTime} onValueChange={(value) => setForm({ ...form, closingTime: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{formatTimeLabel(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Financial, Distance & Policy Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Min Order Amount (₹) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 150"
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value === "" ? "" : Number(e.target.value) })}
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Max Radius (km) *</label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="e.g. 8"
              value={form.maxDeliveryRadiusKm}
              onChange={(e) => setForm({ ...form, maxDeliveryRadiusKm: e.target.value === "" ? "" : Number(e.target.value) })}
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm block mb-1.5 font-semibold text-on-surface">Cancel Window (mins) *</label>
            <Input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 5"
              value={form.cancellationWindowMinutes}
              onChange={(e) => setForm({ ...form, cancellationWindowMinutes: e.target.value === "" ? "" : Number(e.target.value) })}
              required
              className="rounded-xl"
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={form.isOpen}
            onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
          />
          <span>Restaurant is currently open (manual override)</span>
        </label>

        <div className="pt-2">
          <Button type="submit" className="w-full sm:w-auto text-black font-bold px-6 cursor-pointer" disabled={updateSettings.isPending || isImageUploading}>
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
