import Link from "next/link";
import { Globe, Instagram, Facebook } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { SITE_CONTENT } from "@/data/site-content";

// Site-wide footer: brand blurb, social links, nav columns, and contact info.
export function Footer() {
  return (
    <footer className="w-full pt-stack-lg pb-stack-md bg-surface-container-highest">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="space-y-4">
          <Link href={ROUTES.home} className="text-headline-md font-headline-md text-primary">
            Bites
          </Link>
          <p className="text-body-md font-body-md text-on-surface max-w-xs">
            {SITE_CONTENT.footerTagline}
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
              aria-label="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="font-label-md text-label-md text-on-surface">Navigation</h5>
          <nav className="flex flex-col gap-2">
            <Link href={ROUTES.home} className="text-on-secondary-container hover:text-primary transition-colors">Home</Link>
            <Link href={ROUTES.menu} className="text-on-secondary-container hover:text-primary transition-colors">Menu</Link>
            <Link href={ROUTES.trackOrder} className="text-on-secondary-container hover:text-primary transition-colors">Track Order</Link>
            <Link href={ROUTES.about} className="text-on-secondary-container hover:text-primary transition-colors">About</Link>
          </nav>
        </div>

        <div className="space-y-4">
          <h5 className="font-label-md text-label-md text-on-surface">Company</h5>
          <nav className="flex flex-col gap-2">
            <Link href={ROUTES.contact} className="text-on-secondary-container hover:text-primary transition-colors">Contact Us</Link>
            <span className="text-on-secondary-container">Privacy Policy</span>
            <span className="text-on-secondary-container">Terms of Service</span>
          </nav>
        </div>

        <div className="space-y-4">
          <h5 className="font-label-md text-label-md text-on-surface">Get in Touch</h5>
          <p className="text-sm text-secondary">{SITE_CONTENT.contact.address}</p>
          <p className="text-sm text-secondary">{SITE_CONTENT.contact.phone}</p>
          <p className="text-sm text-secondary">{SITE_CONTENT.contact.email}</p>
        </div>
      </div>
      <div className="mt-12 border-t border-outline-variant/30 pt-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <p className="font-body-md text-body-md text-on-surface">
          {/* Always shows the current year rather than a hardcoded one */}
          © {new Date().getFullYear()} Bites. All rights reserved. Crafted for comfort.
        </p>
      </div>
    </footer>
  );
}
