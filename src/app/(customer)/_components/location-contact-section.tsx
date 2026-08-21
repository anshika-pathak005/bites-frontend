"use client";

import { useState } from "react";
import { MapPin, Clock, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SITE_CONTENT } from "@/data/site-content";

// Landing page section with visit info and interactive contact form
export function LocationContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Thank you! Your message has been sent to our culinary team.");
      setName("");
      setEmail("");
      setMessage("");
    }, 600);
  }

  return (
    <section className="py-stack-md sm:py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface max-w-container-max mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-stretch">
        {/* Left: Visit Us Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-6 bg-primary-container rounded-full" />
              <span className="text-primary-container font-label-md text-xs sm:text-label-md tracking-widest uppercase font-semibold">
                COME DINE WITH US
              </span>
            </div>
            <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-primary-fixed font-bold tracking-tight mb-4">
              Visit The Kitchen
            </h2>
            <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant mb-8 leading-relaxed">
              Step into our ambient dining space or pick up your orders fresh from the counter.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-start gap-4 hover:border-primary-container/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center text-primary-container shrink-0 shadow-inner">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-title-lg text-base font-semibold text-primary-fixed mb-1">Our Location</h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  {SITE_CONTENT.contact.address}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-start gap-4 hover:border-primary-container/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center text-primary-container shrink-0 shadow-inner">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-title-lg text-base font-semibold text-primary-fixed mb-1">Opening Hours</h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  11:00 AM – 02:00 AM Midnight<br />
                  Open Everyday (Including Weekends & Holidays)
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-start gap-4 hover:border-primary-container/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center text-primary-container shrink-0 shadow-inner">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-title-lg text-base font-semibold text-primary-fixed mb-1">Direct Inquiries</h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  {SITE_CONTENT.contact.phone} • {SITE_CONTENT.contact.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="bg-surface-container-low p-6 sm:p-8 md:p-10 rounded-3xl border border-outline-variant/30 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Ambient glow accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <h3 className="font-headline-lg text-xl sm:text-2xl font-bold text-primary-fixed mb-2">
              Send Us A Message
            </h3>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mb-6">
              Have special dietary requests or hosting an event? Drop us a line.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="landing-name" className="block font-label-md text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  id="landing-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3.5 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all placeholder:text-on-surface-variant/40"
                />
              </div>

              <div>
                <label htmlFor="landing-email" className="block font-label-md text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="landing-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3.5 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all placeholder:text-on-surface-variant/40"
                />
              </div>

              <div>
                <label htmlFor="landing-message" className="block font-label-md text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  id="landing-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you need or ask any culinary question..."
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3.5 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all placeholder:text-on-surface-variant/40 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-container text-white py-3 rounded-xl font-body-md text-sm font-semibold hover:bg-primary-fixed hover:scale-[1.01] transition-all duration-200 glow-hover flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending message...</span>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Message Sent!</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
