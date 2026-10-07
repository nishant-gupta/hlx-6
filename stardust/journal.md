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
