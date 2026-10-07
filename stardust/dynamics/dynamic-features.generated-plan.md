<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-07T11:06:39.141Z · input stardust/current/_dynamics.json (7 pages, 21 findings) · target probe https://main--hlx-6--nishant-gupta.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-cms-app-settings-object-utag-data | A | CMS / app settings object utag_data | 7/7 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 2 | a-first-party-api-post-content-intelligentcontent-portals-hc | A | first-party API POST /content/intelligentcontent/portals/hcp/ch/de/startseite/therapiegebiete/ri/asthma/jcr:content.socialFeaturesPost.json | 1/7 (reach 1/121) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 3 | a-first-party-api-post-content-intelligentcontent-portals-hc | A | first-party API POST /content/intelligentcontent/portals/hcp/ch/de/startseite/produkte/jcr:content.socialFeaturesPost.json | 1/7 (reach 1/121) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 4 | a-cms-app-settings-object-cq | A | CMS / app settings object CQ | 1/7 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 5 | a-first-party-api-post-content-intelligentcontent-portals-hc | A | first-party API POST /content/intelligentcontent/portals/hcp/ch/de/startseite/contact-us/jcr:content.socialFeaturesPost.json | 1/7 (reach 1/121) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 6 | a-first-party-api-post-content-intelligentcontent-portals-hc | A | first-party API POST /content/intelligentcontent/portals/hcp/ch/de/startseite/produkte/trixeo/uberblick/jcr:content.socialFeaturesPost.json | 1/7 (reach 1/121) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 7 | a-first-party-api-post-content-intelligentcontent-portals-hc | A | first-party API POST /content/intelligentcontent/portals/hcp/ch/de/startseite/produkte/trixeo/ressourcen/copd-datenblatt-de/jcr:content.socialFeaturesPost.json | 1/7 (reach 1/121) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 8 | a-first-party-api-post-content-intelligentcontent-portals-hc | A | first-party API POST /content/intelligentcontent/portals/hcp/ch/de/startseite/therapiegebiete/cvrm/see-the-pattrns/home/jcr:content.socialFeaturesPost.json | 1/7 (reach 1/121) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 9 | d-first-party-data-file-get-content-intelligentcontent-porta | D | first-party data file GET /content/intelligentcontent/portals/hcp/ch/de/startseite/contact-us/jcr:content.getFormServices.json | 1/7 (reach 1/121) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 10 | d-first-party-data-file-get-content-intelligentcontent-porta | D | first-party data file GET /content/intelligentcontent/portals/hcp/ch/de/startseite/contact-us/jcr:content.getSecureCookies.json | 1/7 (reach 1/121) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 11 | f-form-text-search-text-box-no-action-js-wired-1-fields | F | form "text:search-text-box" → no action (JS-wired) (1 fields) | 7/7 | client-only | self | pending | client-compute | none |  |
| 12 | f-form-protection-captcha-antibot | F | form protection: captcha / antibot | 1/7 | rebuild-native | needs-backend | pending | forms | production backend (vendor form id + field mapping) |  |
| 13 | f-form-68885bab633ecb000237618d-no-action-js-wired-7-fields | F | form "68885bab633ecb000237618d" → no action (JS-wired) (7 fields) | 1/7 | client-only | self | pending | client-compute | none |  |
| 14 | i18n-locale-variants-en-fr-it-en-en | I18N | locale variants en,fr,it,en,en | 4/7 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 15 | i18n-locale-variants-fr-en-en-en-en | I18N | locale variants fr,en,en,en,en | 1/7 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 16 | i18n-locale-variants-en-en-en-en-en | I18N | locale variants en,en,en,en,en | 1/7 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 17 | i18n-locale-variants-fr-it-en-en-en | I18N | locale variants fr,it,en,en,en | 1/7 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 18 | t-unknown-third-party-host-rum-hlx-page | T | unknown third-party host rum.hlx.page | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 19 | t-unknown-third-party-host-policy-cookiereports-com | T | unknown third-party host policy.cookiereports.com | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 20 | t-tag-manager-tealium | T | tag manager: Tealium | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 21 | x-sign-in-account-links | X | sign-in / account links | 7/7 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 6 row(s) — read-settings, sheet-sync, client-compute.
- **One owner decision batch:** 14 row(s) — which tier for the target host; consumer on the migrated pages? · production backend (vendor form id + field mapping) · scope of the locale trees · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 8 of 2 probed API paths — the off-origin data work.

## Phases

- **off-origin data** — 6
- **locale wave** — 4
- **tags** — 3
- **detect** — 2
- **data** — 2
- **client tools** — 2
- **forms** — 1
- **register** — 1
