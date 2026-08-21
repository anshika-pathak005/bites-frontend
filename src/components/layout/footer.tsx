import Link from "next/link";
import Image from "next/image";
import { Globe, Instagram, Facebook } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { SITE_CONTENT } from "@/data/site-content";

// Site-wide footer: luxury brand signature, social links, nav columns, and contact info.
export function Footer() {
  return (
    <footer className="w-full pt-16 pb-12 bg-surface-container-lowest border-t border-outline-variant/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link href={ROUTES.home} className="inline-block group">
            <div className="relative h-10 w-28 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Bites Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-xs leading-relaxed">
            {SITE_CONTENT.footerTagline}
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="#"
              className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface hover:text-primary-fixed hover:border-primary-container/60 hover:bg-surface-container-high transition-all"
              aria-label="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface hover:text-primary-fixed hover:border-primary-container/60 hover:bg-surface-container-high transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface hover:text-primary-fixed hover:border-primary-container/60 hover:bg-surface-container-high transition-all"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-3">
          <h5 className="font-title-lg text-sm sm:text-base font-semibold text-primary-fixed uppercase tracking-wider">
            Navigation
          </h5>
          <nav className="flex flex-col gap-2.5">
            <Link href={ROUTES.home} className="font-body-md text-xs sm:text-sm text-on-surface-variant hover:text-primary-fixed transition-colors">
              Home
            </Link>
            <Link href={ROUTES.menu} className="font-body-md text-xs sm:text-sm text-on-surface-variant hover:text-primary-fixed transition-colors">
              Our Menu
            </Link>
            <Link href={ROUTES.trackOrder} className="font-body-md text-xs sm:text-sm text-on-surface-variant hover:text-primary-fixed transition-colors">
              Live Order Tracker
            </Link>
            <Link href={ROUTES.about} className="font-body-md text-xs sm:text-sm text-on-surface-variant hover:text-primary-fixed transition-colors">
              About Bites
            </Link>
          </nav>
        </div>

        {/* Company Links */}
        <div className="space-y-3">
          <h5 className="font-title-lg text-sm sm:text-base font-semibold text-primary-fixed uppercase tracking-wider">
            Company
          </h5>
          <nav className="flex flex-col gap-2.5">
            <Link href={ROUTES.contact} className="font-body-md text-xs sm:text-sm text-on-surface-variant hover:text-primary-fixed transition-colors">
              Contact & Inquiries
            </Link>
            <span className="font-body-md text-xs sm:text-sm text-on-surface-variant/70 cursor-pointer hover:text-primary-fixed transition-colors">
              Privacy Policy
            </span>
            <span className="font-body-md text-xs sm:text-sm text-on-surface-variant/70 cursor-pointer hover:text-primary-fixed transition-colors">
              Terms of Service
            </span>
            <span className="font-body-md text-xs sm:text-sm text-on-surface-variant/70 cursor-pointer hover:text-primary-fixed transition-colors">
              Kitchen Hygiene
            </span>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h5 className="font-title-lg text-sm sm:text-base font-semibold text-primary-fixed uppercase tracking-wider">
            Get in Touch
          </h5>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {SITE_CONTENT.contact.address}
          </p>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            {SITE_CONTENT.contact.phone}
          </p>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            {SITE_CONTENT.contact.email}
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-outline-variant/20 pt-6 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
          © {new Date().getFullYear()} Bites Culinary. All rights reserved. Crafted with passion & comfort.
        </p>
      </div>
    </footer>
  );
}
