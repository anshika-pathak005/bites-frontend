"use client";

import { useState } from "react";
import { Plus, Pencil, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAdminCategories, useCategoryMutations } from "@/features/admin/category-management/hooks/use-admin-categories";
import type { Category } from "@/types/menu.types";
import type { CategoryPayload } from "@/features/admin/category-management/api/admin-categories.api";

// Default values for the create form (also reused as a reset for edit -> create).
const EMPTY_FORM: CategoryPayload = { name: "", description: "", imageUrl: "", displayOrder: 0, isActive: true };

// Admin page for creating, editing, and deactivating menu categories.
export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const { create, update, remove } = useCategoryMutations();

  // null editingId means the form (if open) is in "create" mode.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CategoryPayload>(EMPTY_FORM);

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
    if (editingId) {
      update.mutate({ id: editingId, payload: form }, { onSuccess: () => setShowForm(false) });
    } else {
      create.mutate(form, { onSuccess: () => setShowForm(false) });
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header with the "New Category" action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-headline-lg font-headline-lg">Categories</h1>
          <p className="text-secondary mt-1">Organize your menu into categories.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      {/* Create/edit form, only rendered while showForm is true */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4 max-w-lg">
          <h3 className="font-headline-md text-headline-md">{editingId ? "Edit Category" : "New Category"}</h3>
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <Input
            type="number"
            placeholder="Display order"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={create.isPending || update.isPending}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Category list table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
        ) : (
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
                        onClick={() => remove.mutate(category.id)}
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
