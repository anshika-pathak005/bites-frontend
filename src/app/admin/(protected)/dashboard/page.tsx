"use client";

import Link from "next/link";
import { ShoppingBag, Clock, IndianRupee } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { formatPrice } from "@/lib/utils";
import { useDashboardSummary } from "@/features/admin/dashboard/hooks/use-dashboard-summary";
import { ROUTES } from "@/constants/routes";

// Admin landing page: today's stats plus a preview of the most recent orders.
export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-secondary">Could not load the dashboard right now.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-lg font-headline-lg">Dashboard</h1>
        <p className="text-secondary mt-1">Here&apos;s what&apos;s happening at your restaurant today.</p>
      </div>

      {/* Today's key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard icon={<ShoppingBag className="w-5 h-5" />} label="Today's Orders" value={data.todaysOrderCount} />
        <SummaryCard icon={<Clock className="w-5 h-5" />} label="Pending Orders" value={data.pendingOrderCount} />
        <SummaryCard icon={<IndianRupee className="w-5 h-5" />} label="Today's Revenue" value={formatPrice(data.todaysRevenue)} />
      </div>

      {/* Recent orders preview, linking out to the full orders list */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-headline-md font-headline-md">Recent Orders</h2>
          <Link href={ROUTES.admin.orders} className="text-primary text-sm font-label-md hover:underline">
            View all
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="text-secondary text-sm py-6 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-secondary border-b border-outline-variant/30">
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-outline-variant/10 last:border-0">
                    <td className="py-3 pr-4 font-label-md">
                      <Link href={`${ROUTES.admin.orders}/${order.id}`} className="hover:text-primary">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{order.customerName}</td>
                    <td className="py-3 pr-4">{formatPrice(order.grandTotal)}</td>
                    <td className="py-3 pr-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Small stat tile used for the top-of-dashboard metrics.
function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-secondary text-sm">{label}</p>
        <p className="text-headline-md font-headline-md">{value}</p>
      </div>
    </div>
  );
}
