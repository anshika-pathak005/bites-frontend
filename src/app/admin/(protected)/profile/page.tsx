"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useAdminProfile,
  useChangePassword,
  useUpdateProfile,
} from "@/features/admin/auth/hooks/use-admin-profile";

// Admin's own account page: update name/email, and separately change password.
export default function AdminProfilePage() {
  const { data: profile, isLoading } = useAdminProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  // Populate the profile form once the real profile loads — can't build it from data that hasn't arrived yet.
  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name, email: profile.email });
    }
  }, [profile]);

  // Saves the name/email changes.
  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(profileForm);
  }

  // Submits the password change and clears the sensitive fields on success.
  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    changePassword.mutate(passwordForm, {
      onSuccess: () => setPasswordForm({ currentPassword: "", newPassword: "" }),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-headline-lg font-headline-lg">Profile</h1>
        <p className="text-secondary mt-1">Manage your own admin account.</p>
      </div>

      {/* Basic profile info form */}
      <form onSubmit={handleProfileSubmit} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="font-headline-md text-headline-md">Update Profile</h3>
        <div>
          <label className="font-label-md text-label-sm block mb-2">Name</label>
          <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
        </div>
        <div>
          <label className="font-label-md text-label-sm block mb-2">Email</label>
          <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
        </div>
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* Separate change-password form so it can be submitted independently of profile edits */}
      <form onSubmit={handlePasswordSubmit} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="font-headline-md text-headline-md">Change Password</h3>
        <div>
          <label className="font-label-md text-label-sm block mb-2">Current Password</label>
          <Input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="font-label-md text-label-sm block mb-2">New Password</label>
          <Input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Updating..." : "Change Password"}
        </Button>
      </form>
    </div>
  );
}
