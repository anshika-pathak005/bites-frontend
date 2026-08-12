"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  MapPin,
  Users,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useAdminAuth } from "@/context/admin-auth-context";

// Static list of admin nav links, in display order, each with its own icon.
const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.admin.dashboard, icon: LayoutDashboard },
  { label: "Orders", href: ROUTES.admin.orders, icon: ShoppingBag },
  { label: "Menu", href: ROUTES.admin.menu, icon: UtensilsCrossed },
  { label: "Categories", href: ROUTES.admin.categories, icon: Tags },
  // { label: "Delivery Areas", href: ROUTES.admin.deliveryAreas, icon: MapPin },
  { label: "Customers", href: ROUTES.admin.customers, icon: Users },
  { label: "Settings", href: ROUTES.admin.settings, icon: Settings },
  { label: "Profile", href: ROUTES.admin.profile, icon: UserCircle },
];

// Nav for all /admin pages: a fixed left sidebar on desktop, a hamburger +
// slide-in drawer on small screens (both share the same content below).
export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar — hidden on desktop, where the full sidebar is always visible */}
      <div className="md:hidden h-16 flex items-center justify-between px-4 border-b border-outline-variant/30 bg-surface-container-lowest sticky top-0 z-30">
        <Link href={ROUTES.admin.dashboard} className="text-headline-md font-headline-md text-primary">
          Bites <span className="text-on-surface-variant text-sm font-body-md">Admin</span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-surface-variant transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop + slide-in drawer, only mounted while open */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-inverse-surface/60" onClick={() => setIsOpen(false)} />
          <aside className="relative w-64 h-full bg-surface-container-lowest border-l border-outline-variant/30 flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-outline-variant/30">
              <span className="text-headline-md font-headline-md text-primary">Bites Admin</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-variant transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setIsOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar — hidden on small screens, replaced by the top bar + drawer above */}
      <aside className="hidden md:flex md:w-64 shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 h-screen sticky top-0 flex-col">
        <div className="h-20 flex items-center px-6 border-b border-outline-variant/30">
          <Link href={ROUTES.admin.dashboard} className="text-headline-md font-headline-md text-primary">
            Bites <span className="text-on-surface-variant text-sm font-body-md">Admin</span>
          </Link>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}

// Nav links + account/logout footer — shared between the desktop sidebar and mobile drawer.
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  return (
    <>
      <nav className="flex-grow py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          // Highlight the link whose route prefixes the current path (so nested pages still light up).
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-colors",
                isActive ? "bg-primary text-on-primary" : "text-on-surface hover:bg-surface-variant"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant/30 space-y-2">
        {/* Only rendered once the admin session has loaded */}
        {admin && (
          <div className="px-2">
            <p className="text-sm font-label-md truncate">{admin.name}</p>
            <p className="text-xs text-secondary truncate">{admin.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-label-md text-label-md text-error hover:bg-error-container/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </>
  );
}
