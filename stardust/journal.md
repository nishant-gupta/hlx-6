<!-- provenance: stardust master skill · journal (append-only) -->
# Journal — myastrazeneca.ch replica

## 2026-10-07T11:03:26Z — extract --prep --dynamics (replica Phase 1)

- **Prompt:** "migrate https://www.myastrazeneca.ch into DA using stardust" → user chose *keep current design* + *fully hands-off*.
- **Flow:** replica → migrate → deploy/rollout (no prepare-migration).
- **Captured:** 121 pages, 4 locales (de 44, fr 45, it 17, en 15). 7 templates: home, therapy-area, product-listing, contact, product-tab (TRIXEO), resource-detail (TRIXEO Ressourcen), pattrns (ATTR mini-site).
- **Findings:** CloudFront WAF IP-blocks bursts (≥6 parallel) for ~1–2 min → all live probes must be serialized and paced. Nav-linked product pages are HCP-login-walled → out of scope. PATTRNS pages show an HCP self-certification modal. Product cards are intentionally blurred for anonymous users.
- **Fonts:** Lexia (licensed) → substitute Aleo (OFL; width ratio 1.007/1.007/0.999 at 300/400/700), brand name first in stack. Inter self-hosted (OFL).
- **Open:** migration volume — 121 pages vs hands-off default cap 100 / 20 per template (decided at rollout).

## 2026-10-07T11:15Z — replica Phase 2 (preserve direction + dynamics gate)

- Promoted current PRODUCT/DESIGN/DESIGN.json verbatim to root; DESIGN.json added to .hlxignore (served otherwise).
- Inconsistency register: empty (pure replica, hands-off A1).
- Dynamics: 13 curated rows, all dispositioned. Hands-off decisions A-1…A-5 recorded in dynamic-features.md (anonymous social UI, contact form local-capture, query-index search, no CMP/Tealium on the new host, auth stays on live).
- New page discovered: the per-locale search-result page (not in sitemap) — needed as the search results target.

## 2026-10-07T13:00Z — replica Phases 3–4 (recreate + source-fidelity gate)

- 7 archetypes recreated as clean HTML/CSS (cumulative canon: canon.css + per-archetype files, shared site.js) and gated against live at 1440 + 360: pixel 0.25–2.59%, height Δ 0 everywhere, 0 structural 🔴. All approved under hands-off (`approvedBy: "hands-off"`).
- Instrument fixes (runs excluded from the cap, named in progress.json): cookie banner needs `#CookieReportsBannerAZ a.wscrOk`; gate.sh's build capture skipped overlay dismissal (prototype HCP modal measured) → round.sh captures both sides symmetrically.
- Font: Aleo with `size-adjust: 98%` (calibrated over all 420 site headings) gives Δ0 heights; 10px breadcrumbs stay ~3% (font-substitution residual — clears with a licensed Lexia).
- Interactions implemented only where observed: mega-menu click/columns, mobile drill-down, social sign-in popup (raw i18n key mirrored), sticky product tabs with reserved space, HCP gate (120 min), contact form local capture. Dead hovers left unimplemented.
- Product-listing used 4 rounds (cap 3): round 3 measured a self-introduced sticky-tab regression — logged.
- Source defects mirrored, not fixed: "requestToSignInContent" popup copy, Italian alt texts on DE pages, 404 links to leberkrebs, mobile CTA banner overflow.

## 2026-10-07 — replica Phase 5 (migrate → deploy → rollout, hands-off)

- **Importer:** one bundled import script (`tools/importer/import-myastrazeneca.js`). It maps each AEM leaf component to one EDS section or block and produced 125 pages plus the nav and footer fragments for all 4 locales. Five import runs; the final run is clean.
- **EDS gate (published regime, standards mode):** all 7 archetypes reach prototype ↔ EDS document Δ0 at 1440 and 360. Pixel against live: 0.27–2.57%, height Δ0 everywhere. Deploy-phase fixes from the instruments:
  - protected cards grouped (+813px);
  - in-flow right revision;
  - paywall padding (−70);
  - teaser body gap (+16/paragraph);
  - cards.two mobile gap;
  - empty-pretitle titles;
  - table wrapping;
  - root overflow clip.
- **Instrument fix:** the dev server serves content without a doctype, so every earlier local EDS number had been measured in quirks mode. The gate proxy now injects `<!DOCTYPE html>` as the published origin does. Excluded from the iteration cap.
- **Interactions:** 16/16 flows pass (HCP gate, mega-menu, burger, listing tabs + sticky, section tabs, form, accordion, Kaltura, social popup, languages, search).
- **Search (F-2):** the live search-result page (not in the sitemap) was fetched per locale. A new Search block reads the query-index and is scoped to the locale, with the live summary and no-results copy. The real index builds on publish.
- **Content count:** 121/125 pages ≥ 99% of source words, median 100%. The 4 contact pages are short only by non-authored form validation copy.
- **Media:** 31 image files had unsafe names (spaces, umlauts, no extension) and get URL-safe copies. One lowercase-collision trap (mortalität ≠ mortalitat) was caught by a byte comparison.
- **Hygiene:**
  - Lint is clean. Blocks were renamed BEM → kebab-case to meet the boilerplate pattern.
  - The descending-specificity waiver is recorded with its reason.
  - The design-hook font findings (icomoon, metric fallbacks) are intentional and left unchanged.
