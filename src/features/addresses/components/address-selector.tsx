"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAddresses } from "../hooks/use-addresses";
import { AddressCard } from "./address-card";
import { AddressFormModal } from "./address-form-modal";
import type { Address } from "@/types/address.types";

interface AddressSelectorProps {
  selectedAddressId?: string;
  onSelectAddress: (address: Address) => void;
}

export function AddressSelector({
  selectedAddressId,
  onSelectAddress,
}: AddressSelectorProps) {
  const { addressesQuery, deleteMutation } = useAddresses();
  const addresses = addressesQuery.data ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  // Auto-select the default address if nothing is selected yet
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        onSelectAddress(defaultAddr);
      }
    }
  }, [addresses, selectedAddressId, onSelectAddress]);

  function handleOpenAdd() {
    setEditingAddress(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(address: Address) {
    setEditingAddress(address);
    setIsModalOpen(true);
  }

  function handleSaved(savedAddress: Address) {
    onSelectAddress(savedAddress);
  }

  if (addressesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner className="w-6 h-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h4 className="font-label-md text-xs sm:text-label-sm font-semibold text-on-surface">
            Saved Delivery Addresses
          </h4>
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
      </div>

      {addresses.length === 0 ? (
        <div className="border border-dashed border-outline-variant/60 rounded-2xl p-6 text-center bg-surface-container-lowest">
          <MapPin className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
          <p className="text-xs sm:text-sm font-medium text-on-surface">
            No saved addresses found
          </p>
          <p className="text-[11px] sm:text-xs text-secondary mt-0.5 mb-3">
            Add your delivery address using GPS location or enter manually
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-full text-xs text-white font-semibold gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Delivery Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedAddressId === address.id}
              onSelect={onSelectAddress}
              onEdit={handleOpenEdit}
              onDelete={setDeletingAddress}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <AddressFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingAddress}
        onSaved={handleSaved}
      />

      {/* Delete Address Confirmation Dialog */}
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
