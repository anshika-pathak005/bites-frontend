"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAdminCustomers, useCustomerAddresses } from "@/features/admin/customers/hooks/use-admin-customers";

// Admin page listing every customer, with expandable rows for saved addresses.
export default function AdminCustomersPage() {
  const { data: customers, isLoading } = useAdminCustomers();
  // Tracks which single row is expanded; only one customer's addresses show at a time.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-primary font-label-md text-xs tracking-widest uppercase block mb-1">CLIENTELE</span>
        <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface">Customers</h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">Everyone who has ordered from Bites.</p>
      </div>

      {/* Customer list; each row toggles an inline address panel via CustomerRow */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-primary" /></div>
        ) : customers && customers.length === 0 ? (
          <p className="text-center text-secondary py-16">No customers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-secondary bg-surface-container-low border-b border-outline-variant/30 font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Addresses</th>
                </tr>
              </thead>
              <tbody>
                {customers?.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    isExpanded={expandedId === customer.id}
                    onToggle={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Single expandable customer row; fetches addresses lazily only once expanded.
function CustomerRow({
  customer,
  isExpanded,
  onToggle,
}: {
  customer: { id: string; name: string; phone: string; email: string | null };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { data: addresses, isLoading } = useCustomerAddresses(isExpanded ? customer.id : null);

  return (
    <>
      <tr className="border-b border-outline-variant/10 cursor-pointer hover:bg-surface-container-low/60 transition-colors" onClick={onToggle}>
        <td className="py-3 px-4 font-semibold text-on-surface">{customer.name}</td>
        <td className="py-3 px-4 text-secondary font-medium">{customer.phone}</td>
        <td className="py-3 px-4 text-secondary">{customer.email ?? "—"}</td>
        <td className="py-3 px-4 text-right text-on-surface-variant">
          {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>
      {/* Expanded panel showing the customer's saved addresses */}
      {isExpanded && (
        <tr className="bg-surface-container-low/40 border-b border-outline-variant/30">
          <td colSpan={4} className="px-4 py-3 sm:py-4">
            {isLoading ? (
              <Spinner className="w-4 h-4 text-primary" />
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start gap-2 text-xs text-secondary">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                    <span>
                      {addr.label ? <strong className="text-on-surface">{addr.label}: </strong> : ""}
                      {addr.fullAddress}
                      {addr.landmark ? ` (${addr.landmark})` : ""} — {addr.deliveryAreaName}
                      {addr.isDefault ? " · (Default)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary italic">No saved addresses.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
