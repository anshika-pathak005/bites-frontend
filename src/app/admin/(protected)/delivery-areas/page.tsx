"use client";

import { useState } from "react";
import { Plus, Pencil, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { formatPrice } from "@/lib/utils";
import {
  useAdminDeliveryAreas,
  useDeliveryAreaMutations,
} from "@/features/admin/delivery-areas/hooks/use-admin-delivery-areas";
import type { DeliveryArea } from "@/types/admin.types";
import type { DeliveryAreaPayload } from "@/features/admin/delivery-areas/api/admin-delivery-areas.api";

// deliveryCharge is widened to allow "" here so the box can be genuinely
// empty while typing/creating — DeliveryAreaPayload itself always needs a
// real number, converted back at submit time.
type DeliveryAreaFormState = Omit<DeliveryAreaPayload, "deliveryCharge"> & { deliveryCharge: number | "" };

// Default values for the create form (also reused as a reset for edit -> create).
const EMPTY_FORM: DeliveryAreaFormState = { name: "", deliveryCharge: "", isActive: true };

// Admin page for creating, editing, and deactivating serviceable delivery areas.
export default function AdminDeliveryAreasPage() {
  const { data: areas, isLoading } = useAdminDeliveryAreas();
  const { create, update, remove } = useDeliveryAreaMutations();

  // null editingId means the form (if open) is in "create" mode.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DeliveryAreaFormState>(EMPTY_FORM);
  // Area pending a deactivate confirmation; null means the dialog is closed.
  const [deactivateTarget, setDeactivateTarget] = useState<DeliveryArea | null>(null);

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
    const payload: DeliveryAreaPayload = { ...form, deliveryCharge: form.deliveryCharge === "" ? 0 : form.deliveryCharge };
    if (editingId) {
      update.mutate({ id: editingId, payload }, { onSuccess: () => setShowForm(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header with the "New Area" action */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-primary font-label-md text-xs tracking-widest uppercase block mb-1">DELIVERY REGIONS</span>
          <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface">Delivery Areas</h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">Control where you deliver and how much it costs.</p>
        </div>
        <Button onClick={startCreate} className="text-white font-semibold">
          <Plus className="w-4 h-4 mr-1.5" /> New Area
        </Button>
      </div>

      {/* Create/edit form, shown as a popup */}
      <Modal open={showForm} title={editingId ? "Edit Delivery Area" : "New Delivery Area"} onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Area Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" />
          </div>
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Delivery Charge</label>
            <Input
              type="number"
              step="0.01"
              value={form.deliveryCharge}
              onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value === "" ? "" : Number(e.target.value) })}
              required
              className="rounded-xl"
            />
          </div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary rounded" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active (serviceable)
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" className="text-white font-semibold" disabled={create.isPending || update.isPending}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delivery area list table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-secondary bg-surface-container-low border-b border-outline-variant/30 font-semibold">
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Delivery Charge</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {areas?.map((area) => (
                  <tr key={area.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-on-surface">{area.name}</td>
                    <td className="py-3 px-4 font-medium text-on-surface">{formatPrice(area.deliveryCharge)}</td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={area.isActive ? "text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full text-xs" : "text-secondary bg-surface-container-high px-2.5 py-0.5 rounded-full text-xs"}>
                        {area.isActive ? "Serviceable" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(area)} className="p-2 rounded-lg hover:bg-surface-variant text-on-surface transition-colors" aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {area.isActive && (
                          <button
                            onClick={() => setDeactivateTarget(area)}
                            className="p-2 rounded-lg hover:bg-error-container/30 text-error transition-colors"
                            aria-label="Deactivate"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate delivery area?"
        message={`"${deactivateTarget?.name}" will no longer be deliverable until it's reactivated.`}
        confirmLabel="Deactivate"
        isLoading={remove.isPending}
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={() => deactivateTarget && remove.mutate(deactivateTarget.id, { onSuccess: () => setDeactivateTarget(null) })}
      />
    </div>
  );
}
