---
name: MyAstraZeneca Schweiz
description: Information portal for healthcare professionals in Switzerland (captured current state)
_provenance:
  writtenBy: stardust:extract --prep
  writtenAt: 2026-10-07T10:55:00Z
  againstInput: https://www.myastrazeneca.ch
  mode: descriptive
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/replica/lift/*.json (7 archetypes x 1440/360 computed styles)
    - stardust/current/assets/css/* (live stylesheets)
colors:
  plum: "#830051"
  plum-deep: "#4F0031"
  magenta: "#D0006F"
  gold: "#F0AB00"
  sage: "#9DB0AC"
  graphite: "#3C4242"
  mist: "#EBEFEE"
  white: "#ffffff"
  border-soft: "#D8DFDE"
  border-grey: "#D8DADA"
  placeholder: "#B2B4B4"
  label: "#656969"
  label-light: "#8D8F8F"
  breadcrumb-muted: "#A9A9A9"
  magenta-tint: "#E366A9"
  table-highlight: "#E6CCDC"
typography:
  display-xl:
    fontFamily: "Lexia, Aleo, serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: "60px"
    letterSpacing: "normal"
  display-l:
    fontFamily: "Lexia, Aleo, serif"
    fontSize: "46px"
    fontWeight: 400
    lineHeight: "50px"
  title:
    fontFamily: "Lexia, Aleo, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: "40px"
  card-title:
    fontFamily: "Lexia, Aleo, serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: "34px"
  nav:
    fontFamily: "Lexia, Aleo, serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "16px"
  lang:
    fontFamily: "Lexia, Aleo, serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: "12px"
  body:
    fontFamily: "Inter-Regular, Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  lede:
    fontFamily: "Inter-Regular, Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
  small:
    fontFamily: "Inter-Medium, Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "20px"
  button:
    fontFamily: "Inter-Bold, Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
rounded:
  button: "4px"
  card: "8px"
spacing:
  gutter-desktop: "130px"
  container: "1180px"
  section-md: "40px"
  stack: "16px"
  card-pad: "24px"
components:
  button-primary:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.magenta}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  button-login:
    backgroundColor: "{colors.white}"
    textColor: "{colors.magenta}"
    typography: "{typography.small}"
    rounded: "{rounded.button}"
    padding: "6px 16px"
  teaser-card:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: MyAstraZeneca Schweiz

## Overview

A restrained corporate-pharma system built on AEM core components (teaser, title, text, tabs, breadcrumb, container)
with the `wese-hcp-portal-v1` theme. White canvas, a 1180px centered container (130px gutters at 1440), plum Lexia
headings, graphite Inter body copy, magenta for every interactive affordance. Imagery is full-bleed photographic
banners and medical illustration crops.

## Colors

### Primary
- **Plum `#830051`** — page and section titles (`--textColor-title-1`).
- **Magenta `#D0006F`** — buttons, active nav/tab/breadcrumb item, active language, links in forms (`--textColor-interaction`).

### Secondary
- **Plum deep `#4F0031`**, **Gold `#F0AB00`**, **Sage `#9DB0AC`** — background accents carried as theme tokens; the gold and lime/sage appear mostly inside raster teaser images.

### Neutral
- **Graphite `#3C4242`** body text, **Mist `#EBEFEE`** card surfaces / bands / 1px header & footer rules, **White** canvas.

## Typography

Headings: **Lexia** (Dalton Maag, licensed; weight 400 only). Body/UI: **Inter** served as three separate families
`Inter-Regular`, `Inter-Medium`, `Inter-Bold` (all computed `font-weight: 400`; the boldness is in the face).
Global text rendering is browser default (`text-rendering: auto`, `font-synthesis: weight style small-caps`).

### Hierarchy
- Hero title 56/60 white (36/40 at mobile) · page title 56/60 plum · section title 36/40 plum (26/34 mobile) ·
  intro title 46/50 plum · card title 26/34 graphite, centered · nav 14/16 · language 10/12 uppercase underlined ·
  body 16/24 · hero lede 18/28 · references / meta 12/20 Inter-Medium · superscripts 10px.

## Layout

Language bar (29px, 1px #EBEFEE top rule, right-aligned) → header (57px, 10px block padding, 1px rules) →
breadcrumb (Lexia 14/16, play-icon separators; 10/18 at mobile) → hero teaser (full-bleed, ~245px home) → 1180px
container with 40px vertical section rhythm → footer (40px padding, 1px top rule; logo + disclaimer column, two link
columns at 34% with ~141px left padding). Three-up card rows use `calc(33.33% - 6.67px)` with a 10px gap.
Mobile (360): single column, 20px side padding, mega-menu collapses to a hamburger.

## Elevation & Depth

Flat. No shadows on cards or buttons; depth comes from Mist surfaces and photography. Modals use a graphite
(`#3C4242`) backdrop.

## Shapes

4px radius on buttons and the login button, 8px on teaser cards (image clipped by the card radius). Inputs are
square-ish with 1px borders.

## Components

### Buttons
Primary: magenta fill, white Inter-Bold 16/24, 8px 16px padding, 1px magenta border, 4px radius. Secondary: white fill,
magenta text + border. Header "Anmelden": 6px 16px, Inter-Medium 12/20.

### Cards / Containers
Teaser card: image top (156px at desktop for the home TA cards), Mist content panel, 24px padding, centered text,
16px gap, 8px radius. Stat cards on disease pages reuse it with blue gradient icon images.

### Navigation
Mega-menu with two dropdowns ("Unsere Arzneimittel", "Therapiegebiete") plus a direct link; search icon; tabs with a
magenta active underline (TRIXEO, product listing, PATTRNS).

### Paywall band
Full-width Mist band, centered plum Lexia 26/34 two-line question, primary "Registrieren" + secondary "Anmelden".

## Do's and Don'ts

### Do:
- Keep approval codes, revision dates and references exactly where the source puts them.
- Use magenta only for interaction; plum only for titles.

### Don't:
- Don't add shadows, gradients or rounded-pill buttons — the system is flat with 4px/8px radii.
- Don't re-host Lexia; it is a licensed face.
