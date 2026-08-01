"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/admin-auth-context";
import { ROUTES } from "@/constants/routes";

// Client-side validation only; the real credential check happens in login() against the server.
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// Admin sign-in page: validates input, calls login(), then routes to the dashboard.
export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Attempts login; any failure (wrong credentials, network, etc.) surfaces as a generic toast.
  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      router.push(ROUTES.admin.dashboard);
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low px-margin-mobile">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-sm p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-headline-md font-headline-md text-primary">Bites Admin</h1>
          <p className="text-secondary text-sm mt-1">Sign in to manage your restaurant</p>
        </div>

        {/* react-hook-form + zod handle client-side validation before onSubmit runs */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="font-label-md text-label-sm block mb-2">Email</label>
            <Input type="email" {...register("email")} placeholder="admin@bites.example" />
            {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="font-label-md text-label-sm block mb-2">Password</label>
            <Input type="password" {...register("password")} placeholder="••••••••" />
            {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
