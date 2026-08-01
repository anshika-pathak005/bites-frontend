"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/admin-auth-context";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";

// /admin has no content of its own — it just forwards to the dashboard
// (if already logged in) or the login page (if not), once the auth
// context has finished checking localStorage.
export default function AdminIndexPage() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  // Wait for the auth check to settle, then redirect based on the result.
  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? ROUTES.admin.dashboard : ROUTES.admin.login);
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
