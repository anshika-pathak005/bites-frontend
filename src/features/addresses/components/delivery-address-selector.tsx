"use client";

import { useState } from "react";
import { MapPin, Phone, User, ChevronRight, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAddresses } from "../hooks/use-addresses";
import { AddressCard } from "./address-card";
import { AddressFormModal } from "./address-form-modal";
import type { Address } from "@/types/address.types";

interface DeliveryAddressSelectorProps {
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  // Pulled from the logged-in customer's own profile — never re-typed at
  // checkout, matching every saved address to the account it belongs to.
  customerName?: string;
  customerPhone?: string;
}

/*
 * Meesho/Amazon-style delivery address picker for LOGGED-IN checkout.
 * Default view is a single collapsed "Deliver to this address" card
 * showing the account's name/phone plus the selected address. Tapping
 * "Change" expands into the full list of saved addresses to pick from,
 * with "Add New Address" always available.
 *
 * Guests never see this — they still get the plain form (see AddressSelector),
 * since there's no account/profile to prefill name+phone from.
 */
export function DeliveryAddressSelector({
  selectedAddress,
  onSelectAddress,
  customerName,
  customerPhone,
}: DeliveryAddressSelectorProps) {
  const { addressesQuery, deleteMutation } = useAddresses();
  const addresses = addressesQuery.data ?? [];

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  function handleOpenAdd() {
    setEditingAddress(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(address: Address) {
    setEditingAddress(address);
    setIsModalOpen(true);
  }

  function handlePick(address: Address) {
    onSelectAddress(address);
    setIsPickerOpen(false);
  }

  function handleSaved(savedAddress: Address) {
    onSelectAddress(savedAddress);
    setIsPickerOpen(false);
  }

  if (addressesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner className="w-6 h-6 text-primary" />
      </div>
    );
  }

  // No saved addresses at all yet — skip straight to the "add" prompt,
  // nothing to pick between.
  if (addresses.length === 0) {
    return (
      <div className="border border-dashed border-outline-variant/60 rounded-2xl p-6 text-center bg-surface-container-lowest">
        <MapPin className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
        <p className="text-xs sm:text-sm font-medium text-on-surface">No saved addresses yet</p>
        <p className="text-[11px] sm:text-xs text-secondary mt-0.5 mb-3">
          Add a delivery address to continue checkout
        </p>
        <Button
          type="button"
          size="sm"
          onClick={handleOpenAdd}
          className="rounded-full text-xs text-black font-semibold gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Delivery Address
        </Button>

        <AddressFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingAddress}
          onSaved={handleSaved}
        />
      </div>
    );
  }

  // Picker expanded — every saved address as a selectable card, plus
  // "Add New Address". Forced open (ignoring isPickerOpen) whenever nothing
  // is selected yet, so checkout never silently has no address chosen.
  if (isPickerOpen || !selectedAddress) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-label-md text-xs sm:text-label-sm font-semibold text-on-surface">
            Choose a delivery address
          </h4>
          {selectedAddress && (
            <button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              className="text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedAddress?.id === address.id}
              onSelect={handlePick}
              onEdit={handleOpenEdit}
              onDelete={setDeletingAddress}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenAdd}
          className="rounded-full text-xs font-semibold gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Address
        </Button>

        <AddressFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingAddress}
          onSaved={handleSaved}
        />

        <ConfirmDialog
          open={!!deletingAddress}
          title="Delete Address?"
          message={`Are you sure you want to remove the address "${deletingAddress?.label}"?`}
          confirmLabel="Delete"
          cancelLabel="Keep"
          isLoading={deleteMutation.isPending}
          onConfirm={() => {
            if (deletingAddress) {
              deleteMutation.mutate(deletingAddress.id, {
                onSettled: () => setDeletingAddress(null),
              });
            }
          }}
          onCancel={() => setDeletingAddress(null)}
        />
      </div>
    );
  }

  // Collapsed summary — the single selected address, name + phone from the
  // account, and a "Change" link back into the picker above.
  return (
    <div className="rounded-2xl border border-primary/40 bg-primary-fixed/5 p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {selectedAddress.label}
        </span>
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          Change
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-semibold text-on-surface">
          <span className="inline-flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary/70" />
            {customerName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary/70" />
            {customerPhone}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
          {selectedAddress.fullAddress}
        </p>

        {(selectedAddress.landmark || selectedAddress.pincode) && (
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-secondary">
            {selectedAddress.landmark && <span>Near {selectedAddress.landmark}</span>}
            {selectedAddress.landmark && selectedAddress.pincode && <span>•</span>}
            {selectedAddress.pincode && <span>PIN: {selectedAddress.pincode}</span>}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-1.5 text-[11px] text-primary font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Deliver to this address
      </div>
    </div>
  );
}
