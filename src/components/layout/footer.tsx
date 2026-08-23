"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, Instagram, Facebook, UtensilsCrossed, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// Designer Midnight Culinary footer: centered brand avatar, gold logo, social icons, and nav links.
export function Footer() {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="w-full bg-surface-container-lowest flex flex-col items-center justify-center py-12 sm:py-16 px-margin-mobile md:px-margin-desktop text-center border-t border-outline-variant/20 relative overflow-hidden">
      {/* Background Subtle Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-container-lowest to-surface pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Centered Brand Logo Image - Plain image without background or text */}
        <Link href={ROUTES.home} className="group mb-4 inline-block">
          <div className="relative h-12 w-44 sm:h-20 sm:w-56 transition-transform duration-300 group-hover:scale-105">
            {!logoError ? (
              <Image
                src="/images/logo.png"
                alt="Bites Logo"
                fill
                unoptimized
                onError={() => setLogoError(true)}
                className="object-contain"
              />
            ) : (
              <span className="font-headline-lg text-3xl sm:text-4xl font-bold text-primary">Bites</span>
            )}
          </div>
        </Link>

        {/* Tagline */}
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant/80 max-w-md mx-auto mb-6 leading-relaxed">
          Crafted with passion, delivered with love. Experience the ultimate midnight culinary journey.
        </p>

        {/* Social Icons */}
        <div className="flex justify-center gap-3 mb-8">
          <a
            href="#"
            className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/60 hover:scale-110 transition-all shadow-sm"
            aria-label="Website"
          >
            <Globe className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/60 hover:scale-110 transition-all shadow-sm"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/60 hover:scale-110 transition-all shadow-sm"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
        </div>

        {/* Navigation & Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8 text-xs sm:text-sm font-medium">
          <Link
            href={ROUTES.home}
            className="text-on-surface-variant hover:text-primary transition-colors font-body-md"
          >
            Home
          </Link>
          <Link
            href={ROUTES.menu}
            className="text-on-surface-variant hover:text-primary transition-colors font-body-md"
          >
            Our Menu
          </Link>
          <Link
            href={ROUTES.trackOrder}
            className="text-on-surface-variant hover:text-primary transition-colors font-body-md"
          >
            Track Order
          </Link>
          <Link
            href={ROUTES.about}
            className="text-on-surface-variant hover:text-primary transition-colors font-body-md"
          >
            About Us
          </Link>
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary transition-colors font-body-md"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary transition-colors font-body-md"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary transition-colors font-body-md"
          >
            Shipping Info
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary transition-colors font-body-md"
          >
            Careers
          </a>
        </div>

        {/* Copyright Footer */}
        <div className="text-on-surface-variant font-label-md text-xs opacity-75 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-primary/70 inline" />
          <span>© {new Date().getFullYear()} Bites Culinary. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
