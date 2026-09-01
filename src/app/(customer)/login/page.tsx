"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Package, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { ROUTES } from "@/constants/routes";
import type { ApiError } from "@/types/api.types";

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

const PERKS = [
  { icon: Package, label: "Track every order live, from kitchen to doorstep" },
  { icon: MapPin, label: "Save addresses so checkout takes seconds" },
  { icon: Sparkles, label: "Get recommendations picked from what you order" },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || ROUTES.menu;

  const { login } = useCustomerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Client-side quick validation before firing request
  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
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
      const customer = await login({ email: email.trim(), password });
      toast.success(`Welcome back, ${customer.name}!`);
      router.push(redirectTo);
    } catch (err: unknown) {
      const apiErr = err as ApiError;

      if (apiErr?.fieldErrors && Object.keys(apiErr.fieldErrors).length > 0) {
        setFieldErrors(apiErr.fieldErrors);
      } else if (apiErr?.code === "TOO_MANY_REQUESTS" || (apiErr as { status?: number })?.status === 429) {
        setGeneralError("Too many login attempts. Please wait a moment and try again.");
      } else if (apiErr?.message && !apiErr.message.includes("status code")) {
        setGeneralError(apiErr.message);
      } else {
        setGeneralError("Invalid email or password");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-md sm:py-stack-lg min-h-[calc(100vh-160px)] flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-5 rounded-3xl overflow-hidden border border-outline-variant/30 shadow-2xl bg-surface-container-lowest">
        {/* Visual Brand Panel — hidden on mobile, shown from lg upward */}
        <div className="hidden lg:flex lg:col-span-2 relative flex-col justify-between p-10 overflow-hidden">
          <Image
            src="/images/login-regBG.jpg"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/85 to-surface-container-lowest/40" />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <Link href={ROUTES.home} className="inline-flex items-center w-fit">
              <div className="relative h-10 w-28">
                <Image src="/images/logo.png" alt="Bites Logo" fill unoptimized className="object-contain" />
              </div>
            </Link>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-on-surface leading-tight tracking-tight">
                Your midnight cravings,
                <br />
                one login away.
              </h2>
              <ul className="space-y-3.5">
                {PERKS.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="mt-0.5 w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="pt-0.5">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-3 flex items-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Welcome Back</h1>
              <p className="text-sm text-secondary leading-relaxed">
                Log in to access your saved addresses, past orders, and personalized recommendations.
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
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

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  Password
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer Link & Guest Assurance */}
            <div className="pt-4 border-t border-outline-variant/20 space-y-3">
              <p className="text-xs text-secondary">
                Don&apos;t have an account yet?{" "}
                <Link
                  href={redirectTo !== ROUTES.menu ? `${ROUTES.register}?redirect=${encodeURIComponent(redirectTo)}` : ROUTES.register}
                  className="text-primary font-bold hover:underline"
                >
                  Create Account
                </Link>
              </p>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-secondary/70 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                <span>Ordering without log in? Guest checkout is always available.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
