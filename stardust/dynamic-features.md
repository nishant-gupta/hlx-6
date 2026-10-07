<!-- stardust provenance: skill=stardust:dynamics · phase=triage (curated, hands-off) · 2026-10-07 · input stardust/current/_dynamics.json (7 archetypes, 21 findings) + stardust/dynamics/dynamic-features.generated-plan.md + offline DOM reads of stardust/current/pages/*.html · target probe https://main--hlx-6--nishant-gupta.aem.page -->
# Dynamic features — www.myastrazeneca.ch

## Listings contract

none — the site has no index-fed listing blocks. The product-listing cards, therapy-area teasers and TRIXEO tab
bars are authored, fixed compositions (static content per page). The only index consumer is site search (F-2):
every page emits `title` + `description` metadata (already in the page head) and the default EDS
`/query-index.json` covers it per locale (`/de/`, `/fr/`, `/it/`, `/en/` path prefixes).

## Features

| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| M-1 | hcp-selfcert | HCP self-certification modal ("Die Inhalte dieser Webseite sind nur für medizinisches Fachpersonal…" · *Ich bin Arzt/Ärztin* closes · *Ich bin Patient:in.* → https://www.amyloidose-schweiz.ch/) | M | 15/121 (PATTRNS, de/fr/it) | rebuild-native | self | verified (local EDS: shown → confirm → persists) | modal (client state) | — ; live `data-expiry-time="120"` → remember the choice 120 min in localStorage | `.cmp-selfcertification.modal--visible` in captured DOM |
| M-2 | megamenu | Header mega-menu: "Unsere Arzneimittel" (3 TA columns × indications × products) + "Therapiegebiete" dropdowns; hamburger at mobile | M | 121/121 | rebuild-native | self | verified (click open, Escape close, mobile burger) | chrome interaction | — | `.megaMenu` DOM in every capture |
| M-3 | social-features | Like / Share / Save icons. Anonymous state (`data-user-signed-in="false"`, share not allowed anonymous) → click shows the "sign in" prompt popup; counts and persistence need the AEM user service | M + A | ~110/121 | rebuild-native (anonymous prompt) · counts decided-out | self (UI) · needs-backend (counts) | verified (anonymous sign-in popup) | modal | owner: user/favorites service on the new host → **A-1 hands-off: anonymous-only UI** | `.cmp-socialFeatures__base`; POST `…jcr:content.socialFeaturesPost.json` → 404 on target (host-bound) |
| M-4 | listing-tabs | Product-listing in-page tabs (CVRM / Atemwege & Immunologie / Onkologie & Hämatologie) switching card panels | M | 4/121 | client-only | self | verified (tab switch + sticky) | tabs | — | `.cmp-tabs` on produkte.html |
| M-5 | section-tabs | TRIXEO + PATTRNS tab bars — plain links to sibling pages with the active tab underlined | M | 31/121 | static-snapshot | self | delivered-by-capture | links | — ; reason: no client behaviour, links only | tab anchors carry hrefs |
| F-1 | contact-form | Contact form (firstName*, lastName*, email*, areaOfInterest* (9 options), enquiryText, termsAndConditions*, privacyPolicy*) + reCAPTCHA, posted by the AEM dynamicformv2 service | F | 4/121 (de/fr/it/en) | rebuild-native | needs-backend | verified interim (required errors, local capture + notice) | forms (definition-driven block) | owner: production intake endpoint (AEM forms service id per locale) → **A-2 hands-off: DA content source has no intake → local capture with explicit "no backend connected" message; endpoint configurable in `scripts/site-config.js`** | definitions `stardust/dynamics/forms/contact-{de,fr,it,en}.json`; `getFormServices.json` 404 on target |
| F-2 | site-search | Header search box (`data-global-search="getsearchresults.json"`, index `hcp-switzerland-<lang>-prod-live`) + `/…/search-result.html` results page (not in sitemap, 200 live) | S | 121/121 | index-backed | self | verified interim (results page + Search block over query-index; real index builds on publish) | search (query-index + results block) | owner: keep vendor search index? → **A-3 hands-off: EDS query-index per locale; results page created at `/<lang>/startseite/search-result`** | `.cmp-searchbox` in every capture |
| I-1 | locales | Language navigation DE / EN / FR / IT (per-page alternates; EN tree partial, FR/IT TRIXEO partial) | I18N | 121/121 | rebuild-native | self | verified (4 locale links 200) | locale-tree | locale scope → **A-4 hands-off: all four captured trees migrate at live paths; switcher shows only languages the live page lists** | `.cmp-languagenavigation` |
| T-1 | consent | Cookie consent (CookieReports banner + "Cookie Regelung" footer link opening the panel) | T | 121/121 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | owner: CMP property id for the new host → **A-5 hands-off: CMP not loaded on the EDS host (no tags run, so no consent needed); footer link kept, pointing to the policy URL `//policy.cookiereports.com/b50c8635-de-ch.html`** | policy.cookiereports.com |
| T-2 | tealium | Tealium tag manager (`utag_data` settings object) | T + A | 121/121 | decided-out (interim) | needs-business-decision | decided-out | consent-gated-tags | owner: Tealium profile for the new host → **A-5** | tags.tiqcdn.com |
| T-3 | rum | rum.hlx.page | T | 121/121 | embed-passthrough | self | delivered-by-capture | — | — ; Edge Delivery's own RUM, native on the target | rum.hlx.page |
| A-2 | aem-settings | CQ / page settings objects | A | 7/7 | decided-out | self | decided-out | — | — ; AEM-runtime internals, no consumer on EDS | `CQ`, `utag_data` globals |
| V-1 | kaltura-video | PATTRNS "about" Kaltura player (partner 432521, uiconf 30358591, entry 1_7kar7zpp) behind a poster | V | 3/125 (PATTRNS about, de/fr/it) | embed-passthrough | self | verified (click mounts the cdnapisec.kaltura.com iframe) | media (poster + click-to-load) | — ; Kaltura account stays the owner's | `.cmp-video[data-video-id]` |
| X-1 | auth | Anmelden / Registrieren / login-walled product links / paywall CTAs | X | 121/121 | decided-out | needs-backend | decided-out | — | owner: HCP identity on the new host | `/de/user/login.html` |

## Decision batch (one message to the owner — recorded under hands-off, interim tiers shipping)

1. **Contact intake (F-1):** which endpoint receives submissions on the new host (AEM forms service id per locale, or a relay)? Interim: local capture + "no backend connected" notice. Not `regulated-pii` (name + e-mail + free text only).
2. **Search (F-2):** keep the vendor index `hcp-switzerland-<lang>-prod-live` or accept the EDS query-index? Interim: query-index.
3. **Consent + tags (T-1, T-2):** CookieReports + Tealium property ids for the new domain. Interim: neither runs.
4. **Identity (X-1, M-3 counts):** HCP login / registration / favorites on the new host. Interim: links keep pointing to the live login (`https://www.myastrazeneca.ch/<lang>/user/login.html`), social icons show the anonymous sign-in prompt.

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| HCP login, registration, gated product pages | session-bound identity service on the AEM origin | "Anmelden"/"Registrieren" link to the existing myastrazeneca.ch login until an identity service exists on the new host |
| Social counts / favorites persistence | needs the AEM user service (`socialFeaturesPost.json`, host-bound) | icons render; anonymous users get the sign-in prompt, as on live |
| Tealium analytics | tag profile is domain-bound; owner decision | no analytics tags on the EDS preview host; RUM only |
| AEM CQ / utag_data settings globals | runtime internals | no consumer on the migrated pages |
