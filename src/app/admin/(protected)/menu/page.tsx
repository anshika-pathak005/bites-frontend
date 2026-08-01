"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, cn } from "@/lib/utils";
import { useAdminMenuItems, useMenuItemMutations } from "@/features/admin/menu-management/hooks/use-admin-menu-items";
import { useAdminCategories } from "@/features/admin/category-management/hooks/use-admin-categories";
import type { MenuItem } from "@/types/menu.types";
import type { MenuItemPayload } from "@/features/admin/menu-management/api/admin-menu-items.api";

// Default values for the create form (also reused as a reset for edit -> create).
const EMPTY_FORM: MenuItemPayload = {
  categoryId: "",
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  isVeg: true,
  isAvailable: true,
  isBestSeller: false,
  isTodaysSpecial: false,
};

// Admin page for managing menu items: search, paginate, create/edit, and toggle stock.
export default function AdminMenuPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAdminMenuItems({ page, pageSize: 12, search: search || undefined });
  const { data: categories } = useAdminCategories();
  const { create, update, toggleAvailability, remove } = useMenuItemMutations();

  // null editingId means the form (if open) is in "create" mode.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MenuItemPayload>(EMPTY_FORM);

  // Opens the form blank, ready to create a brand new menu item.
  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  // Opens the form pre-filled with an existing item's values for editing.
  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      imageUrl: item.imageUrl ?? "",
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      isBestSeller: item.isBestSeller,
      isTodaysSpecial: item.isTodaysSpecial,
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
      {/* Page header with the "New Item" action */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg">Menu Management</h1>
          <p className="text-secondary mt-1">Add, edit, and manage stock for your dishes.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="w-4 h-4" /> New Item
        </Button>
      </div>

      {/* Create/edit form, only rendered while showForm is true */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4 max-w-xl">
          <h3 className="font-headline-md text-headline-md">{editingId ? "Edit Menu Item" : "New Menu Item"}</h3>

          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary focus:border-2"
          >
            <option value="">Select category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            required
          />
          <Input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} /> Veg
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> In Stock
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} /> Best Seller
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isTodaysSpecial} onChange={(e) => setForm({ ...form, isTodaysSpecial: e.target.checked })} /> Today&apos;s Special
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={create.isPending || update.isPending}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Search box; typing resets pagination back to page 0 since results change */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <Input
          placeholder="Search menu items"
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {/* Menu item list table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-secondary border-b border-outline-variant/30">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr key={item.id} className="border-b border-outline-variant/10 last:border-0">
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{formatPrice(item.price)}</td>
                  <td className="py-3 px-4">
                    {/* Clicking the badge itself toggles stock status, no separate button needed */}
                    <button
                      onClick={() => toggleAvailability.mutate({ id: item.id, available: !item.isAvailable })}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs",
                        item.isAvailable ? "bg-green-100 text-green-800" : "bg-error-container text-on-error-container"
                      )}
                    >
                      {item.isAvailable ? "In Stock" : "Out of Stock"}
                    </button>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-surface-variant" aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove.mutate(item.id)}
                      className="p-2 rounded-lg hover:bg-surface-variant text-error"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination controls, only shown when there's more than one page */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t border-outline-variant/30">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-1.5 rounded-full border border-outline text-sm disabled:opacity-40">Previous</button>
            <span className="text-sm text-secondary">Page {page + 1} of {data.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={page >= data.totalPages - 1} className="px-4 py-1.5 rounded-full border border-outline text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
