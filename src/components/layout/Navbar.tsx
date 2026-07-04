"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

// ──────────────────────────────────────────────
// NavLink Component
// ──────────────────────────────────────────────

function NavLink({ href, label, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative text-sm transition-colors duration-200 py-1",
        isActive
          ? "text-black font-medium"
          : "text-neutral-600 hover:text-black",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-px left-0 right-0 h-px bg-black" />
      )}
    </Link>
  );
}

// ──────────────────────────────────────────────
// Navbar Component
// ──────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { items } = useCartStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Detect scroll for glass effect ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close mobile menu on route change ──
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ── Prevent body scroll when mobile nav is open ──
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // ── Active link helper — matches pathname + query params ──
  const isLinkActive = (href: string): boolean => {
    const [linkPath, linkQuery] = href.split("?");
    if (!linkQuery) return pathname === linkPath; // plain path
    // Query-param links: match path + full query string
    const currentQuery = searchParams.toString();
    return pathname === linkPath && currentQuery === linkQuery;
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-neutral-100/50 shadow-lg translate-y-0"
          : "bg-transparent translate-y-0",
      )}
      style={{
        transform: scrolled
          ? "perspective(800px) translateZ(8px)"
          : "perspective(800px) translateZ(0px)",
        transformStyle: "preserve-3d",
      }}
    >
      <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
        <nav
          className="flex items-center justify-between h-16 lg:h-20"
          aria-label="Main navigation"
        >
          {/* ── Mobile Hamburger ── */}
          <button
            type="button"
            className="lg:hidden relative w-6 h-6 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "block w-5 h-px bg-black transition-transform duration-200",
                  mobileOpen && "rotate-45 translate-y-1",
                )}
              />
              <span
                className={cn(
                  "block w-5 h-px bg-black transition-opacity duration-200",
                  mobileOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block w-5 h-px bg-black transition-transform duration-200",
                  mobileOpen && "-rotate-45 -translate-y-1",
                )}
              />
            </div>
          </button>

          {/* ── Left: Desktop Nav Links ── */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={isLinkActive(link.href)}
              />
            ))}
          </div>

          {/* ── Center: Logo ── */}
          <Link
            href="/"
            className={cn(
              "text-xl font-semibold tracking-tight text-black transition-opacity",
              "hover:opacity-70 absolute left-1/2 -translate-x-1/2 lg:relative lg:left-auto lg:translate-x-0",
            )}
          >
            {SITE_NAME}
          </Link>

          {/* ── Right: Icons ── */}
          <div className="flex items-center gap-3 lg:gap-5">
            {/* Search */}
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="p-2 text-neutral-700 hover:text-black transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/profile?tab=wishlist"
              className="hidden sm:block p-2 text-neutral-700 hover:text-black transition-colors"
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </Link>

            {/* Cart */}
            <Link
              href="/bag"
              className="relative p-2 text-neutral-700 hover:text-black transition-colors"
              aria-label="Shopping bag"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-medium w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link
              href={session ? "/profile" : "/login"}
              className="hidden sm:block p-2 text-neutral-700 hover:text-black transition-colors"
              aria-label={session ? "Profile" : "Sign in"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Mobile Menu Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 bg-white z-40 lg:hidden">
          <div className="flex flex-col px-5 py-8 gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-lg py-2 border-b border-neutral-100 transition-colors",
                  isLinkActive(link.href)
                    ? "text-black font-medium"
                    : "text-neutral-600 hover:text-black",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile auth links */}
            <div className="pt-4 space-y-4">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block text-lg text-neutral-600 hover:text-black transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/profile?tab=wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="block text-lg text-neutral-600 hover:text-black transition-colors"
                  >
                    Wishlist
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg text-neutral-600 hover:text-black transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
