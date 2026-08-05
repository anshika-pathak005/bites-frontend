// An authenticated admin/staff account for the admin dashboard.
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

// Response shape from the admin login/refresh endpoints. The refresh token
// is no longer in this body — the backend sets it as an HttpOnly cookie instead.
export interface AdminAuthResponse {
  accessToken: string;
  admin: AdminUser;
}

// A deliverable zone/area with its own delivery charge, managed by admins.
export interface DeliveryArea {
  id: string;
  name: string;
  deliveryCharge: number;
  isActive: boolean;
}
