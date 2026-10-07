# Font licensing

| File | Family | Foundry / licence | Status |
|---|---|---|---|
| `Inter-Regular.woff2`, `Inter-Medium.woff2`, `Inter-Bold.woff2` | Inter | Rasmus Andersson — SIL OFL 1.1 | OK to self-host (same files as www.myastrazeneca.ch) |
| `aleo-latin-{300,400,700}-normal.woff2` | Aleo (declared as `Lexia-sub`) | Alessio Laiso — SIL OFL 1.1 | OK to self-host — metric-matched substitute for Lexia |
| `icomoon.woff` | icomoon | AstraZeneca's own icon font (from the source site) | owner asset |
| — | **Lexia** | Dalton Maag — commercial | **NOT shipped.** The source site's heading face. Every heading stack is `"Lexia", "Lexia-sub", serif`; adding a licensed Lexia `@font-face` to `styles/fonts.css` makes it win with no other change. |

Remove path: deleting the Aleo files and their `@font-face` rules falls back to `aleo-fallback` (Times New Roman, metric-adjusted) in `styles/styles.css`.
