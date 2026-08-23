import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Single shared Axios client for the whole app.
// Admin access tokens live in localStorage (`bites_admin_access_token`).
// Customer access tokens live IN MEMORY ONLY (`inMemoryCustomerAccessToken`) for security.
const ADMIN_ACCESS_TOKEN_KEY = "bites_admin_access_token";
const ADMIN_USER_KEY = "bites_admin_user";

let inMemoryCustomerAccessToken: string | null = null;
let onCustomerSessionExpired: (() => void) | null = null;

export function getCustomerAccessToken(): string | null {
  return inMemoryCustomerAccessToken;
}

export function setCustomerAccessToken(token: string | null) {
  inMemoryCustomerAccessToken = token;
}

export function registerCustomerSessionExpiredCallback(cb: (() => void) | null) {
  onCustomerSessionExpired = cb;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
  // Always include credentials so cookies (guestId, customerRefreshToken, adminRefreshToken) ride along.
  withCredentials: true,
});

// Attaches either the customer access token (in-memory) or admin access token (localStorage).
apiClient.interceptors.request.use((config) => {
  if (inMemoryCustomerAccessToken) {
    config.headers.Authorization = `Bearer ${inMemoryCustomerAccessToken}`;
  } else if (typeof window !== "undefined") {
    const adminToken = window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
    if (adminToken && (config.url?.includes("/admin") || window.location.pathname.startsWith("/admin"))) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }
  return config;
});

// Single in-flight refresh promises to prevent parallel 401 refresh thundering herds.
let adminRefreshPromise: Promise<string | null> | null = null;
let customerRefreshPromise: Promise<string | null> | null = null;

async function refreshAdminToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${apiClient.defaults.baseURL}/admin/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const newAccessToken: string | undefined = data?.data?.accessToken;
    if (!newAccessToken) return null;

    window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, newAccessToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

async function refreshCustomerTokenInternal(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${apiClient.defaults.baseURL}/customer/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const newAccessToken: string | undefined = data?.data?.accessToken;
    if (!newAccessToken) return null;

    setCustomerAccessToken(newAccessToken);
    return newAccessToken;
  } catch {
    setCustomerAccessToken(null);
    return null;
  }
}

function clearAdminSessionAndRedirect() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(ADMIN_USER_KEY);
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  }
}

// Transparent 401 automatic token refresh for both Admin and Customer auth.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do not attempt to refresh on auth endpoints themselves (login, register, refresh)
    const requestUrl = originalRequest.url ?? "";
    if (
      requestUrl.includes("/admin/auth/") ||
      requestUrl.includes("/customer/auth/login") ||
      requestUrl.includes("/customer/auth/register") ||
      requestUrl.includes("/customer/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const isAdminRoute = requestUrl.includes("/admin") || window.location.pathname.startsWith("/admin");

    if (isAdminRoute) {
      adminRefreshPromise = adminRefreshPromise ?? refreshAdminToken();
      const newAccessToken = await adminRefreshPromise;
      adminRefreshPromise = null;

      if (!newAccessToken) {
        clearAdminSessionAndRedirect();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } else {
      customerRefreshPromise = customerRefreshPromise ?? refreshCustomerTokenInternal();
      const newAccessToken = await customerRefreshPromise;
      customerRefreshPromise = null;

      if (!newAccessToken) {
        setCustomerAccessToken(null);
        if (onCustomerSessionExpired) {
          onCustomerSessionExpired();
        }
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    }
  }
);
