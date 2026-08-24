"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { useRestaurantSettings, useUpdateRestaurantSettings } from "@/features/admin/settings/hooks/use-admin-settings";
import type { RestaurantSettingsPayload } from "@/features/admin/settings/api/admin-settings.api";

// minOrderAmount is widened to allow "" here so the box can be genuinely
// empty while editing — RestaurantSettingsPayload itself always needs a
// real number, converted back at submit time.
type SettingsFormState = Omit<RestaurantSettingsPayload, "minOrderAmount"> & { minOrderAmount: number | "" };

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
};

// Every half-hour slot in a day, e.g. "00:00", "00:30", ... "23:30" — used to
// populate the opening/closing time pickers instead of the native time input.
const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
});

// Renders "09:00" as "9:00 AM" for a friendlier dropdown label.
function formatTimeLabel(time: string): string {
  const [hoursStr, minutes] = time.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${period}`;
}

// Admin page for editing restaurant profile info, operating hours, and minimum order amount.
export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useRestaurantSettings();
  const updateSettings = useUpdateRestaurantSettings();
  const [form, setForm] = useState<SettingsFormState>(EMPTY_FORM);
  // True while the logo field's upload is in flight — blocks Save so the
  // form can't submit before the hosted URL is actually ready.
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Populate the form once the real settings load — can't build the form
  // from data that hasn't arrived yet.
  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name,
        description: settings.description ?? "",
        logoUrl: settings.logoUrl ?? "",
        email: settings.email ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
        isOpen: settings.isOpen,
        minOrderAmount: settings.minOrderAmount,
      });
    }
  }, [settings]);

  // Saves the whole settings form as-is.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSettings.mutate({ ...form, minOrderAmount: form.minOrderAmount === "" ? 0 : form.minOrderAmount });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <span className="text-primary font-label-md text-xs tracking-widest uppercase block mb-1">CONFIGURATION</span>
        <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface">Restaurant Settings</h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">Basic info shown to customers, plus operating hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
        <div>
          <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Restaurant Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" />
        </div>
        <div>
          <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Description</label>
          <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
        </div>
        <div>
          <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Restaurant Logo</label>
          <ImageUploadField
            value={form.logoUrl ?? ""}
            onChange={(url) => setForm({ ...form, logoUrl: url })}
            onUploadingChange={setIsImageUploading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Contact Email</label>
            <Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Contact Phone</label>
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
          <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Address</label>
          <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Opening Time</label>
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
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Closing Time</label>
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

        <div>
          <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Minimum Order Amount</label>
          <Input
            type="number"
            step="0.01"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value === "" ? "" : Number(e.target.value) })}
            required
            className="rounded-xl"
          />
        </div>

        <label className="flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer pt-1">
          <input type="checkbox" className="w-4 h-4 accent-primary rounded" checked={form.isOpen} onChange={(e) => setForm({ ...form, isOpen: e.target.checked })} />
          Restaurant is currently open (manual override)
        </label>

        <div className="pt-2">
          <Button type="submit" className="w-full sm:w-auto text-black font-semibold px-6" disabled={updateSettings.isPending || isImageUploading}>
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
