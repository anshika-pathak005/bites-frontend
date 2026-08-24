"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, BadgePercent, Navigation, Truck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { formatPrice, cn } from "@/lib/utils";
import {
  useAdminDeliverySlabs,
  useDeliverySlabMutations,
} from "@/features/admin/delivery-slabs/hooks/use-admin-delivery-slabs";
import type {
  DeliveryChargeSlab,
  DeliveryChargeSlabPayload,
} from "@/features/admin/delivery-slabs/api/admin-delivery-slabs.api";

type FormState = {
  minDistanceKm: number | "";
  maxDistanceKm: number | "";
  charge: number | "";
  isActive: boolean;
};

const DEFAULT_FORM: FormState = {
  minDistanceKm: "",
  maxDistanceKm: "",
  charge: "",
  isActive: true,
};

export default function DeliverySlabsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingSlab, setEditingSlab] = useState<DeliveryChargeSlab | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryChargeSlab | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: slabs = [], isLoading } = useAdminDeliverySlabs();
  const { createSlab, updateSlab, deleteSlab } = useDeliverySlabMutations();

  function openCreateForm() {
    setEditingSlab(null);
    setForm(DEFAULT_FORM);
    setErrorMsg(null);
    setShowForm(true);
  }

  function startEdit(slab: DeliveryChargeSlab) {
    setEditingSlab(slab);
    setForm({
      minDistanceKm: slab.minDistanceKm,
      maxDistanceKm: slab.maxDistanceKm,
      charge: slab.charge,
      isActive: slab.isActive,
    });
    setErrorMsg(null);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const minKm = typeof form.minDistanceKm === "number" ? form.minDistanceKm : parseFloat(form.minDistanceKm as string);
    const maxKm = typeof form.maxDistanceKm === "number" ? form.maxDistanceKm : parseFloat(form.maxDistanceKm as string);
    const fee = typeof form.charge === "number" ? form.charge : parseFloat(form.charge as string);

    if (isNaN(minKm) || minKm < 0) {
      setErrorMsg("Min distance must be 0 or greater.");
      return;
    }
    if (isNaN(maxKm) || maxKm <= minKm) {
      setErrorMsg("Max distance must be greater than Min distance.");
      return;
    }
    if (isNaN(fee) || fee < 0) {
      setErrorMsg("Delivery charge must be 0 or greater.");
      return;
    }

    const payload: DeliveryChargeSlabPayload = {
      minDistanceKm: minKm,
      maxDistanceKm: maxKm,
      charge: fee,
      isActive: form.isActive,
    };

    if (editingSlab) {
      updateSlab.mutate(
        { id: editingSlab.id, payload },
        {
          onSuccess: () => {
            setShowForm(false);
          },
          onError: (err) => {
            setErrorMsg(err instanceof Error ? err.message : "Failed to update slab");
          },
        }
      );
    } else {
      createSlab.mutate(payload, {
        onSuccess: () => {
          setShowForm(false);
        },
        onError: (err) => {
          setErrorMsg(err instanceof Error ? err.message : "Failed to create slab");
        },
      });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteSlab.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  const activeSlabsCount = slabs.filter((s) => s.isActive).length;
  const maxRadiusKm = slabs.length > 0 ? Math.max(...slabs.map((s) => s.maxDistanceKm)) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <BadgePercent className="w-4 h-4" />
            Pricing Tiers & Distance Slabs
          </span>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Delivery Pricing Slabs
          </h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Configure distance-based delivery fee tiers for customer order calculation.
          </p>
        </div>

        <Button
          onClick={openCreateForm}
          className="text-black font-bold gap-2 rounded-xl py-2.5 px-5 glow-hover cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pricing Slab</span>
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-primary" />
            Total Distance Tiers
          </span>
          <p className="text-2xl font-bold text-on-surface">{slabs.length}</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Active Service Tiers
          </span>
          <p className="text-2xl font-bold text-emerald-400">{activeSlabsCount}</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-primary" />
            Max Coverage Radius
          </span>
          <p className="text-2xl font-bold text-primary">{maxRadiusKm} km</p>
        </div>
      </div>

      {/* Slabs Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : slabs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center p-6">
            <BadgePercent className="w-10 h-10 text-secondary/40" />
            <div>
              <h3 className="font-bold text-base text-on-surface">No Pricing Slabs Created</h3>
              <p className="text-xs text-secondary mt-1">
                Click &ldquo;Add Pricing Slab&rdquo; above to create your first distance tier.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-secondary bg-surface-container-low border-b border-outline-variant/30 font-semibold">
                  <th className="py-3.5 px-4">Distance Range</th>
                  <th className="py-3.5 px-4">Delivery Fee</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slabs.map((slab) => (
                  <tr
                    key={slab.id}
                    className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {slab.minDistanceKm}
                        </span>
                        <span>
                          {slab.minDistanceKm} km &mdash; {slab.maxDistanceKm} km
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary whitespace-nowrap">
                      {slab.charge > 0 ? formatPrice(slab.charge) : "FREE"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm",
                          slab.isActive
                            ? "bg-emerald-950/70 text-emerald-400 border-emerald-500/40"
                            : "bg-red-950/70 text-red-400 border-red-500/40"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            slab.isActive ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-red-400"
                          )}
                        />
                        <span>{slab.isActive ? "Active" : "Inactive"}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(slab)}
                          className="p-2 rounded-lg hover:bg-surface-variant text-on-surface transition-colors cursor-pointer"
                          aria-label="Edit slab"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(slab)}
                          className="p-2 rounded-lg hover:bg-error-container/30 text-error transition-colors cursor-pointer"
                          aria-label="Delete slab"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal Form */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingSlab ? "Edit Delivery Pricing Slab" : "Create Delivery Pricing Slab"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">
                Min Distance (km) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 0"
                value={form.minDistanceKm}
                onChange={(e) =>
                  setForm({ ...form, minDistanceKm: e.target.value === "" ? "" : Number(e.target.value) })
                }
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">
                Max Distance (km) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 2.0"
                value={form.maxDistanceKm}
                onChange={(e) =>
                  setForm({ ...form, maxDistanceKm: e.target.value === "" ? "" : Number(e.target.value) })
                }
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">
              Delivery Charge (₹) *
            </label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 20 (set 0 for FREE delivery)"
              value={form.charge}
              onChange={(e) =>
                setForm({ ...form, charge: e.target.value === "" ? "" : Number(e.target.value) })
              }
              required
              className="rounded-xl"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span>Active Tier (serviceable for customer checkout)</span>
          </label>

          <div className="sticky bottom-0 bg-surface-container-lowest/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 border-t border-outline-variant/30 mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto font-semibold"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto text-black font-bold px-6 cursor-pointer"
              disabled={createSlab.isPending || updateSlab.isPending}
            >
              {createSlab.isPending || updateSlab.isPending ? "Saving..." : "Save Slab"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Pricing Slab?"
        message={`Are you sure you want to delete the ${deleteTarget?.minDistanceKm}km - ${deleteTarget?.maxDistanceKm}km slab (₹${deleteTarget?.charge})?`}
        confirmLabel="Delete Slab"
        confirmVariant="primary"
        isLoading={deleteSlab.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
