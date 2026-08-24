"use client";

import { ShoppingBag, Calendar, User, Phone, Mail, Clock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { useAdminCustomers } from "@/features/admin/customers/hooks/use-admin-customers";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

// Admin page listing registered customers with spending, order count, joinedAt, and lastOrderAt.
export default function AdminCustomersPage() {
  const { data: customers = [], isLoading } = useAdminCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-1">
            CLIENTELE & ANALYTICS
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Customers</h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Overview of registered customers, total spending, order frequency, joined date, and last order date.
          </p>
        </div>
        <div className="bg-surface-container border border-outline-variant/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-secondary self-start sm:self-auto">
          Total Customers: <strong className="text-on-surface">{customers.length}</strong>
        </div>
      </div>

      {/* Customer list table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center p-6">
            <User className="w-8 h-8 text-secondary/40" />
            <p className="text-secondary text-sm">No customers registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-secondary bg-surface-container-low border-b border-outline-variant/30 font-semibold">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Joined At</th>
                  <th className="py-3.5 px-4">Last Order At</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : "U";

                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-outline-variant/10 hover:bg-surface-container-low/60 transition-colors"
                    >
                      {/* Customer Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-on-surface block text-xs sm:text-sm truncate">
                              {customer.name}
                            </span>
                            {customer.email && (
                              <span className="text-[11px] text-secondary flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 text-secondary/60 shrink-0" />
                                {customer.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-secondary font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-secondary/60" />
                          {customer.phone}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container text-on-surface border border-outline-variant/30">
                          <ShoppingBag className="w-3 h-3 text-primary" />
                          {customer.ordersCount ?? 0} {customer.ordersCount === 1 ? "order" : "orders"}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-bold text-primary whitespace-nowrap">
                        {formatPrice(customer.totalSpent ?? 0)}
                      </td>

                      {/* Joined At */}
                      <td className="py-3.5 px-4 text-secondary font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-secondary/60" />
                          {formatDate(customer.joinedAt)}
                        </span>
                      </td>

                      {/* Last Order At */}
                      <td className="py-3.5 px-4 text-secondary font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-secondary/60" />
                          {formatDateTime(customer.lastOrderAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
