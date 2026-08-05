"use client";

import { useState } from "react";
import { Plus, Pencil, EyeOff } from "lucide-react";
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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-headline-md md:text-headline-lg font-headline-lg">Categories</h1>
          <p className="text-secondary mt-1">Organize your menu into categories.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      {/* Create/edit form, shown as a popup */}
      <Modal open={showForm} title={editingId ? "Edit Category" : "New Category"} onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-md text-label-sm block mb-2">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="font-label-md text-label-sm block mb-2">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="font-label-md text-label-sm block mb-2">Category Image</label>
            <ImageUploadField
              value={form.imageUrl ?? ""}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              onUploadingChange={setIsImageUploading}
            />
          </div>
          <div>
            <label className="font-label-md text-label-sm block mb-2">Display Order</label>
            <Input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: e.target.value === "" ? "" : Number(e.target.value) })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={create.isPending || update.isPending || isImageUploading}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Category list table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-secondary border-b border-outline-variant/30">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((category) => (
                <tr key={category.id} className="border-b border-outline-variant/10 last:border-0">
                  <td className="py-3 px-4">{category.name}</td>
                  <td className="py-3 px-4">{category.displayOrder}</td>
                  <td className="py-3 px-4">
                    <span className={category.isActive ? "text-green-700" : "text-secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => startEdit(category)} className="p-2 rounded-lg hover:bg-surface-variant" aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Only active categories can be deactivated; there's no delete/reactivate action here */}
                    {category.isActive && (
                      <button
                        onClick={() => setDeactivateTarget(category)}
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
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate category?"
        message={`"${deactivateTarget?.name}" will be hidden from customers until it's reactivated.`}
        confirmLabel="Deactivate"
        isLoading={remove.isPending}
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={() => deactivateTarget && remove.mutate(deactivateTarget.id, { onSuccess: () => setDeactivateTarget(null) })}
      />
    </div>
  );
}
