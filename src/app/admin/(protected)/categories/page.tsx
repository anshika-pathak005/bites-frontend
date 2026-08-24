"use client";

import { useState } from "react";
import { Plus, Pencil, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { useAdminCategories, useCategoryMutations } from "@/features/admin/category-management/hooks/use-admin-categories";
import type { Category } from "@/types/menu.types";
import type { CategoryPayload } from "@/features/admin/category-management/api/admin-categories.api";

// displayOrder is widened to allow "" here so the box can be genuinely empty
// while typing/creating — CategoryPayload itself always needs a real number,
// converted back at submit time.
type CategoryFormState = Omit<CategoryPayload, "displayOrder"> & { displayOrder: number | "" };

// Default values for the create form (also reused as a reset for edit -> create).
const EMPTY_FORM: CategoryFormState = { name: "", description: "", imageUrl: "", displayOrder: "", isActive: true };

// Admin page for creating, editing, and deactivating menu categories.
export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const { create, update, remove } = useCategoryMutations();

  // null editingId means the form (if open) is in "create" mode.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  // Category pending a deactivate confirmation; null means the dialog is closed.
  const [deactivateTarget, setDeactivateTarget] = useState<Category | null>(null);
  // True while the image field's upload is in flight — blocks Save so the
  // form can't submit before the hosted URL is actually ready.
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Opens the form blank, ready to create a brand new category.
  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  // Opens the form pre-filled with an existing category's values for editing.
  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setShowForm(true);
  }

  // Routes the form submission to create or update depending on editingId, then closes the form.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CategoryPayload = { ...form, displayOrder: form.displayOrder === "" ? 0 : form.displayOrder };
    if (editingId) {
      update.mutate({ id: editingId, payload }, { onSuccess: () => setShowForm(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header with the "New Category" action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-primary font-label-md text-xs tracking-widest uppercase block mb-1">CATEGORIES</span>
          <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface">Categories</h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">Organize your menu into categories.</p>
        </div>
        <Button onClick={startCreate} className="w-full sm:w-auto text-white font-semibold shadow-sm rounded-xl py-2.5 px-5 shrink-0">
          <Plus className="w-4 h-4 mr-1.5 shrink-0" /> New Category
        </Button>
      </div>

      {/* Create/edit form, shown as a popup */}
      <Modal open={showForm} title={editingId ? "Edit Category" : "New Category"} onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" />
          </div>
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Category Image</label>
            <ImageUploadField
              value={form.imageUrl ?? ""}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              onUploadingChange={setIsImageUploading}
            />
          </div>
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Display Order</label>
            <Input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: e.target.value === "" ? "" : Number(e.target.value) })}
              className="rounded-xl"
            />
          </div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary rounded" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="sticky bottom-0 bg-surface-container-lowest/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 border-t border-outline-variant/30 mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
            <Button type="button" variant="outline" className="w-full sm:w-auto font-semibold" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto text-white font-semibold px-6" disabled={create.isPending || update.isPending || isImageUploading}>
              {create.isPending || update.isPending ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category list table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-secondary bg-surface-container-low border-b border-outline-variant/30 font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((category) => (
                  <tr key={category.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-on-surface">{category.name}</td>
                    <td className="py-3 px-4 text-secondary font-medium">{category.displayOrder}</td>
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm",
                          category.isActive
                            ? "bg-emerald-950/70 text-emerald-400 border-emerald-500/40"
                            : "bg-red-950/70 text-red-400 border-red-500/40"
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", category.isActive ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-red-400")} />
                        <span>{category.isActive ? "Active" : "Inactive"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(category)} className="p-2 rounded-lg hover:bg-surface-variant text-on-surface transition-colors" aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {category.isActive && (
                          <button
                            onClick={() => setDeactivateTarget(category)}
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
        title="Deactivate category?"
        message={`"${deactivateTarget?.name}" will be hidden from customers until it's reactivated.`}
        confirmLabel="Deactivate"
        confirmVariant="primary"
        isLoading={remove.isPending}
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={() => deactivateTarget && remove.mutate(deactivateTarget.id, { onSuccess: () => setDeactivateTarget(null) })}
      />
    </div>
  );
}
