"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest, logoutRequest } from "@/features/admin/auth/api/admin-auth.api";
import { ROUTES } from "@/constants/routes";
import type { AdminUser } from "@/types/admin.types";

// localStorage keys used to persist the admin session across page loads/tabs.
const ACCESS_TOKEN_KEY = "bites_admin_access_token";
const REFRESH_TOKEN_KEY = "bites_admin_refresh_token";
const ADMIN_USER_KEY = "bites_admin_user";

interface AdminAuthContextValue {
  admin: AdminUser | null;
  // True only while we're checking localStorage on first load — used to
  // avoid a flash-redirect to /admin/login before we've actually checked
  // whether a session exists.
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

// Provides admin JWT session state (user, tokens, loading/auth flags) app-wide;
// the protected-route guard reads isLoading/isAuthenticated from this.
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  // Starts true; flips to false once the localStorage check below completes.
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On first mount, restore whatever session was saved from a previous
  // visit — this is what keeps an admin logged in across page refreshes.
  useEffect(() => {
    const storedUser = window.localStorage.getItem(ADMIN_USER_KEY);
    const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    // Only restore if both the user record and an access token are present
    if (storedUser && storedToken) {
      setAdmin(JSON.parse(storedUser));
    }
    // Signal that the initial session check is done, whether or not one was found
    setIsLoading(false);
  }, []);

  // Calls the login API, then persists tokens + user and updates state on success.
  async function login(email: string, password: string) {
    const result = await loginRequest(email, password);
    if (!result) throw new Error("Login failed");

    // Access token, refresh token, and user record are all stored so the
    // session survives a refresh (restored in the effect above).
    window.localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(result.admin));
    setAdmin(result.admin);
  }

  // Revokes the refresh token server-side (best effort), clears local session, redirects to login.
  async function logout() {
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
    // Best-effort — if the network call fails, we still clear the local
    // session so the admin is logged out on THIS device regardless.
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // intentionally ignored
      }
    }
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(ADMIN_USER_KEY);
    setAdmin(null);
    // Send the admin back to the login page after clearing the session
    router.push(ROUTES.admin.login);
  }

  return (
    // isAuthenticated is just derived from whether an admin record is loaded
    <AdminAuthContext.Provider value={{ admin, isLoading, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Hook for consuming admin auth state/actions; throws if used outside the provider.
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
