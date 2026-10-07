<!-- stardust provenance: skill=stardust:dynamics · phase=plan (curated, hands-off) · 2026-10-07 · reads stardust/dynamic-features.md -->
# Dynamic features — implementation plan (rollout D2)

Static first: every page ships as a working static page; these phases replace one degradation each.

| phase | rows | deliverable | authoring contract | verification (published origin, 1440 + 360) | effort |
|---|---|---|---|---|---|
| chrome | M-2, I-1, M-3 | header block: mega-menu dropdowns + mobile hamburger, language switcher from page alternates, search toggle; social-actions block with anonymous sign-in popup | nav fragment per locale (`/<lang>/nav`), footer fragment (`/<lang>/footer`); page metadata `languages` | dropdown opens/closes on click + keyboard; language links resolve; social click shows prompt | M |
| modal | M-1 | `hcp-gate` block: modal on load, *Ich bin Arzt/Ärztin* dismisses (localStorage, 120 min), *Ich bin Patient:in.* links out | block table: text + two button rows | modal visible on first load, gone after accept + reload, patient link href | S |
| tabs | M-4 | `tabs` block (client-only panels) | one row per tab: label · panel content | each tab switches panel; first tab active at load | S |
| forms | F-1 | `form` block, definition-driven (`/data/forms/contact-<lang>.json`), required validation, local-capture submit with "no backend connected" message, endpoint in `scripts/site-config.js` | `Source` row | empty submit refused; filled submit captured; no page errors | M |
| search | F-2 | header search → `/<lang>/startseite/search-result?q=`; `search-results` block over `/query-index.json` filtered by locale prefix | results page per locale | query "Asthma" returns the asthma page on /de/ | S |
| tags | T-1, T-2 | none (decided-out interim); footer "Cookie Regelung" keeps the policy link | — | link present | — |
