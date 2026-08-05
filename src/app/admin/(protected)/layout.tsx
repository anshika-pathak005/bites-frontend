"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/admin-auth-context";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";

// Every route inside (protected) requires a valid admin session. isLoading
// guards against redirecting BEFORE we've had a chance to check
// localStorage on first load — without it, every refresh would briefly
// flash the login page even for an already-logged-in admin.
export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  // Redirect to login once the auth check has settled and there's no session.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.admin.login);
    }
  }, [isLoading, isAuthenticated, router]);

  // Show a spinner while checking auth, or while the redirect above is in flight.
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Authenticated: render the sidebar shell with the actual page content.
  // flex-col on mobile stacks the top bar above content; md:flex-row puts
  // the full sidebar beside it on desktop, matching AdminSidebar's own breakpoint.
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar />
      <div className="flex-grow min-w-0 px-4 sm:px-6 md:px-10 py-6 md:py-8">{children}</div>
    </div>
  );
}
