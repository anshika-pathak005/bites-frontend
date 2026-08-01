"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRestaurantSettings, useUpdateRestaurantSettings } from "@/features/admin/settings/hooks/use-admin-settings";
import type { RestaurantSettingsPayload } from "@/features/admin/settings/api/admin-settings.api";

// Fallback shape for the form before real settings have loaded.
const EMPTY_FORM: RestaurantSettingsPayload = {
  name: "",
  description: "",
  logoUrl: "",
  email: "",
  phone: "",
  address: "",
  openingTime: "09:00",
  closingTime: "23:00",
  isOpen: true,
  minOrderAmount: 0,
};

// Admin page for editing restaurant profile info, operating hours, and minimum order amount.
export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useRestaurantSettings();
  const updateSettings = useUpdateRestaurantSettings();
  const [form, setForm] = useState<RestaurantSettingsPayload>(EMPTY_FORM);

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
    updateSettings.mutate(form);
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
        <h1 className="text-headline-lg font-headline-lg">Restaurant Settings</h1>
        <p className="text-secondary mt-1">Basic info shown to customers, plus operating hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="font-label-md text-label-sm block mb-2">Restaurant Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="font-label-md text-label-sm block mb-2">Description</label>
          <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="font-label-md text-label-sm block mb-2">Logo URL</label>
          <Input value={form.logoUrl ?? ""} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-label-md text-label-sm block mb-2">Contact Email</label>
            <Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="font-label-md text-label-sm block mb-2">Contact Phone</label>
            <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="font-label-md text-label-sm block mb-2">Address</label>
          <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-label-md text-label-sm block mb-2">Opening Time</label>
            <Input type="time" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} required />
          </div>
          <div>
            <label className="font-label-md text-label-sm block mb-2">Closing Time</label>
            <Input type="time" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} required />
          </div>
        </div>

        <div>
          <label className="font-label-md text-label-sm block mb-2">Minimum Order Amount</label>
          <Input
            type="number"
            step="0.01"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
            required
          />
        </div>

        {/* Manual override lets the admin force closed/open regardless of the opening/closing time window */}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isOpen} onChange={(e) => setForm({ ...form, isOpen: e.target.checked })} />
          Restaurant is currently open (manual override)
        </label>

        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
