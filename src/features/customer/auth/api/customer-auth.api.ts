import axios from "axios";
import { apiClient } from "@/lib/api/axios-instance";
import type { ApiError, ApiResponse } from "@/types/api.types";
import type {
  Customer,
  CustomerAuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/customer-auth.types";
import type { MenuItem } from "@/types/menu.types";

/**
 * Extracts a clean, human-readable ApiError object from Axios or unknown error responses,
 * preventing raw HTTP strings like "Request failed with status code 401" from being shown to users.
 */
export function extractApiErrorMessage(err: unknown, defaultMsg: string): ApiError {
  if (axios.isAxiosError(err)) {
    const resData = err.response?.data;
    if (resData) {
      if (resData.error && typeof resData.error === "object") {
        return {
          code: resData.error.code || "API_ERROR",
          message: resData.error.message || resData.message || defaultMsg,
          fieldErrors: resData.error.fieldErrors || resData.fieldErrors,
        };
      }
      if (resData.message) {
        return {
          code: resData.code || "API_ERROR",
          message: resData.message,
          fieldErrors: resData.fieldErrors,
        };
      }
    }

    if (err.response?.status === 401) {
      return { code: "UNAUTHORIZED", message: "Invalid email or password" };
    }
    if (err.response?.status === 429) {
      return { code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please wait a moment and try again." };
    }
    if (err.response?.status === 400) {
      return { code: "BAD_REQUEST", message: "Invalid request details. Please check your information." };
    }
  }

  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message: string }).message;
    if (msg && !msg.includes("status code")) {
      return { code: "ERROR", message: msg };
    }
  }

  return { code: "UNKNOWN_ERROR", message: defaultMsg };
}

/**
 * Registers a new customer account.
 * Response contains accessToken and customer details.
 * The refresh token is set automatically in an HttpOnly cookie by the backend.
 */
export async function registerCustomer(payload: RegisterRequest): Promise<CustomerAuthResponse> {
  try {
    const { data } = await apiClient.post<ApiResponse<CustomerAuthResponse>>(
      "/customer/auth/register",
      payload
    );

    if (!data.success || !data.data) {
      throw data.error || new Error(data.message || "Failed to register account");
    }

    return data.data;
  } catch (err) {
    throw extractApiErrorMessage(err, "Failed to register account");
  }
}

/**
 * Logs in an existing customer.
 * Response contains accessToken and customer details.
 */
export async function loginCustomer(payload: LoginRequest): Promise<CustomerAuthResponse> {
  try {
    const { data } = await apiClient.post<ApiResponse<CustomerAuthResponse>>(
      "/customer/auth/login",
      payload
    );

    if (!data.success || !data.data) {
      throw data.error || new Error(data.message || "Invalid email or password");
    }

    return data.data;
  } catch (err) {
    throw extractApiErrorMessage(err, "Invalid email or password");
  }
}

/**
 * Restores/refreshes the customer session using the HttpOnly refresh token cookie.
 * Called automatically on app startup and on 401 token expiry.
 */
export async function refreshCustomerToken(): Promise<CustomerAuthResponse | null> {
  try {
    const { data } = await apiClient.post<ApiResponse<CustomerAuthResponse>>(
      "/customer/auth/refresh",
      {},
      { withCredentials: true }
    );

    if (!data.success || !data.data) {
      return null;
    }

    return data.data;
  } catch {
    return null;
  }
}

/**
 * Logs out the current customer and revokes the refresh token server-side.
 */
export async function logoutCustomer(): Promise<void> {
  try {
    await apiClient.post<ApiResponse<null>>("/customer/auth/logout", {}, { withCredentials: true });
  } catch {
    // Best effort logout — local state will be cleared regardless
  }
}

/**
 * Fetches the logged-in customer's profile details using the Bearer token.
 */
export async function fetchCustomerProfile(): Promise<Customer | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<Customer>>("/customer/auth/me");
    return data.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches personalized menu recommendations for the authenticated customer.
 * Returns empty array if guest or if user has no order history.
 */
export async function fetchCustomerRecommendations(): Promise<MenuItem[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<MenuItem[]>>("/customer/recommendations");
    return data.data ?? [];
  } catch {
    return [];
  }
}
