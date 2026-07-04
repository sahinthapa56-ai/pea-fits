---
version: alpha
name: pea-fits-design-analysis
description: A design analysis of PEA_FITS — where Atelier Minimalism meets architectural sensibility. A fashion e-commerce experience that alternates between airy editorial whitespace and deep tonal intimacy, framed by EB Garamond's classical serif voice and Hanken Grotesk's precise sans utility. Glassmorphism floats utility surfaces above deep photographic foundations, while a restrained editorial accent palette (pure black, editorial red, warm bone) keeps focus on the product silhouette.

colors:
  ink: "#000000"
  body: "#5d5e60"
  body-muted: "#848484"
  surface: "#ffffff"
  bone: "#fbfbfb"
  background: "#f9f9f9"
  surface-container: "#eeeeee"
  border: "#e8e8e8"
  editorial-red: "#ae0200"
  error: "#ba1a1a"
  outline: "#7e7576"
  glass-white: "rgba(255, 255, 255, 0.80)"
  glass-border: "rgba(0, 0, 0, 0.04)"
  overlay-dark: "rgba(0, 0, 0, 0.60)"
  gradient-soft-start: "#f5f5f5"
  gradient-soft-end: "#f0f0f0"
  gradient-hero-start: "#e8e6e1"
  gradient-hero-end: "#d4d0c8"

typography:
  display-lg:
    fontFamily: "EB Garamond, serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.02em
    use: Hero headlines, section titles, product tile names — the signature PEA_FITS serif voice
  headline-lg:
    fontFamily: "EB Garamond, serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.2
    use: Section headings, editorial blocks
  headline-sm:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: 20px
    fontWeight: 600
    letterSpacing: 0.05em
    lineHeight: 1.3
    use: Product card titles, utility section heads
  body-lg:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    use: Hero subcopy, editorial paragraphs
  body-md:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    use: Default paragraph, product descriptions
  label-sm:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    use: Card metadata, price display
  label-caps:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: 12px
    fontWeight: 700
    letterSpacing: 0.1em
    textTransform: uppercase
    lineHeight: 1.2
    use: Category labels, button text, section overlines — the signature "caps lock" UI signal
  label-caps-lg:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: 13px
    fontWeight: 600
    letterSpacing: 0.085em
    textTransform: uppercase
    lineHeight: 1.2
    use: CTA buttons, hero badges
  editorial-body:
    fontFamily: "EB Garamond, serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.7
    use: Journal articles, story pages — the reading voice
  quote:
    fontFamily: "EB Garamond, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.3
    letterSpacing: -0.01em
    use: Testimonial quotes, editorial pullquotes — italic EB Garamond for warmth

rounded:
  none: 0px
  sm: 2px
  lg: 4px
  xl: 8px
  full: 12px
  glass: 16px
  product-card: 12px

spacing:
  margin-mobile: 20px
  margin-desktop: 64px
  gutter: 24px
  section-gap: 120px
  section-gap-mobile: 80px
  card-stack: 20px

components:
  navbar:
    backgroundColor: transparent
    scrolledBackground: "rgba(255, 255, 255, 0.80)"
    scrolledBorder: "rgba(0, 0, 0, 0.04)"
    backdropFilter: "blur(24px) saturate(180%)"
    textColor: "{colors.body}"
    typography: "{typography.label-sm}"
    height: 64px
    heightDesktop: 80px
    maxWidth: 1440px
    paddingX: "{spacing.margin-mobile}"
    paddingXDesktop: "{spacing.margin-desktop}"

  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.xl}"
    padding: 16px 32px
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    opacity: 0.9
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.xl}"
    border: 1px solid "{colors.ink}"
    padding: 16px 32px
  button-secondary-hover:
    backgroundColor: "rgba(0, 0, 0, 0.05)"

  product-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.product-card}"
    overflow: hidden
    shadow: none
    transition: "transform 0.4s ease, box-shadow 0.4s ease"
  product-card-hover:
    transform: "translateY(-4px)"
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)"
  product-image-zoom:
    transition: "transform 0.7s ease-in-out"
    scale: 1.05
  quick-add-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.xl}"
    padding: 10px 20px
    transform: "translateY(100%)"
    transition: "transform 0.3s ease-in-out"
  quick-add-visible:
    transform: "translateY(0)"

  testimonial-card:
    backgroundColor: "{colors.surface}"
    border: 1px solid "{colors.border}"
    rounded: "{rounded.xl}"
    padding: 24px

  bento-tile:
    rounded: "{rounded.xl}"
    overflow: hidden
    gradient: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)"

  editorial-banner:
    backgroundColor: "{colors.surface-container}"

  glass-panel:
    backgroundColor: "rgba(255, 255, 255, 0.80)"
    backdropFilter: "blur(24px) saturate(180%)"
    rounded: "{rounded.glass}"
    border: "1px solid rgba(255, 255, 255, 0.18)"

  hero-section:
    minHeight: 100vh
    backgroundColor: "{colors.surface-container}"
    gradient: "linear-gradient(to bottom right, #e8e6e1, #d4d0c8)"

  footer:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.body}"
    typography: "{typography.fine-print}"
    columnGap: 48px

  search-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 12px 20px
    border: 1px solid "{colors.border}"

  mobile-menu:
    backgroundColor: "{colors.surface}"
    backdropFilter: "blur(24px)"

  newsletter-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 14px 20px
    border: 1px solid "{colors.border}"

---

## Overview

PEA_FITS is an Atelier Minimalist fashion e-commerce experience that balances **editorial warmth with functional clarity**. The interface alternates between expansive white editorial sections and intimate dark-atelier moments, anchored by two typographic voices: EB Garamond for classical editorial serenity, Hanken Grotesk for precise utility. Glassmorphism appears as a signature — the navbar transitions from transparent to a blurred frosted panel on scroll, floating utility panels sit above deep gradients, and the mobile menu floats like etched glass over content.

Every page is built as a stack of full-bleed sections — each with generous vertical rhythm (80–120px gaps) — unified by an 8px base spacing unit. Product photography is the primary content; UI chrome is minimal, borders are whisper-thin (`#e8e8e8`), and the only "weight" comes from the product card's hover lift (a `translateY(-4px)` paired with a soft shadow).

**Key Characteristics:**
- **Dual-typography philosophy:** EB Garamond (serif) for headlines, editorial quotes, and the voice of the atelier. Hanken Grotesk (sans) for body copy, labels, buttons, and all utility UI — a clean separation of editorial content from interface.
- **Glassmorphism as signature:** The navbar's scroll-state (white/80 blur), the floating mobile menu, and any overlay card use `backdrop-filter: blur(24px) saturate(180%)` with a translucent white background and a whisper border. This is the brand's material signature — not overused, but instantly recognizable.
- **Label-caps UI grammar:** Every button, category badge, section overline, and interface label uses `label-caps` — 12px / 700 / 0.1em tracking / uppercase. It's the consistent "caps lock" brand signal across all surfaces.
- **Monochromatic palette with a single editorial accent:** Pure black (`#000000`) for headlines and primary CTAs. Warm gray tones (`#5d5e60`, `#848484`) for body copy. Bone (`#fbfbfb`) and backgammon (`#f9f9f9`) for surfaces. And one editorial-red (`#ae0200`) reserved for moments of emphasis — sale markers, limited-edition badges, editorial highlights.
- **Product-first interaction design:** Cards lift on hover, secondary images crossfade in, quick-add buttons slide up from below — all micro-interactions serve product discovery, not decoration.
- **Generous whitespace as luxury signal:** 120px section gaps, 64px desktop margins, 24px card padding. Dense moments are deliberate and few — only the testimonial cards approach conventional SaaS density.
- **Gradient backgrounds are soft and editorial** — never brand gradients. The hero uses a warm neutral `to bottom right` fade, editorial sections use subtle `#f5f5f5` to `#f0f0f0`.

## Colors

> **Source surfaces analyzed:** homepage, product listing, product detail, navbar, footer, testimonials, bento grid, newsletter section.

### Brand & Accent

- **Ink Black** (`{colors.ink}` — #000000): The one brand color. Used for headlines, primary button fills, and all text that demands emphasis. Pure black, not near-black — this is a deliberate editorial choice that gives the brand its "inked" presence.
- **Editorial Red** (`{colors.editorial-red}` — #ae0200): The single accent color. Reserved for sale badges, limited-edition markers, editorial highlights, and error states. Used sparingly enough that it carries genuine signal weight.
- **Error** (`{colors.error}` — #ba1a1a): Form validation and system error states.

### Surface

- **Pure White** (`{colors.surface}` — #ffffff): Primary card and content surface. Product cards, testimonial panels, newsletter input, utility sections.
- **Bone** (`{colors.bone}` — #fbfbfb): The signature PEA_FITS off-white. Used for the footer background and secondary content zones. Nearly invisible difference from white, but perceptible as "warmer."
- **Background** (`{colors.background}` — #f9f9f9): The default page canvas. A warm light gray that keeps the page from feeling sterile. Appears as the background behind product grids and section containers.
- **Surface Container** (`{colors.surface-container}` — #eeeeee): Used for editorial banners, hero section backgrounds, and container fills. A step darker than background — creates subtle separation.
- **Glass White** (`{colors.glass-white}` — rgba(255, 255, 255, 0.80)): The translucent base of glassmorphism panels — navbar, mobile menu, floating utility cards. When paired with `backdrop-filter: blur(24px)`, it creates the signature frosted effect.
- **Glass Border** (`{colors.glass-border}` — rgba(0, 0, 0, 0.04)): The near-invisible border on glass panels. Barely perceptible as a line — it functions as a soft containment signal.
- **Overlay Dark** (`{colors.overlay-dark}` — rgba(0, 0, 0, 0.60)): The gradient overlay on bento tiles, ensuring white text readability against photography below.

### Borders & Hairlines

- **Border** (`{colors.border}` — #e8e8e8): The standard 1px border throughout the system — card borders, section separators, input outlines. Deliberately light to keep the page feeling airy.
- **Outlines** (`{colors.outline}` — #7e7576): Disabled-state borders and muted outlines.

### Text

- **Primary Text** (`{colors.ink}` — #000000): All headlines, button labels, product titles, navigation links, active/emphasized elements. The "ink" of the brand.
- **Body** (`{colors.body}` — #5d5e60): Default paragraph copy, card secondary text, footer body. A warm mid-gray that keeps body text from competing with headlines.
- **Muted** (`{colors.body-muted}` / `{colors.text-secondary}` — #848484): Fine print, placeholder text, secondary metadata, legal text. The quiet voice of the system.

### Brand Gradient

**No decorative CSS gradients in the traditional sense.** The hero section uses a warm editorial gradient (`#e8e6e1` to `#d4d0c8` — akin to warm parchment fading to aged stone), and editorial banners use subtle versions (`#f5f5f5` to `#f0f0f0`). These are not branded gradients — they're atmospheric foundations that photography sits on top of. The bento tiles use a functional `black/60` gradient overlay for text readability.

## Typography

### Font Family

- **Serif (Editorial Voice)**: `EB Garamond, serif` — the classical serif face of PEA_FITS. Used for all display headlines, section titles, editorial content, testimonial quotes, and the journal reading experience. Its elegant proportions and historical gravitas give the brand its atelier sensibility.
- **Sans (Utility Voice)**: `Hanken Grotesk, sans-serif` — a precise, modern sans-serif for body copy, labels, buttons, navigation, captions, and all functional UI. Its clean geometric forms contrast with EB Garamond's warmth, creating typographic tension that signals "This is content" vs "This is interface."
- **System Fallback**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` for the sans stack; `Georgia, "Times New Roman", serif` for the serif stack.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Family | Use |
|---|---|---|---|---|---|---|
| `{typography.display-lg}` | clamp(2.5rem, 5vw, 4rem) | 400 | 1.1 | -0.02em | EB Garamond | Hero headline, section title |
| `{typography.headline-lg}` | 32px | 400 | 1.2 | normal | EB Garamond | Section headings |
| `{typography.headline-sm}` | 20px | 600 | 1.3 | 0.05em | Hanken Grotesk | Product card titles |
| `{typography.body-lg}` | 18px | 400 | 1.6 | normal | Hanken Grotesk | Hero subcopy, editorial |
| `{typography.body-md}` | 16px | 400 | 1.5 | normal | Hanken Grotesk | Body paragraphs |
| `{typography.label-sm}` | 13px | 500 | 1.4 | normal | Hanken Grotesk | Card metadata, price |
| `{typography.label-caps}` | 12px | 700 | 1.2 | 0.1em uppercase | Hanken Grotesk | Buttons, badges, overlines |
| `{typography.label-caps-lg}` | 13px | 600 | 1.2 | 0.085em uppercase | Hanken Grotesk | CTAs, hero badges |
| `{typography.editorial-body}` | 18px | 400 | 1.7 | normal | EB Garamond | Journal, story articles |
| `{typography.quote}` | clamp(1.5rem, 3vw, 2.5rem) | 400 italic | 1.3 | -0.01em | EB Garamond | Testimonials, pullquotes |

### Principles

- **Serif headlines, sans utility.** EB Garamond at display sizes is the brand's editorial stamp — every headline, every section title, every product tile name. Hanken Grotesk handles everything below 20px. This separation is unbreakable.
- **Label-caps for all interface actions.** The signature "caps lock" grammar: buttons, category overlines, navigation badges, and section headers before content. 12px / 700 / 0.1em tracking / uppercase. It's the consistent UI voice across every surface.
- **Weight 400 as the editorial baseline.** EB Garamond headlines run at weight 400 — never bold, never light. The serif's own elegance provides the emphasis.
- **Weight 600 / 700 for sans hierarchy.** Hanken Grotesk uses 600 for card titles, 700 for label-caps. Weight 500 is used sparingly for card metadata.
- **Generous line-height on body copy.** 1.5 for body-md, 1.6 for body-lg, 1.7 for editorial-body — the extra leading gives the page an editorial, reading-friendly pace.
- **Negative letter-spacing only on EB Garamond display sizes.** The `-0.02em` tracking tighten on `display-lg` is subtle but critical — it keeps the serif from looking overly decorative at large sizes.
- **Italic EB Garamond for warmth.** Pullquotes, testimonials, and editorial asides use italic EB Garamond — the brand's "human voice" register.

### Note on Typographic Rhythm

The 16px body-md baseline (Hanken Grotesk, 1.5 line-height = 24px effective line) creates a crisp editorial grid. When paired with EB Garamond headlines that land at roughly 40–64px, the contrast between the two faces is immediately felt — the reader knows "this is a headline" before they read a word.

## Layout

### Spacing System
- **Base unit:** 8px. All structural spacing snaps to 8/16/20/24/32/48/64/80/120.
- **Section vertical rhythm:** `{spacing.section-gap}` (120px desktop, 80px mobile) between major sections.
- **Page margins:** `{spacing.margin-mobile}` (20px) on mobile, `{spacing.margin-desktop}` (64px) on desktop.
- **Card padding:** 24px for testimonial cards, product cards, utility panels.
- **Bento grid gap:** 20px (`gap-5` = 1.25rem).
- **Section container max-width:** 1440px (centered with margin auto).

### Grid & Container
- **Max content width:** 1440px for all page content. The hero spans full viewport width, with text constrained to ~1200px within it.
- **Column patterns:** 
  - Bento grid: 3-column desktop, 1-column mobile — one large hero tile (2×2) + two small tiles (1×1) + one landscape tile (2×1).
  - Product grid: horizontally scrollable row on homepage, column grid on shop page.
  - Testimonials: 4-column desktop → 2-column tablet → 1-column mobile.
  - Instagram feed: 4-column desktop → 2-column mobile.
- **Gutters:** 20px between cards (consistent with bento gap, product row gap).
- **Horizontal scroll on product rows:** Products on the homepage "Trending Now" section overflow in a horizontal scroll container — the scrollbar becomes a discovery affordance.

### Whitespace Philosophy

PEA_FITS uses whitespace as a luxury signal — the visual equivalent of a couture fitting room. Each section breathes with 120px of vertical padding. Product cards never sit closer than 20px apart. Headlines float above their content with at least 24px of air beneath them. The hero occupies a full viewport with generous padding. This is deliberate: the space around a product communicates its value as loudly as the product itself.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Hero sections, editorial banners, background sections |
| Hairline border | 1px solid `{colors.border}` | Testimonial cards, search input |
| Glassmorphism | `backdrop-filter: blur(24px) saturate(180%)` on `rgba(255,255,255,0.80)` base | Navbar scrolled state, mobile menu, floating panels |
| Card hover | `transform: translateY(-4px)` with `box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08)` | Product cards on hover |
| Image overlay | `linear-gradient(to top, rgba(0,0,0,0.6), transparent)` | Bento tile text readability |
| Gradient wash | `linear-gradient(to bottom right, #e8e6e1, #d4d0c8)` | Hero section foundation |

### Glassmorphism (Signature)

Glassmorphism is PEA_FITS's defining material treatment — not as a decorative gimmick, but as a functional depth layer.

**Implementation:**
```
background: rgba(255, 255, 255, 0.80);
backdrop-filter: blur(24px) saturate(180%);
-webkit-backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(0, 0, 0, 0.04);
```

**Where it appears:**
- **Navbar (scrolled):** The transparent navbar gains a frosted white glass layer as the user scrolls, ensuring readability over any content below while maintaining the page's continuous surface.
- **Mobile menu:** The full-screen mobile navigation uses glassmorphism as its backing — content beneath remains faintly visible, creating depth.
- **Floating action panels:** Add-to-bag bars, sticky checkout summaries, and overlay panels use glassmorphism to float above content without completely obscuring it.

**When it does NOT appear:** On cards, tiles, sections, or anything that should feel like "content." Glassmorphism is reserved for interface chrome that floats above content — never for content containers themselves.

### Shadow Philosophy

There is no default card shadow. Cards are flat by design — the only elevation comes on hover (product card lift) and through glassmorphism (scroll-state chrome). This is intentional: flat surfaces keep the page editorial and museum-like; elevation is a user-initiated response signal, not a default state.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Hero sections, editorial banners — full-bleed edges |
| `{rounded.sm}` | 2px | Inline image corners, small UI elements |
| `{rounded.lg}` | 4px | Rich text images, editorial blocks |
| `{rounded.xl}` | 8px | Buttons, testimonial cards, bento tiles, inputs — the standard UI radius |
| `{rounded.full}` | 12px | Newsletter input, search input — pill-shaped inputs for lighter feel |
| `{rounded.glass}` | 16px | Glassmorphism panels (a slightly softer radius for floating surfaces) |
| `{rounded.product-card}` | 12px | Product cards — slightly rounder than UI to feel more tactile |

### Photography Geometry

- **Product cards:** 1:1 aspect ratio image crops (square) inside a `{rounded.product-card}` container. Images fill the container's top portion; information sits below.
- **Hero:** Full-bleed rectangular imagery — no rounding on the hero section. The hero is a full-width, full-height canvas.
- **Bento tiles:** Square and landscape rectangles at `{rounded.xl}` (8px), with internal `black/60` gradient overlay for text.
- **Testimonial / utility cards:** `{rounded.xl}` (8px) with a thin border.
- **Input fields:** `{rounded.full}` (12px — pill shape) for the newsletter and search inputs, creating a softer, more inviting entry point.

## Components

### Top Navigation (Navbar)

**The signature glassmorphism element.** On page load: transparent background, dark text, no border. On scroll (> 40px): transitions to frosted glass — `rgba(255, 255, 255, 0.80)` background with `backdrop-filter: blur(24px)` and a 1px `rgba(0, 0, 0, 0.04)` bottom border. This transition is smooth (`transition-all duration-300`).

Structure (left to right):
- Mobile: hamburger icon (three 1px black lines, hidden on desktop)
- Desktop left: nav links — "Collections", "New Arrivals", "The Archive", "Journal" at `{typography.label-sm}`
- Center: `{SITE_NAME}` logo — "PEA_FITS" in `text-xl font-semibold tracking-tight`, centered on mobile, left-aligned on desktop
- Right cluster: Search icon → Wishlist icon → Cart icon (with badge count) → Profile icon

Height: 64px on mobile (`h-16`), 80px on desktop (`lg:h-20`).
Container: `max-w-[1440px]`, with `px-5 lg:px-16`.
Cart badge: Pure black circle (`bg-black`) with white text at `text-[10px]`, `w-4 h-4`.

Nav link active state: An `h-px` black underline `absolute -bottom-px` with `left-0 right-0`.

### Buttons

**`button-primary`** — The primary CTA. Background `{colors.ink}` (pure black), text `{colors.surface}` in `{typography.label-caps}` (12px / 700 / uppercase), rounded `{rounded.xl}` (8px — the signature PEA_FITS button shape — NOT a pill), padding 16px × 32px. Hover state: `opacity: 90` (system micro-fade). Active state: inherited press default from browser.

**`button-secondary`** — The alternative CTA, typically paired with primary. Background transparent, text `{colors.ink}`, 1px solid `{colors.ink}` border, rounded `{rounded.xl}`, padding 16px × 32px. Hover: `rgba(0, 0, 0, 0.05)` background fill.

**Label-caps as universal button grammar.** Every button, without exception, uses the `label-caps` token — 12px / 700 / 0.1em tracking / uppercase. The consistent typography makes any "clickable" element instantly recognizable.

### Product Cards

**Structure:** Image container (1:1 aspect ratio) on top → product name in `{typography.headline-sm}` → short description in `{typography.label-sm}` → price in `{typography.label-sm}` (bold weight).

**Hover interaction (3-part):**
1. Card lifts: `transform: translateY(-4px)` with `box-shadow: 0 12px 40px rgba(0,0,0,0.08)` — both at `transition: 0.4s ease`.
2. Image crossfade: Secondary product image fades in over primary at `opacity 0.5s ease-in-out`.
3. Quick-add button: Slides up from below at `transform: translateY(0)` from `translateY(100%)` at `0.3s ease-in-out` — appears as a small black pill button.

### Bento Grid Tiles

Large image-backed tiles at `{rounded.xl}` (8px) with `aspect-[4/5]` or `aspect-[16/9]`. Black/60 gradient overlay at the bottom (`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent`). Text at bottom: title in `text-lg font-semibold text-white`, subtitle in `text-sm text-white/80`.

### Testimonial Cards

White card (`bg-white`) with `{rounded.xl}`, 1px `{colors.border}` border, 24px padding. Five-star rating row in pure black. Italic EB Garamond quote at `text-sm` with `text-secondary`. Author and location at bottom, separated by a thin `border-t` with `{colors.border}`.

### Inputs

**`search-input`:** White background, `{typography.body-md}` (16px / 400), full pill (`{rounded.full}` at 12px), 1px `{colors.border}` border, 12px × 20px padding. Leading search icon.

**`newsletter-input`:** Same pill shape and border as search input, but with 14px vertical padding (slightly taller). Paired with a black submit button.

### Mobile Menu

Full-screen overlay triggered by hamburger. Background: glassmorphism (`bg-white/80 backdrop-blur-xl`). Links in `{typography.label-caps-lg}` (13px / 600 / 0.085em tracking / uppercase). Hamburger lines animate: top line rotates 45° and translates down (`rotate-45 translate-y-1`), middle line fades out (`opacity-0`), bottom line rotates -45° and translates up (`-rotate-45 -translate-y-1`). Body scroll locked when open.

### Testimonials

4-column grid of testimonial cards at `gap-5`. Cards are white, bordered, padded to 24px, with italic EB Garamond quotes, star ratings, and author/location attribution. The quote itself uses `text-sm text-secondary leading-relaxed italic mb-4`.

### Instagram / Social Grid

4-column grid of 1:1 squares at `gap-3 lg:gap-4`. Each tile is a rounded card with a neutral-100 background and a camera icon placeholder. Hover adds a `bg-black/10` overlay. Links to the PEA_FITS Instagram profile.

### Newsletter Section

Centered editorial section with serif headline, body subcopy, a pill-shaped input, and fine-print legal text. The input is paired with a black submit button in the standard `{typography.label-caps}`.

### Footer

Background `{colors.bone}` (#fbfbfb), text `{colors.body}` (#5d5e60). Column layout with heading links in regular weight, `font-medium` primary links, and copyright at the bottom. Three link columns: Shop (New Arrivals, Collections, The Archive, Accessories), Info (The Story, Sustainability, Shipping & Returns, Journal), Support (Contact Us, Size Guide, Privacy Policy). Social links (Instagram, Facebook, TikTok) at bottom right.

## Do's and Don'ts

### Do
- Use EB Garamond for every headline and section title — the serif voice is the editorial signature of the brand.
- Use Hanken Grotesk for all body copy, labels, and UI elements — the sans vs serif separation IS the typographic system.
- Apply `label-caps` (12px / 700 / 0.1em tracking / uppercase) to every button, badge, and section overline — this is the consistent UI grammar.
- Use glassmorphism (`bg-white/80 backdrop-blur-xl border-b border-neutral-100/50`) for the navbar on scroll and for floating interface chrome.
- Keep product cards flat by default — the hover lift (`translateY(-4px) + shadow`) is a response signal, not a persistent state.
- Use pure black (`#000000`) for headlines, primary buttons, and active elements — the "ink" of the brand.
- Space sections at 120px vertical padding — the generous whitespace IS the luxury signal.
- Keep the 8px-based spacing grid — structural consistency across all surfaces.
- Use `{rounded.xl}` (8px) as the standard button and card radius — this is the PEA_FITS corner shape.

### Don't
- Don't use buttons as full pills (9999px radius) — the PEA_FITS button shape is `{rounded.xl}` (8px). Full pills are reserved ONLY for search/newsletter inputs.
- Don't mix typographic families in headlines — everything editorial is EB Garamond, everything functional is Hanken Grotesk.
- Don't introduce a second accent color — pure black carries all primary action, editorial-red is the only accent and used sparingly.
- Don't add shadows to cards by default — shadow appears only on hover as an interaction response.
- Don't use glassmorphism on content containers — it's for floating interface chrome (navbar, mobile menu, sticky bars) only.
- Don't use EB Garamond for body copy on utility pages — it belongs on editorial surfaces (journal, story) and headlines only.
- Don't set button text at body size — all buttons use `label-caps` typography (12px uppercase).
- Don't tighten section gaps below 80px — the generous vertical rhythm is a brand identifier.
- Don't use decorative gradients — use the editorial warm-neutral gradient (`#e8e6e1 → #d4d0c8`) for the hero and subtle gray gradients for editorial sections only.
- Don't round full-bleed sections — the hero, editorial banners, and large background zones have `rounded-none`.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Small phone | ≤ 419px | Hero display-lg drops to 2.5rem; section-gap tightens to 80px; margin stays 20px |
| Phone | 420–640px | Single-column layouts; product row scrolls horizontally; bento goes 1-col |
| Tablet portrait | 641–833px | Global nav collapses to hamburger; testimonials go 2-column; 2-column product display |
| Tablet landscape | 834–1023px | Nav expands fully; bento grid activates at 3-col; 3-column testimonial layout |
| Small desktop | 1024–1279px | Full layout; 4-column social grid; 64px margins | 
| Desktop | 1280–1440px | Full layout at 1440px max-width; 4-column testimonials; everything at rest |
| Wide desktop | ≥ 1441px | Content locks at 1440px; margins absorb extra width |

Key breakpoints: 1440px (content lock), 1024px (desktop full layout), 834px (tablet landscape → portrait), 640px (phone), 420px (small phone).

### Touch Targets
- Minimum 44 × 44px for touch targets. Hamburger icon (`w-6 h-6` with 24px padding) lands at 44px effective.
- Nav icons (search, wishlist, cart, profile): 20px icon + 8px padding = 36px effective — acceptable on desktop, the mobile hamburger handles navigation at ≤ 833px.
- Buttons: minimum 44px height (16px padding × 2 + 12px label-caps = 44px).
- Product card images: full-width touch targets (tap any product to navigate).

### Collapsing Strategy
- **Global nav:** Full horizontal link row on desktop → hamburger + centered logo + right icon cluster at 833px and below. The hamburger toggles a full-screen glassmorphism overlay with vertical link list.
- **Hero section:** Full viewport on all sizes; typography scales down via clamp(); padding tightens from 40px to 28px on mobile.
- **Bento grid:** 3-column → 1-column. The large hero tile (2×2) becomes a full-width 4:5 tile on mobile.
- **Product rows:** Horizontal scroll remains on mobile with `-mx-5` offset for edge-to-edge feel.
- **Testimonials:** 4-col → 2-col (tablet) → 1-col (phone).
- **Social grid:** 4-col → 2-col (phone).

### Typography Responsive Behavior
- `display-lg`: `clamp(2.5rem, 5vw, 4rem)` — 40px at default, scales to ~56px at 1440px viewport, drops to 40px at 800px, holds at 40px below that.
- `headline-lg`: 32px fixed — does not scale.
- `body-md`: 16px fixed — does not scale.

## Animation Principles

- **Scroll-triggered glass transition:** Navbar shifts from transparent to frosted glass as the user scrolls past 40px (`transition-all duration-300`). This is the most visible animation on the page.
- **Product card hover trilogy:** Card lift (0.4s ease) + image crossfade (0.5s ease-in-out) + quick-add slide-up (0.3s ease-in-out) — three animations, three timing curves, one unified hover moment.
- **Image hover zoom:** `transform: scale(1.05)` at `transition: 0.7s ease-in-out` inside `overflow: hidden` containers. Used sparingly — editorial banners and large imagery only.
- **Hamburger → close animation:** Three lines animate into an X via rotation + translation at `duration-200`. Middle line fades out. Used on mobile menu toggle.
- **No page-load animations.** No scroll-reveal animations. PEA_FITS animates in response to user action (scroll, hover, tap), not on page load. The brand's editorial quality is immediate and static — animation serves interaction, not spectacle.

## Accessibility

- **Focus visible:** `outline: 2px solid var(--primary)` with `outline-offset: 2px` on all interactive elements. Focus ring uses pure black — consistent with the brand's single-color approach.
- **Skip to content:** Hidden skip-navigation link that becomes visible on keyboard focus.
- **ARIA labels on all icon buttons:** Every icon-only control (search, cart, hamburger, profile, wishlist) has an `aria-label`. The mobile menu toggle has `aria-expanded`.
- **Body scroll lock:** When the mobile menu is open, `document.body.style.overflow = "hidden"` prevents background scrolling.
- **Color contrast:** Pure black on white (21:1 ratio) for headlines. `#5d5e60` on white (5.5:1) for body — exceeds WCAG AA. `#848484` on white (3.5:1) for muted text — meets WCAG AA for large text only.
- **Heading hierarchy:** h1 → h2 → h3 structure is maintained throughout.

## Iteration Guide

1. Start with the typographic foundation: EB Garamond for headlines, Hanken Grotesk for UI. Every page must respect this separation.
2. Apply the spacing grid: 8px base, 120px section gaps, 64px desktop margins. Maintain generous whitespace.
3. Build the navbar as the glassmorphism anchor: transparent → frosted on scroll.
4. Use `label-caps` on every button — this is the most consistent identifier of PEA_FITS UI.
5. Keep cards flat; add hover elevation only as an interaction signal.
6. Use the warm editorial-neutral color palette (#fbfbfb, #f9f9f9, #eeeeee) for surfaces; pure black for emphasis; editorial-red sparingly for highlights.
7. When in doubt, remove chrome — the product photography and generous whitespace carry the brand.

## Known Gaps

- Product listing page (grid/filter) and product detail page (gallery/swatches) are documented in the codebase but their full responsive and hover state behavior should be extended from product card patterns documented here.
- Checkout flow and shopping cart are implemented but not fully analyzed for this design document — they primarily follow the same typographic and spacing system.
- Dark mode is not defined — the system is light-dominant by default.
- The admin dashboard follows utility patterns and uses the same Hanken Grotesk + label-caps grammar but surfaces are not documented here.
- Loading states and skeleton patterns are not formally documented — they inherit from the spacing and typography tokens.
- The exact `backdrop-filter` blur radius is `blur(24px)` in the current implementation; `saturate(180%)` is applied in the CSS filter stack for a more polished glass effect.
