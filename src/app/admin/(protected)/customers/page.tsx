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
        <h1 className="text-headline-lg font-headline-lg">Customers</h1>
        <p className="text-secondary mt-1">Everyone who has ordered from Bites.</p>
      </div>

      {/* Customer list; each row toggles an inline address panel via CustomerRow */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
        ) : customers && customers.length === 0 ? (
          <p className="text-center text-secondary py-16">No customers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-secondary border-b border-outline-variant/30">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4" />
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
  // Passing null when collapsed skips the address fetch until the row is opened.
  const { data: addresses, isLoading } = useCustomerAddresses(isExpanded ? customer.id : null);

  return (
    <>
      <tr className="border-b border-outline-variant/10 cursor-pointer hover:bg-surface-variant/30" onClick={onToggle}>
        <td className="py-3 px-4">{customer.name}</td>
        <td className="py-3 px-4">{customer.phone}</td>
        <td className="py-3 px-4">{customer.email ?? "—"}</td>
        <td className="py-3 px-4 text-right">
          {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>
      {/* Expanded panel showing the customer's saved addresses */}
      {isExpanded && (
        <tr className="bg-surface-container-low">
          <td colSpan={4} className="px-4 py-4">
            {isLoading ? (
              <Spinner className="w-5 h-5" />
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start gap-2 text-xs text-secondary">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      {addr.label ? `${addr.label}: ` : ""}
                      {addr.fullAddress}
                      {addr.landmark ? ` (${addr.landmark})` : ""} — {addr.deliveryAreaName}
                      {addr.isDefault ? " · Default" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary">No saved addresses.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
