"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { formatPrice } from "@/lib/utils";
import { useAdminOrders, useUpdateOrderStatus } from "@/features/admin/orders/hooks/use-admin-orders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from "@/constants/order-status";
import { ROUTES } from "@/constants/routes";
import type { OrderStatus } from "@/types/order.types";

// Used to populate the status filter dropdown with every possible order state.
const ALL_STATUSES: OrderStatus[] = ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

// Admin page listing all orders with search, status filter, pagination, and inline status updates.
export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useAdminOrders({
    status: status || undefined,
    search: search || undefined,
    page,
    pageSize: 15,
  });
  const updateStatus = useUpdateOrderStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg font-headline-lg">Orders</h1>
        <p className="text-secondary mt-1">Review, accept, and track every order.</p>
      </div>

      {/* Search and status filter controls; changing either resets to page 0 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-grow max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Search by order # or phone"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "");
            setPage(0);
          }}
          className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary focus:border-2"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner className="w-8 h-8" />
          </div>
        )}

        {isError && <p className="text-center text-secondary py-16">Could not load orders.</p>}

        {data && data.items.length === 0 && (
          <p className="text-center text-secondary py-16">No orders match these filters.</p>
        )}

        {/* Order list table with an inline status-change dropdown per row */}
        {data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-secondary border-b border-outline-variant/30">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((order) => {
                  // Allowed next statuses for this order — mirrors the server-enforced
                  // state machine (PENDING -> ACCEPTED -> PREPARING -> OUT_FOR_DELIVERY ->
                  // DELIVERED, with PENDING/ACCEPTED able to go to CANCELLED).
                  const nextOptions = ORDER_STATUS_TRANSITIONS[order.status];
                  return (
                    <tr key={order.id} className="border-b border-outline-variant/10 last:border-0">
                      <td className="py-3 px-4 font-label-md">
                        <Link href={`${ROUTES.admin.orders}/${order.id}`} className="hover:text-primary">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div>{order.customerName}</div>
                        <div className="text-xs text-secondary">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">{formatPrice(order.grandTotal)}</td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4">
                        {/* Dropdown only lists statuses reachable from the current one; terminal orders show "Final" instead */}
                        {nextOptions.length > 0 ? (
                          <select
                            defaultValue=""
                            disabled={updateStatus.isPending}
                            onChange={(e) => {
                              if (e.target.value) {
                                updateStatus.mutate({ id: order.id, status: e.target.value as OrderStatus });
                              }
                            }}
                            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1.5 text-xs outline-none"
                          >
                            <option value="">Change status...</option>
                            {nextOptions.map((s) => (
                              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-secondary">Final</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls, only shown when there's more than one page */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t border-outline-variant/30">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-1.5 rounded-full border border-outline text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-secondary">Page {page + 1} of {data.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={page >= data.totalPages - 1}
              className="px-4 py-1.5 rounded-full border border-outline text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
