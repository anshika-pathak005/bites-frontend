"use client";

import { useState } from "react";
import { Plus, Pencil, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import {
  useAdminDeliveryAreas,
  useDeliveryAreaMutations,
} from "@/features/admin/delivery-areas/hooks/use-admin-delivery-areas";
import type { DeliveryArea } from "@/types/admin.types";
import type { DeliveryAreaPayload } from "@/features/admin/delivery-areas/api/admin-delivery-areas.api";

// Default values for the create form (also reused as a reset for edit -> create).
const EMPTY_FORM: DeliveryAreaPayload = { name: "", deliveryCharge: 0, isActive: true };

// Admin page for creating, editing, and deactivating serviceable delivery areas.
export default function AdminDeliveryAreasPage() {
  const { data: areas, isLoading } = useAdminDeliveryAreas();
  const { create, update, remove } = useDeliveryAreaMutations();

  // null editingId means the form (if open) is in "create" mode.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DeliveryAreaPayload>(EMPTY_FORM);

  // Opens the form blank, ready to create a brand new delivery area.
  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  // Opens the form pre-filled with an existing area's values for editing.
  function startEdit(area: DeliveryArea) {
    setEditingId(area.id);
    setForm({ name: area.name, deliveryCharge: area.deliveryCharge, isActive: area.isActive });
    setShowForm(true);
  }

  // Routes the form submission to create or update depending on editingId, then closes the form.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      update.mutate({ id: editingId, payload: form }, { onSuccess: () => setShowForm(false) });
    } else {
      create.mutate(form, { onSuccess: () => setShowForm(false) });
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header with the "New Area" action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-headline-lg font-headline-lg">Delivery Areas</h1>
          <p className="text-secondary mt-1">Control where you deliver and how much it costs.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="w-4 h-4" /> New Area
        </Button>
      </div>

      {/* Create/edit form, only rendered while showForm is true */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4 max-w-lg">
          <h3 className="font-headline-md text-headline-md">{editingId ? "Edit Delivery Area" : "New Delivery Area"}</h3>
          <Input placeholder="Area name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input
            type="number"
            step="0.01"
            placeholder="Delivery charge"
            value={form.deliveryCharge}
            onChange={(e) => setForm({ ...form, deliveryCharge: Number(e.target.value) })}
            required
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active (serviceable)
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={create.isPending || update.isPending}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Delivery area list table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-secondary border-b border-outline-variant/30">
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Delivery Charge</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas?.map((area) => (
                <tr key={area.id} className="border-b border-outline-variant/10 last:border-0">
                  <td className="py-3 px-4">{area.name}</td>
                  <td className="py-3 px-4">{formatPrice(area.deliveryCharge)}</td>
                  <td className="py-3 px-4">
                    <span className={area.isActive ? "text-green-700" : "text-secondary"}>
                      {area.isActive ? "Serviceable" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => startEdit(area)} className="p-2 rounded-lg hover:bg-surface-variant" aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Only active areas can be deactivated; there's no delete/reactivate action here */}
                    {area.isActive && (
                      <button
                        onClick={() => remove.mutate(area.id)}
                        className="p-2 rounded-lg hover:bg-surface-variant text-error"
                        aria-label="Deactivate"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
