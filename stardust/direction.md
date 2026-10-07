---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-07T11:04:09Z
  againstInput: https://www.myastrazeneca.ch
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.myastrazeneca.ch,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-10-07T11:04:09Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Hands-off record

- 2026-10-07T10:22:43Z — **Hands-off mode activated** by user choice ("Fully hands-off"). Flow: **replica** (same-design migration, keep current design) → migrate → rollout to AEM EDS / DA. Default caps: 100 pages overall, 20 per template. Quality gates unchanged.

## Named assumptions (hands-off)

- **A1 — Inconsistency register empty.** Hands-off policy adopts no audit findings; the user asked only to re-platform.
- **A2 — Lexia substitution.** Lexia is a licensed Dalton Maag face; it is not rehosted. Aleo (OFL) is the metric-matched substitute (width ratio 1.002–1.007), stack `Lexia, Aleo, serif` so AstraZeneca's licensed kit wins when supplied. Permanent justified font-fork residual.
- **A3 — Scope = public pages.** HCP-login-walled product pages are not migrated (no authentication). Live 404s (leberkrebs ×4, en haematologie) are not recreated.
- **A4 — Locales.** All four captured locale trees (de, fr, it, en) are migrated at their live paths.
- **A5 — Gate breakpoints** 1440 and 360 (replica default).
- **A6 — Live-probe pacing.** CloudFront WAF blocks bursts; every live instrument run is serialized with ≥8 s spacing.
