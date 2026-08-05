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
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-lg">
      <div className="text-center mb-stack-lg">
        <span className="text-primary font-label-md text-label-md tracking-widest">GET IN TOUCH</span>
        <h1 className="font-headline-lg text-headline-lg mt-2">Contact Us</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Static contact info cards */}
        <div className="space-y-6">
          <ContactRow icon={<MapPin className="w-5 h-5" />} label="Address" value={SITE_CONTENT.contact.address} />
          <ContactRow icon={<Phone className="w-5 h-5" />} label="Phone" value={SITE_CONTENT.contact.phone} />
          <ContactRow icon={<Mail className="w-5 h-5" />} label="Email" value={SITE_CONTENT.contact.email} />
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="name" placeholder="Your name" required />
            <Input name="email" type="email" placeholder="Your email" required />
          </div>
          {/* +91 is fixed since the restaurant only takes Indian numbers — caller just types the 10-digit number */}
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-outline-variant bg-surface-container-high text-on-surface-variant text-body-md font-body-md">
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
          <Textarea name="message" placeholder="Your message" required />
          <Button type="submit" size="lg" disabled={isSubmitting}>
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
    <div className="flex items-start gap-4 bg-surface-container-lowest rounded-2xl shadow-sm p-5">
      <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-label-md text-label-sm text-secondary">{label}</p>
        <p className="font-label-md text-label-md">{value}</p>
      </div>
    </div>
  );
}
