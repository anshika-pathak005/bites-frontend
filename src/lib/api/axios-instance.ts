import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Single shared Axios client for the whole app: attaches the admin auth
// token on requests and transparently refreshes it on a 401 (see below).
const ACCESS_TOKEN_KEY = "bites_admin_access_token";
const REFRESH_TOKEN_KEY = "bites_admin_refresh_token";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attaches the admin access token when present. Guest/customer requests
// (menu, cart, checkout) never need this — those routes are public, and
// simply won't have a token in storage to attach.
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// If several requests fire at once and all get a 401 at the same time
// (e.g. a dashboard loading 3 widgets in parallel), we only want ONE
// refresh call to go out — every other 401 just waits for that same
// in-flight refresh instead of triggering its own.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  // A plain axios call, not apiClient — going through apiClient here would
  // re-trigger this same response interceptor and could loop.
  try {
    const { data } = await axios.post(
      `${apiClient.defaults.baseURL}/admin/auth/refresh`,
      { refreshToken }
    );
    const newAccessToken: string | undefined = data?.data?.accessToken;
    const newRefreshToken: string | undefined = data?.data?.refreshToken;
    if (!newAccessToken || !newRefreshToken) return null;

    window.localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

// Wipes stored auth state and bounces back to the admin login page — used
// when the refresh token itself is no longer valid.
function clearSessionAndRedirectToLogin() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem("bites_admin_user");
  if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login";
  }
}

// 401 handling: try a token refresh once, replay the original request with
// the new token, and only give up (logging out) if the refresh itself fails.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Only ever attempt this once per request (the _retry flag), and only
    // for actual 401s — anything else (403, 404, 500...) just passes through.
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // The login/refresh endpoints themselves returning 401 means the
    // credentials or refresh token are genuinely invalid — retrying would
    // just loop forever, so bail out immediately for those.
    if (originalRequest.url?.includes("/admin/auth/")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    refreshPromise = refreshPromise ?? refreshAccessToken();
    const newAccessToken = await refreshPromise;
    refreshPromise = null;

    if (!newAccessToken) {
      clearSessionAndRedirectToLogin();
      return Promise.reject(error);
    }

    // Refresh worked — update the header on the original request and
    // replay it exactly once. The caller never sees the 401 at all.
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  }
);
