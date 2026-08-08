export interface Address {
  id: string;
  label: string; // e.g. "Home", "Work", "Other"
  fullAddress: string;
  landmark?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressPayload {
  label: string;
  fullAddress: string;
  landmark?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}
