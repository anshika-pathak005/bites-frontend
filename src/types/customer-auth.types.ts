// Authenticated customer user object.
export interface Customer {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
}

// Response returned from /customer/auth/login, /register, and /refresh.
export interface CustomerAuthResponse {
  accessToken: string;
  customer: Customer;
}

// Registration payload DTO.
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Login payload DTO.
export interface LoginRequest {
  email: string;
  password: string;
}
