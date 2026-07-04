"use client";

import React, { useState } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// ──────────────────────────────────────────────
// Contact Page
// ──────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess("Thank you for your message! We'll get back to you within 24 hours.");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(result.error ?? "Failed to send message. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="py-16 lg:py-20 bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <h1 className="display-lg text-primary mb-3">Contact</h1>
          <p className="body-md text-text-secondary max-w-lg">
            We&apos;d love to hear from you. Reach out for inquiries, collaborations, or just to say hello.
          </p>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* ── Left: Contact Info ── */}
            <div>
              <h2 className="headline-lg text-primary mb-8">Get in Touch</h2>

              <div className="space-y-8">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
                      Address
                    </h3>
                    <p className="text-sm text-secondary">
                      Kathmandu, Nepal
                    </p>
                    <p className="text-sm text-secondary">
                      Bagmati Province, 44600
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
                      Email
                    </h3>
                    <a
                      href="mailto:hello@peafits.com"
                      className="text-sm text-secondary hover:text-primary transition-colors underline underline-offset-2"
                    >
                      hello@peafits.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
                      Phone
                    </h3>
                    <a
                      href="tel:+9779800000000"
                      className="text-sm text-secondary hover:text-primary transition-colors underline underline-offset-2"
                    >
                      +977 980-0000000
                    </a>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
                      Social
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <a
                        href={SOCIAL_LINKS.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-secondary hover:text-primary transition-colors underline underline-offset-2"
                      >
                        Instagram
                      </a>
                      <a
                        href={SOCIAL_LINKS.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-secondary hover:text-primary transition-colors underline underline-offset-2"
                      >
                        Facebook
                      </a>
                      <a
                        href={SOCIAL_LINKS.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-secondary hover:text-primary transition-colors underline underline-offset-2"
                      >
                        TikTok
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Contact Form ── */}
            <div>
              <h2 className="headline-lg text-primary mb-8">Send a Message</h2>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm" role="alert">
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Subject"
                  placeholder="How can we help?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />

                <Input
                  label="Message"
                  placeholder="Tell us more about your inquiry..."
                  multiline
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />

                <Button type="submit" variant="primary" size="lg" loading={submitting} fullWidth>
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
