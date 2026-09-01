"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  loginCustomer,
  logoutCustomer,
  refreshCustomerToken,
  registerCustomer,
} from "@/features/customer/auth/api/customer-auth.api";
import {
  registerCustomerSessionExpiredCallback,
  setCustomerAccessToken,
} from "@/lib/api/axios-instance";
import { queryKeys } from "@/lib/query/query-keys";
import type { Customer, LoginRequest, RegisterRequest } from "@/types/customer-auth.types";

interface CustomerAuthContextValue {
  customer: Customer | null;
  accessToken: string | null;
  authReady: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<Customer>;
  register: (data: RegisterRequest) => Promise<Customer>;
  logout: () => Promise<void>;
  setCustomerState: (customer: Customer | null, token: string | null) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Helper to sync local memory state, axios header token, and TanStack query caches
  const syncCustomerSession = useCallback((newCustomer: Customer | null, newToken: string | null) => {
    setCustomer(newCustomer);
    setAccessToken(newToken);
    setCustomerAccessToken(newToken);
  }, []);

  // Re-fetches all user-bound cached resources (cart, saved addresses, order history, recommendations)
  const refreshUserCaches = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.myOrders }),
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.recommendations }),
    ]);
  }, [queryClient]);

  // Session bootstrap on application mount — silently restores session if refresh cookie exists
  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const authData = await refreshCustomerToken();
        if (authData && authData.accessToken && authData.customer) {
          syncCustomerSession(authData.customer, authData.accessToken);
        } else {
          syncCustomerSession(null, null);
        }
      } catch {
        syncCustomerSession(null, null);
      } finally {
        setAuthReady(true);
      }
    }

    bootstrapAuth();

    // Register callback for background 401 token refresh failures
    registerCustomerSessionExpiredCallback(() => {
      syncCustomerSession(null, null);
      queryClient.setQueryData(queryKeys.cart.all, null);
      queryClient.setQueryData(queryKeys.addresses.all, []);
      queryClient.setQueryData(queryKeys.orders.myOrders, []);
      queryClient.setQueryData(queryKeys.customer.recommendations, []);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    });

    return () => {
      registerCustomerSessionExpiredCallback(null);
    };
  }, [syncCustomerSession, queryClient]);

  // Logs in customer, saves token in memory, and re-fetches server-merged cart and addresses
  const login = async (data: LoginRequest): Promise<Customer> => {
    const authData = await loginCustomer(data);
    syncCustomerSession(authData.customer, authData.accessToken);
    await refreshUserCaches();
    return authData.customer;
  };

  // Registers customer, saves token in memory, and re-fetches server-merged cart and addresses
  const register = async (data: RegisterRequest): Promise<Customer> => {
    const authData = await registerCustomer(data);
    syncCustomerSession(authData.customer, authData.accessToken);
    await refreshUserCaches();
    return authData.customer;
  };

  // Logs out customer, revokes refresh cookie server-side, wipes in-memory token, and refreshes queries
  const logout = async (): Promise<void> => {
    try {
      await logoutCustomer();
    } catch {
      // Ignore network errors on logout — clear local session regardless
    }
    syncCustomerSession(null, null);

    // Synchronously wipe every customer-scoped cache BEFORE refetching.
    // Without this, invalidateQueries only marks the data stale — the old
    // cart count/addresses/orders stay on screen until the refetch resolves,
    // which is exactly the "stale count after logout" bug. Clearing first
    // means the UI drops to empty immediately, then fills back in with
    // whatever the fresh (now guest-scoped) cart actually contains.
    queryClient.setQueryData(queryKeys.cart.all, null);
    queryClient.setQueryData(queryKeys.addresses.all, []);
    queryClient.setQueryData(queryKeys.orders.myOrders, []);
    queryClient.setQueryData(queryKeys.customer.recommendations, []);

    await refreshUserCaches();
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        accessToken,
        authReady,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        setCustomerState: syncCustomerSession,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return ctx;
}
