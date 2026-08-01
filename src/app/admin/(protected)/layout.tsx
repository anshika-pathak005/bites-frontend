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
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow min-w-0 px-6 md:px-10 py-8">{children}</div>
    </div>
  );
}
