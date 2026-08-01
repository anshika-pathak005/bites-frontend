"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { changePasswordRequest, fetchProfile, updateProfileRequest } from "../api/admin-auth.api";

const KEY = ["admin", "profile"];

// Fetches and caches the logged-in admin's profile.
export function useAdminProfile() {
  return useQuery({ queryKey: KEY, queryFn: fetchProfile });
}

// Updates the admin's name/email and invalidates the cached profile.
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      // Keep the sidebar's cached name/email (read from localStorage) fresh too.
      if (updated) {
        window.localStorage.setItem("bites_admin_user", JSON.stringify(updated));
      }
      toast.success("Profile updated");
    },
    onError: () => toast.error("Could not update profile"),
  });
}

// Changes the admin's password; no cache to invalidate since nothing else reads it.
export function useChangePassword() {
  return useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => toast.success("Password changed successfully"),
    onError: () => toast.error("Could not change password — check your current password"),
  });
}
