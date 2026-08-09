"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { formatPrice, cn } from "@/lib/utils";
import { useAdminMenuItems, useMenuItemMutations } from "@/features/admin/menu-management/hooks/use-admin-menu-items";
import { useAdminCategories } from "@/features/admin/category-management/hooks/use-admin-categories";
import { useDebounce } from "@/hooks/use-debounce";
import type { MenuItem } from "@/types/menu.types";
import type { MenuItemPayload } from "@/features/admin/menu-management/api/admin-menu-items.api";

// price is widened to allow "" here so the box can be genuinely empty while
// typing/creating — MenuItemPayload itself always needs a real number,
// converted back at submit time.
type MenuItemFormState = Omit<MenuItemPayload, "price"> & { price: number | "" };

// Default values for the create form (also reused as a reset for edit -> create).
const EMPTY_FORM: MenuItemFormState = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
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
  const debouncedSearch = useDebounce(search, 400);

  // Reset to page 0 whenever debounced search input changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const { data, isLoading } = useAdminMenuItems({ page, pageSize: 12, search: debouncedSearch || undefined });
  const { data: categories } = useAdminCategories();
  const { create, update, toggleAvailability, remove } = useMenuItemMutations();

  // null editingId means the form (if open) is in "create" mode.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MenuItemFormState>(EMPTY_FORM);
  // Item pending a delete confirmation; null means the dialog is closed.
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  // Item pending a stock toggle confirmation (in stock <-> out of stock).
  const [stockToggleTarget, setStockToggleTarget] = useState<MenuItem | null>(null);
  // True while the image field's upload is in flight — blocks Save so the
  // form can't submit before the hosted URL is actually ready.
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Opens the form blank, ready to create a brand new menu item.
  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  // Opens the form pre-filled with an existing item's values for editing.
  function startEdit(item: MenuItem) {
    setEditingId(String(item.id));
    setForm({
      categoryId: item.categoryId ? String(item.categoryId) : "",
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
    // Radix's Select isn't a native <select>, so the browser's built-in
    // "required" validation doesn't cover it — check it manually here.
    if (!form.categoryId) return;
    const payload: MenuItemPayload = { ...form, price: form.price === "" ? 0 : form.price };
    if (editingId) {
      update.mutate({ id: editingId, payload }, { onSuccess: () => setShowForm(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header with the "New Item" action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-primary font-label-md text-xs tracking-widest uppercase block mb-1">MENU MANAGEMENT</span>
          <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface">Menu Management</h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">Add, edit, and manage stock for your dishes.</p>
        </div>
        <Button onClick={startCreate} className="w-full sm:w-auto text-white font-semibold shadow-sm rounded-xl py-2.5 px-5 shrink-0">
          <Plus className="w-4 h-4 mr-1.5 shrink-0" /> New Item
        </Button>
      </div>

      {/* Create/edit form, shown as a popup */}
      <Modal open={showForm} title={editingId ? "Edit Menu Item" : "New Menu Item"} onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Category</label>
            <Select
              value={form.categoryId ? String(form.categoryId) : undefined}
              onValueChange={(value) => setForm({ ...form, categoryId: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" />
          </div>
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Price</label>
            <Input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value === "" ? "" : Number(e.target.value) })}
              required
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Item Image</label>
            <ImageUploadField
              value={form.imageUrl ?? ""}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              onUploadingChange={setIsImageUploading}
            />
          </div>

          <div className="flex flex-wrap gap-4 text-xs sm:text-sm pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} /> Veg
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> In Stock
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} /> Best Seller
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded" checked={form.isTodaysSpecial} onChange={(e) => setForm({ ...form, isTodaysSpecial: e.target.checked })} /> Today&apos;s Special
            </label>
          </div>

          <div className="sticky bottom-0 bg-surface-container-lowest/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 border-t border-outline-variant/30 mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
            <Button type="button" variant="outline" className="w-full sm:w-auto font-semibold" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto text-white font-semibold px-6" disabled={create.isPending || update.isPending || isImageUploading}>
              {create.isPending || update.isPending ? "Saving..." : "Save Item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Search box */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <Input
          placeholder="Search menu items"
          className="pl-9 text-xs sm:text-sm py-2 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Menu item list table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-secondary bg-surface-container-low border-b border-outline-variant/30 font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((item) => (
                  <tr key={item.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-on-surface">{item.name}</td>
                    <td className="py-3 px-4 font-medium text-on-surface whitespace-nowrap">{formatPrice(item.price)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setStockToggleTarget(item)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all active:scale-95 border",
                          item.isAvailable
                            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200/80"
                            : "bg-error-container text-on-error-container border-error/20 hover:bg-error-container/80"
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.isAvailable ? "bg-green-600" : "bg-error")} />
                        <span>{item.isAvailable ? "In Stock" : "Out of Stock"}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-surface-variant text-on-surface transition-colors" aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 rounded-lg hover:bg-error-container/30 text-error transition-colors"
                          aria-label="Delete"
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

        {/* Pagination controls */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 sm:gap-4 py-4 border-t border-outline-variant/30">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-1.5 rounded-full border border-outline-variant text-xs sm:text-sm font-semibold disabled:opacity-40 hover:bg-surface-variant transition-colors cursor-pointer">Previous</button>
            <span className="text-xs sm:text-sm text-secondary font-medium">Page {page + 1} of {data.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={page >= data.totalPages - 1} className="px-4 py-1.5 rounded-full border border-outline-variant text-xs sm:text-sm font-semibold disabled:opacity-40 hover:bg-surface-variant transition-colors cursor-pointer">Next</button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Toggling Stock Availability */}
      <ConfirmDialog
        open={!!stockToggleTarget}
        title={stockToggleTarget?.isAvailable ? "Mark as Out of Stock?" : "Mark as In Stock?"}
        message={
          stockToggleTarget?.isAvailable
            ? `Are you sure you want to mark "${stockToggleTarget?.name}" as Out of Stock? Customers will not be able to order this dish until it is back in stock.`
            : `Are you sure you want to mark "${stockToggleTarget?.name}" as In Stock? It will immediately become available for customers to order.`
        }
        confirmLabel={stockToggleTarget?.isAvailable ? "Mark Out of Stock" : "Mark In Stock"}
        confirmVariant={stockToggleTarget?.isAvailable ? "destructive" : "primary"}
        isLoading={toggleAvailability.isPending}
        onCancel={() => setStockToggleTarget(null)}
        onConfirm={() => {
          if (stockToggleTarget) {
            toggleAvailability.mutate(
              { id: stockToggleTarget.id, available: !stockToggleTarget.isAvailable },
              {
                onSettled: () => setStockToggleTarget(null),
              }
            );
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete menu item?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
}
