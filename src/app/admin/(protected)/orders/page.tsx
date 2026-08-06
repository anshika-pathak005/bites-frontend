"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
  // "ALL" is a sentinel meaning no status filter — Radix's Select.Item can't
  // take an empty-string value (it's reserved internally for "no selection").
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useAdminOrders({
    status: status !== "ALL" ? status : undefined,
    search: search || undefined,
    page,
    pageSize: 15,
  });
  const updateStatus = useUpdateOrderStatus();

  return (
    <div className="space-y-6">
      <div>
        <span className="text-primary font-label-md text-xs tracking-widest uppercase block mb-1">ORDER MANAGEMENT</span>
        <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface">Orders</h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">Review, accept, and track every order.</p>
      </div>

      {/* Search and status filter controls; changing either resets to page 0 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-grow max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Search by order # or phone"
            className="pl-9 text-xs sm:text-sm py-2 rounded-xl"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as OrderStatus | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-auto text-xs sm:text-sm rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        )}

        {isError && <p className="text-center text-secondary py-16">Could not load orders.</p>}

        {data && data.items.length === 0 && (
          <p className="text-center text-secondary py-16">No orders match these filters.</p>
        )}

        {/* Order list table with an inline status-change dropdown per row */}
        {data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-secondary bg-surface-container-low border-b border-outline-variant/30 font-semibold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((order) => {
                  const nextOptions = ORDER_STATUS_TRANSITIONS[order.status];
                  return (
                    <tr key={order.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-primary">
                        <Link href={`${ROUTES.admin.orders}/${order.id}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-on-surface">{order.customerName}</div>
                        <div className="text-xs text-secondary">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-on-surface">{formatPrice(order.grandTotal)}</td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4">
                        {nextOptions.length > 0 ? (
                          <Select
                            key={order.status}
                            disabled={updateStatus.isPending}
                            onValueChange={(value) => updateStatus.mutate({ id: order.id, status: value as OrderStatus })}
                          >
                            <SelectTrigger className="w-auto py-1 px-3 text-xs rounded-lg">
                              <SelectValue placeholder="Change status..." />
                            </SelectTrigger>
                            <SelectContent>
                              {nextOptions.map((s) => (
                                <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs text-secondary font-medium">Final</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 sm:gap-4 py-4 border-t border-outline-variant/30">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-1.5 rounded-full border border-outline-variant text-xs sm:text-sm font-semibold disabled:opacity-40 hover:bg-surface-variant transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-secondary font-medium">Page {page + 1} of {data.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={page >= data.totalPages - 1}
              className="px-4 py-1.5 rounded-full border border-outline-variant text-xs sm:text-sm font-semibold disabled:opacity-40 hover:bg-surface-variant transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
