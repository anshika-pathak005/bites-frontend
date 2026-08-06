"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SITE_CONTENT } from "@/data/site-content";

// Contact page with static contact details and a (currently simulated) message form.
export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NOTE: there is no backend endpoint for contact messages yet — this just
  // simulates a submission. Wire this up to a real endpoint (or an email
  // service) when one exists.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thanks for reaching out — we'll get back to you soon.");
      e.currentTarget.reset();
    }, 600);
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg">
      <div className="text-center mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">GET IN TOUCH</span>
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface">Contact Us</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        {/* Static contact info cards */}
        <div className="space-y-4 sm:space-y-6">
          <ContactRow icon={<MapPin className="w-5 h-5" />} label="Address" value={SITE_CONTENT.contact.address} />
          <ContactRow icon={<Phone className="w-5 h-5" />} label="Phone" value={SITE_CONTENT.contact.phone} />
          <ContactRow icon={<Mail className="w-5 h-5" />} label="Email" value={SITE_CONTENT.contact.email} />
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="name" placeholder="Your name" required />
            <Input name="email" type="email" placeholder="Your email" required />
          </div>
          {/* +91 is fixed since the restaurant only takes Indian numbers */}
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-outline-variant/60 bg-surface-container-high text-on-surface-variant text-body-md font-medium">
              +91
            </span>
            <Input
              name="phone"
              type="tel"
              placeholder="Phone number"
              pattern="[0-9]{10}"
              title="10-digit phone number"
              required
              className="rounded-l-none"
            />
          </div>
          <Input name="subject" placeholder="Subject" required />
          <Textarea name="message" placeholder="Your message" required className="min-h-[120px]" />
          <Button type="submit" size="lg" className="w-full sm:w-auto text-white font-semibold" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Small icon + label + value row used for each contact detail
function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-label-md text-xs text-secondary">{label}</p>
        <p className="font-label-md text-sm sm:text-label-md font-semibold text-on-surface break-words">{value}</p>
      </div>
    </div>
  );
}
