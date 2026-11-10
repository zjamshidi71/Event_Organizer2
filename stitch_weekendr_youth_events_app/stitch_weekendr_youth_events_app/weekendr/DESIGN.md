---
name: Weekendr
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#4a4455'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#ae2f34'
  on-secondary: '#ffffff'
  secondary-container: '#ff6b6b'
  on-secondary-container: '#6d0010'
  tertiary: '#005766'
  on-tertiary: '#ffffff'
  tertiary-container: '#007184'
  on-tertiary-container: '#b7efff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#8c1520'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies the spontaneous energy, kinetic optimism, and curated clarity essential for Gen Z (16–24) social exploration. It balances two critical forces: the excitement of night-and-day weekend programming with the safety, utility, and absolute legibility needed for ticketing, travel, and verification.

### Design Principles
- **Vibrant Modernism:** Punchy accent hues anchored against crisp white and cool lavender surfaces. Never feels sterile or childish; avoids goofy illustration tropes in favor of crisp photography, high typographic authority, and deliberate whitespace.
- **Social Proof at a Glance:** The UI treats crowd density, attending peer networks, and organizer credibility as first-order visual artifacts across all discovery surfaces.
- **Fluid Ergonomics:** Optimized strictly for one-handed, thumb-first mobile scanning on crowded commutes, fast walks, and spontaneous night-out decisions.

## Colors

The palette establishes high contrast between deep slate content layers and an electric ultraviolet primary, punctuated by an urgent coral secondary for live countdowns, heat states, and high-impact calls to action.

### Palette Architecture
- **Primary (`#7C3AED` - Electric Violet):** Represents active exploration, verified event badges, primary interactive states, and highlighted category switches.
- **Secondary (`#FF6B6B` - Warm Coral):** Reserved strictly for ticket urgency badges ("Selling Fast", "Last 5 Spots"), saved hearts, and live active broadcasts.
- **Tertiary (`#06B6D4` - Electric Cyan):** Used sparingly for friend activity notifications, radar range indicators, and secondary metrics.
- **Neutrals & Surfaces:**
  - Base White: `#FFFFFF` (Primary card containers and elevated modal sheets)
  - Surface Tint: `#F8F9FC` (Default canvas canvas)
  - Surface Muted: `#F1F3F9` (Search bars, inactive pill chips, input fills)
  - Border Subdued: `#E2E6F0` (Hairline component separators and container outlines)
- **Text & Contrast Tiers:**
  - Ink Maximum: `#0F172A` (Headlines, primary metrics, high-emphasis icons)
  - Ink Subdued: `#334155` (Body copy, organizer meta, pricing labels)
  - Ink Tertiary: `#64748B` (Distance timestamps, inactive tab icons)

## Typography

The typographic strategy pairs the friendly geometric structural presence of Plus Jakarta Sans for titles and editorial framing with the precision data rendering of Inter for metadata tags, timestamps, and compact badge overlays.

- **Headlines:** Set heavy (`800` / `700`) with aggressive negative letter spacing to give event titles and weekend counts an immediate, poster-like impact.
- **Body:** Open and approachable, staying strictly within `14px`–`16px` for effortless legibility while moving.
- **Labels & Badges:** Rendered via Inter in medium-to-bold weights with slight tracking expansion to maintain instant recognition on thumbnail photos and colored badge surfaces.

## Layout & Spacing

A mobile-first fluid layout built on an 8pt base grid with a 4pt micro-increment for precision component packing (chips, badges, avatars).

- **Mobile (<640px):** Single-column fluid stream with `1rem` (16px) side margins and gutters. Horizontal carousels snap edge-to-edge with negative margin bleeds and `16px` lead padding.
- **Tablet / Large Handheld (640px - 1024px):** 2-column discovery card grid with `1.25rem` gutters and centered canvas capped at standard reading bounds.
- **Desktop / Web Preview (>1024px):** Centered app shell preview constrained to a maximum width of `480px` or full responsive 3-column organizer admin dashboards.
- **Safe Zones:** Always account for native mobile bottom home-indicators by reserving an added `1.25rem` clearance beneath fixed bottom nav components.

## Elevation & Depth

Visual depth is achieved through layered tonal surfaces, micro-borders, and colored ambient glows rather than dense, murky drop shadows.

- **Base Level (Canvas):** Colored `#F8F9FC`, creating a quiet contrast foundation for pure white floating cards.
- **Level 1 (Feed & Category Cards):** `#FFFFFF` surfaces paired with a crisp `1px` structural outline in `#E2E6F0` and an ultra-diffused ambient shadow: `0 4px 20px -2px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Floating Action Triggers, Pill Toggles & Badges):** High-contrast elements featuring a brand-tinted soft elevation: `0 8px 24px -4px rgba(124, 58, 237, 0.18)`.
- **Level 3 (Modal Sheets & Bottom Navigation):** Backdrop blur (`16px`) combined with semi-translucent white (`rgba(255, 255, 255, 0.88)`) and a direct top edge border in `#E2E6F0` for separation from scrolling media.

## Shapes

The design system implements a rounded, pill-forward visual language that communicates youthfulness, accessibility, and high touchability.

- **Primary Interactive Elements (Buttons, Filters, Segmented Toggles):** Full stadium pill geometry (`9999px` / `rounded-full`).
- **Cards & Media Viewports:** Deep curvature using `1.25rem` to `1.5rem` (`rounded-2xl` to `rounded-3xl`), framing dynamic nightlife and event photography with soft, tactile edges.
- **Status Badges & Overlays:** Medium pill curves (`rounded-full` or `rounded-lg` depending on information density).

## Components

### Event Cards
- **Structure:** Rounded container (`rounded-2xl`) housing a 4:3 or 16:9 aspect image top, wrapped with a 1px `#E2E6F0` border.
- **Badge Overlays:** Top-left stacked cluster with floating pill badges:
  - Price Tag: Dark slate background (`#0F172A`) with crisp white label text.
  - Verified Organizer: Electric Violet (`#7C3AED`) circular check icon badge.
  - Urgency Badge: Coral (`#FF6B6B`) background with white bold uppercase copy for limited availability.
- **Footer Meta:** Top-aligned title, date, distance tag ("1.2 mi away"), accompanied by a social avatar stack.

### Buttons & Interactive Controls
- **Primary CTA:** Full pill shape, filled with `#7C3AED` (Electric Violet), pure white text, active press-down scale transition (`scale(0.97)`).
- **Secondary CTA:** `#F1F3F9` background with `#0F172A` text, hover/active fill to `#E2E6F0`.
- **Pill Toggles & Chips:**
  - Inactive: `#FFFFFF` fill with `1px` `#E2E6F0` border and `#334155` text.
  - Active: `#7C3AED` solid fill with `#FFFFFF` text, elevated with a subtle primary glow.

### Social Avatar Stacks
- Overlapping circles (-8px offset) with a `2px` solid white stroke separator.
- Trailing count pill (`+12 friends going`) rendered in `label-sm` with `#F1F3F9` fill and `#334155` text.

### Bottom Tab Bar Navigation
- Fixed floating bar docked above the bottom safe area with an ultra-soft border and frosted glass backdrop (`rgba(255, 255, 255, 0.9)` + `backdrop-blur-md`).
- Active icons use `#7C3AED` with an anchored 4px micro-dot indicator below; inactive icons use `#64748B`.
- Integrated central discovery action button elevated slightly above the tab line in full Electric Violet.

### Input Fields & Search Bars
- Background set to `#F1F3F9`, borderless by default, expanding to a 1.5px `#7C3AED` outline when focused.
- Prefix icons (magnifying glass, location pin) styled in `#64748B`.