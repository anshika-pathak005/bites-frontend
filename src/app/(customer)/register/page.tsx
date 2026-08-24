"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { ROUTES } from "@/constants/routes";
import type { ApiError } from "@/types/api.types";

export default function CustomerRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || ROUTES.menu;

  const { register } = useCustomerAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Client-side validation matching backend rules
  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Full name is required";
    }

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (phone.trim().replace(/\D/g, "").length < 10) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const customer = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      toast.success(`Account created! Welcome to Bites, ${customer.name}.`);
      router.push(redirectTo);
    } catch (err: unknown) {
      const apiErr = err as ApiError;

      if (apiErr?.fieldErrors && Object.keys(apiErr.fieldErrors).length > 0) {
        setFieldErrors(apiErr.fieldErrors);
      } else if (apiErr?.code === "TOO_MANY_REQUESTS" || (apiErr as { status?: number })?.status === 429) {
        setGeneralError("Too many registration attempts. Please wait a moment and try again.");
      } else if (apiErr?.message && !apiErr.message.includes("status code")) {
        setGeneralError(apiErr.message);
      } else {
        setGeneralError("Could not create account. An account with this email or phone may already exist.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-md sm:max-w-lg lg:max-w-xl mx-auto py-stack-md sm:py-stack-lg min-h-[calc(100vh-160px)] flex items-center justify-center">
      {/* Unique Responsive Card */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-5 relative overflow-hidden group">
        {/* Glowing Ambient Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-primary-fixed to-primary-container" />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">Join Bites Culinary</h1>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            Save your favorite dishes, track order progress, and unlock personalized recommendations.
          </p>
        </div>

          {/* Global Error Banner */}
          {generalError && (
            <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error/30 text-on-error-container text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-error" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Chef John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className={fieldErrors.name ? "border-error focus:ring-error" : ""}
              />
              {fieldErrors.name && (
                <p className="text-[11px] font-semibold text-error mt-0.5">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className={fieldErrors.email ? "border-error focus:ring-error" : ""}
              />
              {fieldErrors.email && (
                <p className="text-[11px] font-semibold text-error mt-0.5">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                className={fieldErrors.phone ? "border-error focus:ring-error" : ""}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] font-semibold text-error mt-0.5">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Password (min 8 characters)
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className={fieldErrors.password ? "border-error focus:ring-error" : ""}
              />
              {fieldErrors.password && (
                <p className="text-[11px] font-semibold text-error mt-0.5">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-black font-bold py-3.5 rounded-xl glow-hover flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg shadow-primary-container/20"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 text-black" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Link & Guest Assurance */}
          <div className="pt-3 border-t border-outline-variant/20 space-y-2.5">
            <p className="text-xs text-secondary">
              Already have an account?{" "}
              <Link
                href={redirectTo !== ROUTES.menu ? `${ROUTES.login}?redirect=${encodeURIComponent(redirectTo)}` : ROUTES.login}
                className="text-primary font-bold hover:underline"
              >
                Log In
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-secondary/70 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary/80 shrink-0" />
              <span>Existing guest items in your cart will automatically merge into your account.</span>
            </div>
          </div>
        </div>
    </div>
  );
}
