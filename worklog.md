---
Task ID: portfolio-website-v2
Agent: main (Super Z)
Task: Declutter the Hero section (remove overlapping elements) and add light/dark mode toggle to the existing portfolio.

Work Log:
- Refactored globals.css:
  * `:root` now defines a warm cream-paper light theme (oklch warm paper bg, deep ink foreground, darkened accents)
  * `.dark` defines the original obsidian dark theme with bright accents
  * Added `--surface`, `--surface-2`, `--hairline` tokens; aliased `--ink-900..500` → those tokens so all existing bg-ink-*/border-ink-* utilities are theme-aware
  * Added `--color-ink-*` and `--color-lime/magenta/cyan-acc/amber-acc/violet-acc` to `@theme inline` so Tailwind 4 gradient utilities (from-ink-*, via-ink-*) still resolve
  * Used `color-mix(in oklch, ...)` for glow utilities so they auto-adapt to per-theme accent values
- Created ThemeProvider (next-themes, attribute="class", defaultTheme="dark", no system)
- Created ThemeToggle: morphing sun/moon SVG, 8 animated sun rays, AnimatePresence for icon swap, hover halo. Uses useSyncExternalStore for SSR-safe mount detection (lint-clean)
- Added pre-hydration script in layout.tsx to prevent FOUC — reads localStorage('theme') and applies .dark class before paint
- Updated layout.tsx to wrap children in ThemeProvider
- Wired ThemeToggle into Navigation (desktop: between nav items and Available CTA; mobile: top-right of menu overlay)
- Refactored Hero (decluttered):
  * Removed the top center status bar that was overlapping the nav pill
  * Removed the bottom "SCROLL" text cue that was overlapping the metrics strip
  * Replaced triple radial-gradient mesh with a single soft central halo
  * Reduced from 3 morph blobs to 1 (right-side accent only)
  * Reduced grid opacity from 0.06 to 0.04
  * Moved location/availability into a left-side vertical meta strip (lg+ only) using writing-mode
  * Added a right-side vertical scroll indicator with animated lime progress line (lg+ only)
  * Made the bottom metrics strip a slim pill (single row, smaller text, hides labels on mobile)
  * Added pt-24 pb-32 to hero content so it never collides with nav or metrics
  * Replaced `text-ink-900` with `text-background` on lime CTA so button text stays legible on both themes
  * Reduced name clamp from 12vw → 11vw for slightly more breathing room
- Replaced `text-ink-900` in Contact CTA with `text-background`
- Updated page.tsx wrapper from `bg-ink-900` → `bg-background`
- Fixed Navigation color-mix-not-animatable warning by switching animated backgroundColor/borderColor to use `var(--surface)` and `rgba(0,0,0,0)` directly
- Browser-verified:
  * Dark mode (default): no overlap, nav at y=0-74, metrics at y=799-876 with 24px clearance, hero content centered with padding
  * Light mode: warm cream paper bg, dark ink text, darkened lime (#5fae1e) and other accents adapted, all 7 sections render
  * Theme toggle: clicks switch .dark class, persists across reload via localStorage
  * Mobile (iPhone 14): both themes, no horizontal overflow, mobile menu has its own ThemeToggle
  * Nav shrinks from 1100px → 720px on scroll as designed
  * Skill tab morphing still works in both themes
  * Lint clean (0 errors, 0 warnings)
  * Dev server healthy, no console errors (only the harmless useScroll position warning from framer-motion)

Stage Summary:
- Both themes render correctly with adapted accent palettes (bright accents on dark, darkened accents on light)
- Hero no longer has overlapping elements — the 4 overlapping layers (nav + status bar + scroll cue + metrics) are now: nav (top), hero content (centered with padding), metrics (slim bottom pill), location/scroll moved to vertical side strips
- ThemeToggle is a creative morphing sun/moon with animated rays
- All assets persisted in /home/z/my-project/screenshots/ for verification
- Lint: 0 errors
