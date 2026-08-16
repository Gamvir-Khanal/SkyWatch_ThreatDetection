---
name: SkyWatch Tactical Command
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#ff7a73'
  on-tertiary-container: '#79000e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-lg:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  data-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.05em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  grid-unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  component-gap: 8px
---

## Brand & Style

The design system is engineered for high-stakes tactical environments where precision, speed of information processing, and ocular endurance are paramount. It adopts a **Modern-Brutalist HUD** aesthetic, blending the efficiency of a terminal with the visual depth of a modern tactical dashboard.

The interface is designed to evoke a sense of absolute control and technological superiority. It utilizes a deep obsidian foundation to minimize eye strain in low-light environments, contrasted by high-frequency neon accents that signal system status and critical data points. The style is defined by "Data-Density," where every pixel serves a functional purpose, eschewing decorative fluff for technical clarity and atmospheric glow.

## Colors

The palette is strictly functional, adhering to military-standard signal conventions.

- **Background (Obsidian):** `#0b0f19` serves as the void. It provides the infinite depth required for high-contrast overlays.
- **Primary (Neon Emerald):** `#10b981` is reserved for "Active," "Safe," and "Confirmed" states. It should be used with a subtle outer glow (bloom) to simulate a phosphorescent display.
- **Secondary (Tactical Blue):** `#0ea5e9` handles information overlays and non-critical interactive elements.
- **Warning (Crimson):** `#ef4444` is used exclusively for alerts, threats, and destructive actions.
- **Neutral/Borders:** Grays are cool-toned to maintain the technical atmosphere.

## Typography

This design system uses **JetBrains Mono** exclusively to maintain a cohesive technical/monospaced aesthetic across all data points.

- **Headlines:** Use Bold weights with tighter letter spacing to create a high-impact, "header" feel.
- **Data Points:** Use Medium weight with increased letter spacing (`data-mono-lg`) for maximum legibility in high-density tables.
- **Labels:** Always use uppercase with wide tracking for categorized metadata.
- **Numerical Data:** Tabular figures must be enabled to ensure alignment in columns of fluctuating numbers.

## Layout & Spacing

The system follows a **strict 4px grid rhythm**, ensuring all components align to a technical matrix.

- **Grid System:** A 12-column fluid grid is used for the main dashboard. Each module (card) should sit on a background grid pattern of 24px increments.
- **Tactical Density:** Padding is intentionally kept tight (8px-12px within cards) to allow for the maximum amount of telemetry data to be visible on a single screen.
- **Breakpoints:** 
  - **Desktop (1440px+):** Full multi-pane dashboard layout.
  - **Tablet (768px-1439px):** Collapsed sidebars, focus on the primary tactical map.
  - **Mobile (<767px):** Single-column data feed; prioritize Warning Crimson alerts at the top of the stack.

## Elevation & Depth

In this design system, depth is communicated through **luminance and borders** rather than traditional shadows.

- **Tiers:** Surfaces are defined by increasing the lightness of the background color. 
  - Level 0: `#0b0f19` (Base)
  - Level 1: `#161b22` (Card surfaces)
- **Outer Glow:** Interactive elements in an "active" state utilize a `0px 0px 8px` drop shadow using their respective accent color (Emerald or Crimson) at 40% opacity to create a "lit" effect.
- **Glassmorphism:** Use only for temporary overlays (modals). Apply a 12px backdrop blur with a 10% opacity white tint to simulate a transparent cockpit glass interface.

## Shapes

The design system utilizes **Sharp (0px)** corners to reinforce the industrial, military-grade nature of the interface. 

- **Hard Edges:** All buttons, cards, and input fields must have a 0px radius.
- **Beveled Accents:** For secondary indicators, a 45-degree clipped corner (chamfer) may be used on the top-right of containers to suggest a "ruggedized" hardware feel.
- **Borders:** Use 1px solid borders for all containers. Avoid 2px+ borders except for active focus states to maintain a high-precision look.

## Components

- **Buttons:** Rectangular with 1px borders. Primary buttons use a solid Emerald background with black text. Ghost buttons use Emerald borders and text.
- **Status Chips:** Small, rectangular tags. Use "Pulsing" animations for Warning Crimson chips to indicate urgency.
- **Data Tables:** Row-based with 1px bottom borders. No vertical dividers. Every second row uses a 2% lighter background for scanability.
- **Inputs:** Underlined or fully boxed with 1px Neutral borders. On focus, the border transitions to Neon Emerald with a subtle glow.
- **Tactical Map:** The central component. It should use a de-saturated version of the primary palette, with high-saturation icons for "targets" or "assets."
- **Progress Bars:** Segmented into blocks rather than a solid fill to mimic legacy hardware displays.