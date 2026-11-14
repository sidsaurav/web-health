# AfterFees — Seller & Payment Fee Calculators: Complete Build Specification

> **Purpose of this document.** A self-contained handoff spec for an AI coding agent (e.g. Claude Code) to build, test and ship a complete static website of fee calculators for online sellers (eBay, Etsy, Depop, Poshmark, Mercari, Whatnot, Grailed …) and payment processors (Stripe, PayPal, Square, Venmo, Cash App …). Read it fully before writing code. It contains goals, research data, scope, stack and exact versions, file structure, design system, the fee engine, every calculator component, every page (titles, meta descriptions, keywords, outlines, FAQs), the **current fee schedules with their official sources and verification status**, SEO, AdSense, testing, deployment and acceptance criteria.
>
> **Prepared:** 2026-11-14 · **Market:** United States (English, USD) · **Keyword data:** OpenSEO (DataForSEO) — US monthly search volume, keyword difficulty (KD 0–100), cost-per-click (CPC, USD) · **Fee data:** official platform pages read on 2026-11-14 (see Appendix A for exact sources and status).

---

## Table of contents

0. [Instructions for the builder agent](#0-instructions-for-the-builder-agent)
1. [Project summary](#1-project-summary)
2. [Research context](#2-research-context)
3. [Scope and phasing](#3-scope-and-phasing)
4. [Tech stack, versions and hard constraints](#4-tech-stack-versions-and-hard-constraints)
5. [Project structure](#5-project-structure)
6. [Configuration and environment variables](#6-configuration-and-environment-variables)
7. [Design system](#7-design-system)
8. [Site-wide layout and shared UI](#8-site-wide-layout-and-shared-ui)
9. [Fee engine specification](#9-fee-engine-specification)
10. [Calculator UI components](#10-calculator-ui-components)
11. [Page specifications](#11-page-specifications)
12. [Trust, legal and utility pages](#12-trust-legal-and-utility-pages)
13. [Technical SEO specification](#13-technical-seo-specification)
14. [AdSense and monetisation](#14-adsense-and-monetisation)
15. [Performance, security headers, hosting and deploy](#15-performance-security-headers-hosting-and-deploy)
16. [Testing specification](#16-testing-specification)
17. [Content writing rules](#17-content-writing-rules)
18. [Fee data maintenance process](#18-fee-data-maintenance-process)
19. [Build milestones](#19-build-milestones)
20. [Definition of done](#20-definition-of-done)
21. [Post-launch checklist (for the human owner)](#21-post-launch-checklist-for-the-human-owner)
22. [Known gotchas](#22-known-gotchas)
- [Appendix A — Fee schedules, sources and verification status](#appendix-a--fee-schedules-sources-and-verification-status)
- [Appendix B — Golden test cases](#appendix-b--golden-test-cases)
- [Appendix C — Full keyword data](#appendix-c--full-keyword-data)
- [Appendix D — Competitor and SERP data](#appendix-d--competitor-and-serp-data)
- [Appendix E — Reference algorithms](#appendix-e--reference-algorithms)

---

## 0. Instructions for the builder agent

1. **Read the whole document first**, then create a task list from [§19](#19-build-milestones) and work through it in order.
2. **Where to build:** a new folder `fee-calculator-site/` at the root of the current repository (unless the user names another repository). Touch nothing outside it except an optional CI workflow (§15.5).
3. **Fee accuracy is the product.** Every number in Appendix A carries a status:
   - `VERIFIED` — read on the official page on 2026-11-14 (quote + URL given). Use as-is, but re-open the URL once during Milestone 1 and confirm nothing changed.
   - `PARTIAL` — official source found but a detail is ambiguous or conflicting. You must open the listed URL(s) and resolve it; record the resolution and quote in `DECISIONS.md` and in the schedule's `sources[].quote`.
   - `UNVERIFIED` — from secondary sources or old pages. You must verify against the official page before shipping that calculator. If you cannot verify (page blocked/login), ship the calculator **only** with the affected fee as a user-editable input pre-filled with the best-known value and a visible "Confirm this rate on {platform}'s fee page" note — or move the page to a later phase. Never present an unverified number as fact.
   Use Playwright (already a dev dependency) to render JavaScript-heavy official pages when a plain fetch returns an empty body.
4. **Do not ask questions unless truly blocked.** Every decision has a default here. Record any decision not covered by this spec in `fee-calculator-site/DECISIONS.md`.
5. **Commit after each milestone.** From Milestone 3 onward run the full test suite before every commit. Never weaken or skip a test to make it pass.
6. **Content matters.** Hand-written sections must meet the word counts and honesty rules (§11, §17). Programmatic sections (worked-example tables, fee tables) are generated from the same engine the calculators use.
7. **No placeholders in the final build** except env-driven ones (AdSense IDs, contact email, Search Console token) and clearly marked owner fields (author name, jurisdiction).
8. **Finish with a report:** what was built, `npm test` summary, fee verification results (which `PARTIAL`/`UNVERIFIED` items you resolved, how), anything not done and why, and exact deploy commands.

---

## 1. Project summary

| Item | Value |
|---|---|
| Brand | **AfterFees** — tagline "Know what you keep after fees." |
| Domain (unregistered as of 2026-11-14, Verisign RDAP) | **`afterfeescalc.com`** — alternatives: `netofees.com`, `feesplained.com`, `marketfeecalc.com`, `sellnetcalc.com`, `processorfeecalc.com`. **Avoid `sellfeecalc.com`** (confusingly close to competitor `sellerfeecalc.com`) |
| What it is | Fast, private, accurate fee & profit calculators for marketplace sellers, resellers, creators and small businesses, with side-by-side comparisons and "what should I charge?" reverse modes |
| How it works | 100% client-side static site. Fee schedules are typed data in the repo with official sources and verification dates. No backend, no accounts, no external APIs |
| Monetisation | Google AdSense (US traffic). This niche has the highest CPCs in our research: $4–$68 per click on core terms |
| Framework | Astro (static), vanilla TypeScript, plain CSS |
| Pages | ~45 at full scope: home, 2 hubs, 14 marketplace calculators, 12 payment calculators, 7 comparison pages, 2 vehicle-auction calculators (phase 3), trust/legal pages |
| Biggest keyword | `ebay fee calculator` — 40,500 US searches/month, KD 16, CPC $7.74 |

### Goals (priority order)
1. **Correct numbers.** Every calculator matches the platform's published rules, with the source and "verified on" date visible on the page.
2. **Most useful page for each query:** calculator above the fold, full breakdown of every fee line, profit/margin, reverse "price to charge" mode, comparison with other platforms, clear explanation of how the fee works.
3. Fast, accessible, mobile-first.
4. Clean technical SEO; AdSense-ready layout that never interferes with inputs/results.
5. Comprehensive automated tests, including golden fee cases and freshness checks on fee data.

---

## 2. Research context

### 2.1 Why this niche
- **Volume × CPC is the best of all 7 categories researched.** eBay fee calculator alone is 40,500/mo at $7.74 CPC; payment-processor terms run $10–$68 CPC (Stripe Connect fees $67.58, Stripe invoice fee $55.71, TikTok Shop fees $51.23, Stripe ACH fee $32.10, Toast processing fees $28.20, Clover fees $23.36, Venmo business fee $21.63, Stripe fee calculator $19.66, PayPal goods and services fee $16.26).
- **Repeat use:** resellers price every item, so returning visitors and multiple calculations per visit are likely.
- **SERPs are churning:** most results are 2025–26 micro-sites, lead-magnet side pages of SaaS companies (listing tools, payment startups), app-store pages, Reddit/Facebook posts and even a vibe-coded `lovable.app` subdomain ranking #2 for "poshmark fees". No stable multi-platform authority owns the space.

### 2.2 Competitors to beat (measured where noted)
| Competitor | Notes |
|---|---|
| `ebayfeescalculator.com` | Exact-match, ~706 referring domains (mixed quality), #1 for "ebay fee calculator", also ranks #2 for "square fee calculator" — the main multi-platform rival |
| `sellerfeecalc.com` | Multi-platform reseller calculators, 78 referring domains, launched mid-2026; #3 for "depop fee calculator", ranks for "poshmark fees" |
| `resellerworkbench.com` | 10 referring domains, reached #1 for "ebay fee calculator" in one read |
| `whatnotfeecalculator.com` | Exact-match, 75 (mostly spam) referring domains, #2 for "whatnot fee calculator" |
| `chargeflow.io`, `novo.co`, `bluevine.com`, `nerdwallet.com`, `depositfix.com` (1,038 RD), `renlar.com` (266 RD) | Fintech/SaaS lead-magnet calculators for Stripe/PayPal/Square/Etsy — side pages, not focused brands |
| Official pages | stripe.com/pricing, squareup.com calculator, ebay.com help, clover.com, iaai.com, copart.com |

### 2.3 Differentiators (build these — they are the competitive gap)
1. **Every fee line itemised** with its formula ("13.6% of $118.80 = $16.16").
2. **Verified fee data with visible source links and dates**, plus a public fee-change log.
3. **Reverse mode** on every calculator: "I want to receive $X / make $Y profit → list at $Z" (handles thresholds correctly).
4. **Compare mode:** same item across all marketplaces (or all processors) in one table.
5. **Programmatic worked-example tables** ("Fees on a $10 / $25 / $50 / $100 / $250 / $500 sale") generated from the engine.
6. Fast, ad-light, private (no sign-up, nothing stored server-side).

### 2.4 Realistic targets
- Low-KD platform pages (Depop, Poshmark, Mercari, Whatnot, Grailed, Square, Venmo, Cash App, Stripe, comparison pages): top 3 within ~3–6 months.
- eBay fee calculator (KD 16, strong exact-match rival): top 5 within ~6 months; the hub of the site.
- PayPal fee calculator (KD 32) and PayPal goods-and-services fee (KD 30): stretch targets, still worth building ($8–16 CPC).

---

## 3. Scope and phasing

### 3.1 Phase 1 — launch (build first; must be complete for "done")
| Group | Pages |
|---|---|
| Core | Home (compare tool + directory), Marketplace fees hub, Payment processing fees hub |
| Marketplaces | eBay fee, eBay profit, Etsy, Depop, Poshmark, Mercari, Whatnot, Grailed |
| Payments | Stripe, PayPal, PayPal Goods & Services, Square, Venmo, Venmo instant transfer, Cash App |
| Comparisons | Depop vs Poshmark, Square vs Stripe fees |
| Trust/legal | How we verify fees, Fee updates log, About, Privacy, Terms, Contact, 404 |

### 3.2 Phase 2 — also part of this build (do after Phase 1 is green)
| Group | Pages |
|---|---|
| Marketplaces | Facebook Marketplace, TikTok Shop, StockX, Reverb, TCGplayer, KDP royalty |
| Payments | Stripe ACH, Stripe invoice, Stripe Connect, Clover, Credit card processing (any provider / surcharge) |
| Comparisons | Stripe vs PayPal fees, Poshmark vs Mercari, eBay vs Mercari, eBay vs Poshmark, Whatnot vs eBay |

### 3.3 Phase 3 — only if fee tables can be verified (otherwise leave a TODO in README)
Copart fee calculator (4,400/mo, KD 0) and IAA fee calculator (1,300/mo, KD 0). Their buyer-fee tier tables are large, change periodically, and are JavaScript-rendered (Copart) or embedded as images (IAA). Build only if you can transcribe the complete current tables from the official pages (use Playwright rendering; IAA's tables are SVG images — check whether the SVG contains text nodes) and record exact sources. Otherwise skip.

### 3.4 Out of scope (do NOT build) — with reasons
| Excluded | Reason |
|---|---|
| Amazon FBA fee calculator | KD 24, very complex size-tier/fulfilment tables that change often; heavy maintenance |
| GunBroker fee calculator | Firearms-related content risks AdSense policy issues |
| Shopify payments, Zelle, Apple Pay, Walmart, OfferUp, GOAT, Vinted pages | Too little US volume, high KD, or no seller fees to calculate |
| Freelance hourly-rate, SaaS churn/MRR/LTV calculators | High CPC but almost no search volume (< 400/mo) |
| Prorated rent / overtime / markup calculators | Different audience; good for a separate "landlord/business tools" site later |
| Any backend, accounts, saved history, live fee scraping at runtime | Not needed; static data + maintenance process instead |

---

## 4. Tech stack, versions and hard constraints

### 4.1 Versions (checked against npm on 2026-11-14)
| Package | Version | Notes |
|---|---|---|
| Node.js | **≥ 22.23.4** | Astro 7 requires `node >=22.23.4`. `.nvmrc` = `22.23.4`; set `engines` |
| `astro` | `^7.4.12` | Static output; core APIs only |
| `@astrojs/sitemap` | `^3.7.5` | |
| `@astrojs/check` | `^0.9.12` | Peer-requires TypeScript `^5 || ^6` |
| `typescript` | `~6.0.3` | **Not 7.x** (unsupported by `@astrojs/check`) |
| `vitest` | `^5.1.0` | |
| `@playwright/test` | **`1.63.0` exactly** in a Claude Code cloud container (matches pre-installed browsers at `/opt/pw-browsers`; don't run `playwright install`). Elsewhere: latest + `npx playwright install chromium` |
| `@axe-core/playwright` | `^4.14.0` | |
| `node-html-parser` (dev) | latest | Site-QA parsing of built HTML |

No client-side framework. No runtime dependencies besides what Astro emits. Money math is integer cents (no floating-point currency arithmetic in results); no decimal library needed.

### 4.2 Hard constraints
1. Static output only; no SSR adapter, no runtime fetches to platforms.
2. No third-party scripts/fonts except AdSense (when env set) and optional Cloudflare Web Analytics (cookieless).
3. **No platform logos, brand colours or trade dress.** Platform names are used descriptively only. Every calculator says "Unofficial calculator — not affiliated with {Platform}". Pages must never look like an official eBay/PayPal/etc. tool.
4. JS ≤ 30 KB gzipped per page (engine for one platform + UI); compare pages may load all schedules but must stay ≤ 45 KB gz.
5. No cookies set by our code; `localStorage` only for preferences (last-used options like tax rate, store tier), wrapped in try/catch.
6. WCAG 2.2 AA; zero serious/critical axe violations.
7. Not financial or tax advice — disclaimers per §17.

---

## 5. Project structure

```
fee-calculator-site/
├── .nvmrc  .gitignore  .env.example  README.md  DECISIONS.md
├── astro.config.mjs  package.json  tsconfig.json  vitest.config.ts  playwright.config.ts
├── public/
│   ├── favicon.svg  apple-touch-icon.png  og/default.png
│   └── _headers
├── scripts/
│   ├── generate-images.mjs        # OG image + touch icon via Playwright from an HTML template
│   └── check-sources.mjs          # maintenance: fetch each fee source URL, hash text, report changes (§18)
├── src/
│   ├── config/
│   │   ├── site.ts                # brand, URL, YEAR (from build date), env helpers
│   │   └── pages.ts               # page registry (ids, paths, nav labels, groups, related)
│   ├── data/
│   │   ├── keywords.ts            # primary keyword per page (used by tests)
│   │   └── fee-history.ts         # changelog entries (platform, date, change, source)
│   ├── lib/
│   │   ├── money.ts               # cents parsing/formatting, rounding modes
│   │   ├── fees/
│   │   │   ├── types.ts           # interfaces (§9.2)
│   │   │   ├── primitives.ts      # percentOf, tiered, capped, minFee, maxFee, fixed …
│   │   │   ├── solve.ts           # reverse solver (§9.5, Appendix E)
│   │   │   ├── compare.ts         # run many schedules on one input
│   │   │   ├── registry.ts        # map platformId → schedule (lazy imports per page)
│   │   │   └── schedules/
│   │   │       ├── ebay.ts  etsy.ts  depop.ts  poshmark.ts  mercari.ts  whatnot.ts  grailed.ts
│   │   │       ├── facebook-marketplace.ts  tiktok-shop.ts  stockx.ts  reverb.ts  tcgplayer.ts  kdp.ts
│   │   │       ├── stripe.ts  paypal.ts  square.ts  venmo.ts  cash-app.ts  clover.ts  generic-card.ts
│   │   │       └── (phase 3) copart.ts  iaa.ts
│   │   ├── url-state.ts           # encode/decode calculator state in query string
│   │   └── storage.ts
│   ├── components/
│   │   ├── layout/ BaseLayout.astro, CalcLayout.astro, Header.astro, Footer.astro, Breadcrumbs.astro, ThemeToggle.astro
│   │   ├── seo/ Seo.astro, JsonLd.astro
│   │   ├── content/ Faq.astro, RelatedCalcs.astro, CalcGrid.astro, Callout.astro, SourceNote.astro,
│   │   │            FeeTable.astro, WorkedExamples.astro, ComparisonTable.astro, LastVerified.astro
│   │   ├── ads/ AdSlot.astro, AdSenseScript.astro
│   │   └── calc/
│   │       ├── CalcCard.astro          # shared frame: inputs column + results column
│   │       ├── MoneyInput.astro  PercentInput.astro  SelectInput.astro  ToggleInput.astro
│   │       ├── ResultsPanel.astro      # payout, total fees, profit, margin, ROI, effective rate
│   │       ├── BreakdownTable.astro    # every fee line with formula
│   │       ├── SplitBar.astro          # SVG stacked bar: fees / costs / profit
│   │       ├── ModeSwitch.astro        # Forward | Reverse ("price to charge")
│   │       ├── PlatformCalculator.astro  # generic calculator driven by a schedule id
│   │       ├── CompareTool.astro       # multi-platform table
│   │       └── ShareButtons.astro      # copy link, copy summary, print
│   ├── pages/  (see §11 for every route)
│   └── styles/ tokens.css base.css components.css
└── tests/
    ├── unit/   site/   e2e/   helpers/
```

`package.json` scripts: same pattern as below.
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview --port 4321 --host 127.0.0.1",
    "check": "astro check",
    "test:unit": "vitest run tests/unit",
    "test:site": "vitest run tests/site",
    "test:e2e": "playwright test --trace off",
    "test": "npm run check && npm run test:unit && npm run build && npm run test:site && npm run test:e2e",
    "sources": "node scripts/check-sources.mjs",
    "images": "node scripts/generate-images.mjs"
  }
}
```

`astro.config.mjs`: `site: process.env.SITE_URL ?? 'https://afterfeescalc.com'`, `output: 'static'`, `trailingSlash: 'always'`, `build: { format: 'directory' }`, sitemap integration excluding `/404`, `compressHTML: true`. Allow `outDir` override via env (`OUT_DIR`) for the ads-on test build.

---

## 6. Configuration and environment variables

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | `https://afterfeescalc.com` | canonical, sitemap, OG |
| `PUBLIC_SITE_NAME` | `AfterFees` | brand |
| `PUBLIC_CONTACT_EMAIL` | `hello@afterfeescalc.com` (placeholder) | contact, privacy |
| `PUBLIC_AUTHOR_NAME` | empty | if set, shown as reviewer on "How we verify fees" and calculator pages ("Fees reviewed by {name}") |
| `PUBLIC_ADSENSE_CLIENT` | — | `ca-pub-…`; if unset: no ad code anywhere, ads.txt is a comment |
| `PUBLIC_ADSENSE_SLOT_BELOW_RESULTS`, `PUBLIC_ADSENSE_SLOT_IN_CONTENT`, `PUBLIC_ADSENSE_SLOT_SIDEBAR`, `PUBLIC_ADSENSE_SLOT_BEFORE_FAQ` | — | ad unit IDs |
| `PUBLIC_GSC_VERIFICATION` | — | Search Console meta |
| `PUBLIC_CF_BEACON_TOKEN` | — | optional cookieless analytics |
| `OUT_DIR` | `dist` | build output override (tests) |

`YEAR` (used in titles, e.g. "eBay Fee Calculator 2026") is derived from the build date in `site.ts`, so titles update automatically on the next build each January. Fee data never auto-changes.

---

## 7. Design system

### 7.1 Principles
- **Calculator first:** inputs and the result are visible without scrolling on a 390×844 phone (inputs stack, the key result "You keep $X" is pinned in a compact bar at the bottom of the viewport while inputs are in view on mobile) and side-by-side on desktop (inputs left, results right, results sticky).
- Results update live as you type (debounced 150 ms), no "Calculate" button required (keep one for accessibility/keyboard users who expect it; it just focuses the results).
- Trust cues everywhere: "Fees verified Nov 14, 2026 · Source: {official page}" under the calculator; itemised formulas; neutral, calm finance look.
- No platform branding (see §4.2.3). Platforms are identified by a neutral monogram chip (first letter in a rounded square in a neutral colour).

### 7.2 Tokens (`src/styles/tokens.css`)
Light on `:root`; dark via `@media (prefers-color-scheme: dark)` on `:root:not([data-theme="light"])` and on `:root[data-theme="dark"]`.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#ffffff` | `#0c1110` |
| `--surface` | `#f6f8f7` | `#131a18` |
| `--surface-2` | `#edf2f0` | `#1a2321` |
| `--text` | `#0f1f1a` | `#e6efec` |
| `--muted` | `#4b5d57` | `#9db0aa` |
| `--border` | `#dde6e2` | `#26332f` |
| `--accent` (primary, "money green") | `#047857` | `#34d399` |
| `--accent-contrast` | `#ffffff` | `#052e22` |
| `--fee` (fees in charts/tables) | `#b45309` | `#fbbf24` |
| `--cost` (your costs) | `#475569` | `#94a3b8` |
| `--profit` | `#047857` | `#34d399` |
| `--loss` | `#b91c1c` | `#f87171` |
| `--focus` | `#2563eb` | `#93c5fd` |
| `--radius` / `--radius-sm` | `12px` / `8px` | |
| `--page-width` | `1160px` | |
| `--content-width` | `72ch` | |

All pairs WCAG AA. Never rely on colour alone (fees/costs/profit also labelled).

### 7.3 Typography
System font stack; base 17px/1.6; money figures `font-variant-numeric: tabular-nums`. Result headline ("You keep") 2.25–3rem bold.

### 7.4 Layout
- Container `--page-width`, 16px gutters (24px ≥ 768px).
- Calculator card spans full width. ≥ 960px: two-column card (inputs 55% / results 45%, results sticky top 80px). < 960px: inputs then results; mobile sticky mini-result bar.
- ≥ 1024px page layout: main column + 300px sidebar ("Popular calculators", sticky ad).
- No horizontal scroll ≥ 320px; long tables scroll inside a wrapper with a visible scroll hint.

### 7.5 Inputs
- Money input: `<input type="text" inputmode="decimal" autocomplete="off">` with a `$` prefix adornment; accepts "1,234.56", "$1234.5", ".99"; on blur formats to 2 decimals; rejects negative/NaN with inline error (`aria-describedby`); max $10,000,000.
- Percent input: `%` suffix, 0–100 with up to 3 decimals.
- Select inputs for categories/tiers/plans; toggles for booleans (store subscription, international buyer, promoted listing, etc.).
- Each input has a visible label + optional help tooltip (`<details>` based, no JS needed).
- Sensible defaults pre-filled so the result is meaningful on first paint (server-rendered initial result — compute in Astro at build time with the defaults, so the page shows real numbers even before JS loads).

---

## 8. Site-wide layout and shared UI

### 8.1 Header
Logo (simple "receipt with check" glyph + "AfterFees") · nav: **Marketplaces ▾** (all marketplace calculators), **Payments ▾** (all processor calculators), **Compare** (home compare tool anchor), **Fee updates** · theme toggle. Mobile: `<details>` menu.

### 8.2 Footer
Columns: Marketplace calculators · Payment calculators · Comparisons · Company (How we verify fees, Fee updates, About, Privacy, Terms, Contact). Bottom: "© {year} AfterFees. Calculations are estimates based on published fee schedules — always confirm with the platform. Not affiliated with any platform named on this site. Not financial or tax advice."

### 8.3 Page registry (`src/config/pages.ts`)
Single source of truth for nav, footer, related links, hubs, compare tool and tests:
```ts
export type Group = 'marketplace' | 'payments' | 'compare' | 'auction' | 'core' | 'trust';
export interface PageEntry {
  id: string; path: string; group: Group; navLabel: string; cardTitle: string; cardBlurb: string;
  scheduleId?: string;            // which fee schedule powers the page
  related: string[];              // 3–6 page ids
  phase: 1 | 2 | 3;
}
```

### 8.4 `CalcLayout.astro`
Props: `title`, `description`, `path`, `h1`, `intro`, `scheduleId`, `faqs`, `related`, `breadcrumbs`, `showAds=true`. Order:
1. Breadcrumbs → H1 → intro (1–2 sentences, includes the current headline rate, e.g. "Depop charges US sellers no selling fee, but a 3.3% + $0.45 payment processing fee applies.")
2. **Calculator** (`#calculator`)
3. `SourceNote`: "Fees verified {date} · Source: {official page title} ↗ · Unofficial calculator, not affiliated with {Platform}."
4. Ad: below results (never between inputs and results)
5. Article (default slot) with `WorkedExamples`, `FeeTable`, explanations; in-content ad after the 2nd H2
6. Ad before FAQ (only if article ≥ 1,000 words)
7. FAQ (visible + FAQPage JSON-LD)
8. Related calculators; "Compare with other platforms" CTA → compare tool prefilled with the current inputs
9. LastVerified + link to Fee updates

---

## 9. Fee engine specification

### 9.1 Principles
- **Integer cents** everywhere for money; rates as decimals (0.136). Each fee line is computed exactly then rounded to cents with the schedule's rounding mode (`'half-up'` default; `'bankers'` where the platform documents it, e.g. Cash App). Totals = sum of rounded lines. Document the rounding assumption in each schedule; golden tests allow ±1¢ vs official examples only where the platform's rounding is undocumented.
- **Pure functions:** `compute(input) → result`, no DOM, no globals. Used both at build time (server-rendered defaults, worked-example tables, hub comparison tables) and in the browser.
- **Data + code per platform:** each schedule module exports constants (rates, thresholds, sources) and a `compute` built from shared primitives. No generic DSL — readability beats cleverness.
- **Versioned:** each schedule has `version`, `effectiveFrom`, `verifiedAt`, `status`, `sources[]`. Pages render `verifiedAt` and the primary source.

### 9.2 Types
```ts
export type Cents = number;                       // integer
export type Rounding = 'half-up' | 'bankers';

export interface SaleInput {
  price: Cents;                 // item/sale price (marketplaces) or charge amount (processors)
  shippingCharged?: Cents;      // what the buyer pays for shipping
  salesTaxRate?: number;        // 0..0.2 — buyer's combined sales tax rate (marketplace facilitator collects it)
  taxOnShipping?: boolean;      // default true
  discount?: Cents;             // seller-funded discount/coupon
  itemCost?: Cents;             // your cost of goods
  shippingCost?: Cents;         // your label/postage cost
  otherCosts?: Cents;           // packaging, etc.
  options: Record<string, string | number | boolean>;   // platform-specific (category, store tier, plan, card type…)
}

export interface FeeLine {
  id: string; label: string; amount: Cents;
  formula: string;              // human-readable, e.g. "13.6% × $118.80 = $16.16"
  base?: Cents; rate?: number; fixed?: Cents;
  paidBy: 'seller' | 'buyer';   // buyer-paid fees are shown but not deducted from payout
  note?: string;
}

export interface FeeResult {
  lines: FeeLine[];
  sellerFees: Cents;            // sum of seller-paid lines
  buyerPays: Cents;             // price + shipping + tax + buyer-paid fees
  payout: Cents;                // what the platform sends the seller (before your own costs)
  profit: Cents | null;         // payout − itemCost − shippingCost − otherCosts (null if no costs entered)
  marginPct: number | null;     // profit / (price + shippingCharged)
  roiPct: number | null;        // profit / itemCost
  effectiveFeePct: number;      // sellerFees / (price + shippingCharged)
  warnings: string[];           // e.g. "Rate shown is the standard tier; your Whatnot rate may be lower"
}

export interface OptionDef {
  id: string; label: string; type: 'select' | 'toggle' | 'percent' | 'money' | 'number';
  default: string | number | boolean; choices?: { value: string; label: string }[]; help?: string;
  advanced?: boolean;           // shown under "More options"
}

export interface FeeSchedule {
  id: string; name: string; kind: 'marketplace' | 'processor' | 'royalty' | 'auction';
  version: string; effectiveFrom: string; verifiedAt: string;      // ISO dates
  status: 'verified' | 'partial' | 'unverified';
  sources: { url: string; title: string; quote: string; readOn: string }[];
  rounding: Rounding;
  inputs: { shipping: boolean; tax: boolean; costs: boolean; discount: boolean };  // which common inputs the UI shows
  options: OptionDef[];
  breakpoints(input: SaleInput): Cents[];   // price thresholds where fees change discontinuously (for the solver)
  compute(input: SaleInput): FeeResult;
  summary: string;              // one-line human summary for tables, e.g. "13.6% + $0.40 per order (most categories)"
}
```

### 9.3 Primitives (`primitives.ts`)
`percentOf(base, rate, rounding)`, `fixed(c)`, `tieredMarginal(base, tiers)` (e.g. 13.6% to $7,500 then 2.35% above — applied per item), `tieredWhole(base, tiers)` (rate chosen by bracket applies to whole amount, e.g. Women's bags 15% if ≤ $2,000 else 9%), `capped(amount, cap)`, `atLeast(amount, min)`, `clampRange(amount, min, max)`, `sumLines(lines)`. Unit-test every primitive including boundaries.

### 9.4 Common semantics
- **Marketplace "order total"** for threshold checks (e.g. eBay per-order fee ≤ $10) = price + shippingCharged + tax (documented per schedule; eBay's "orders $10.00 or less" — use the sale total; mark as assumption in DECISIONS.md if the official page is unclear).
- **Sales tax:** marketplaces collect and remit it (marketplace facilitator laws), so it is **not** part of the seller's payout, but some platforms charge fees on it (eBay FVF, Depop/Etsy/Whatnot processing). Tax input default **0%** with a visible note "Enter your buyer's sales tax rate for exact fees (eBay and others charge fees on tax)". Store last-used rate in localStorage.
- **Payout** = price + shippingCharged − discount − seller fees (tax excluded; it's remitted).
- **Profit** = payout − itemCost − shippingCost − otherCosts.
- **Processor schedules:** input `price` = amount charged to the customer; payout = price − fees; "tax" and "shipping" inputs hidden.

### 9.5 Reverse solver (`solve.ts`)
`solvePrice(schedule, baseInput, target: { kind: 'payout' | 'profit'; amount: Cents }): { price: Cents; result: FeeResult } | null`
- Finds the **minimum** price (in cents) whose `payout`/`profit` ≥ target.
- Fee functions are piecewise-linear and **not always monotonic** (e.g. Poshmark: $14.99 → fee $2.95 → you keep $12.04; $15.00 → fee $3.00 → you keep $12.00; eBay per-order fee jumps $0.30 → $0.40 above $10). Algorithm in Appendix E.3: split the search range at `schedule.breakpoints()`, binary-search within each segment (monotonic inside a segment), take the minimum valid candidate. Search range 1¢ … $10,000,000.
- Processors also expose a closed form for the common case: `price = ceil((target + fixed) / (1 − rate))`, then verify with `compute` and increment by 1¢ until satisfied (rounding) — and fall back to the general solver when caps/minimums apply.
- Return `null` (UI shows "Not reachable with these settings") if no price ≤ max satisfies the target.

### 9.6 Compare (`compare.ts`)
`compareMarketplaces(input, ids)` and `compareProcessors(amount, ids)` run each schedule with its default options plus the shared inputs, returning rows sorted by payout descending. Platform-specific assumptions are shown as footnotes (e.g. "Whatnot: standard 8% tier", "Poshmark: buyer pays shipping").

### 9.7 URL state (`url-state.ts`)
Encode calculator state into query params (`?price=49.99&ship=8&tax=7.25&cost=12&cat=most&store=none&mode=forward`). On load, decode and apply (client-side only); canonical URL stays parameter-free. "Copy link" button writes state and copies. Validate and clamp every param.

---

## 10. Calculator UI components

### 10.1 `PlatformCalculator.astro`
Props: `scheduleId`, `defaults?` (override options/inputs for a page variant, e.g. the eBay profit page opens with cost fields expanded), `variant?: 'fee' | 'profit'`, `showModeSwitch=true`.
Behaviour:
- Renders common inputs according to `schedule.inputs` (sale price, shipping charged, buyer tax rate, discount; costs section: item cost, your shipping cost, other costs) and schedule `options` (basic first, `advanced` under a "More options" disclosure).
- **ModeSwitch:** Forward ("I sell for…") / Reverse ("I want to keep…" with target kind Payout|Profit). In reverse mode the price field becomes the output.
- Results panel: big "You keep $X" (payout), "Total fees $Y (Z% of sale)", profit, margin, ROI (when costs entered), `SplitBar`, `BreakdownTable` (every line with formula; buyer-paid lines shown greyed with "paid by buyer").
- Warnings list (from `result.warnings`).
- Buttons: Copy link, Copy summary (plain text: "eBay: sell $100 + $10 shipping → fees $15.36, you keep $94.64 (calculated on afterfeescalc.com)"), Print.
- Server-rendered with defaults (works without JS, showing default example); JS hydrates for interactivity via a small `<script>` that imports only that schedule module.
- `data-testid`s: `in-price`, `in-ship`, `in-tax`, `in-discount`, `in-cost`, `in-shipcost`, `in-other`, `opt-<id>`, `mode-forward`, `mode-reverse`, `in-target`, `target-kind`, `out-payout`, `out-fees`, `out-profit`, `out-margin`, `out-roi`, `out-price` (reverse), `breakdown`, `line-<id>`, `copy-link`, `warning`.
- Live region announces the new payout (debounced 600 ms) for screen readers.

### 10.2 `CompareTool.astro`
Props: `kind: 'marketplace' | 'processor'`, `ids?: string[]` (default all of that kind in the current phase).
- Inputs (marketplace): sale price, shipping charged, tax rate, item cost, your shipping cost. (Processor): amount, card type (domestic/international), channel (online/in-person/keyed/invoice).
- Output: sortable table — platform, total fees, effective %, you keep, profit, notes/assumptions, link to that platform's calculator (prefilled via URL state). Best row highlighted ("Most you keep").
- `data-testid="compare-table"`, rows `compare-row-<id>` with `data-payout`.

### 10.3 `WorkedExamples.astro` (build-time)
Props: `scheduleId`, `prices` (default `[10, 25, 50, 100, 250, 500]` dollars), `shipping` (default 0), `options` (defaults). Renders a table: Sale price · Fees · Effective % · You keep. Caption states assumptions. Generated at build time from the engine — the site-QA test re-computes and compares.

### 10.4 `FeeTable.astro` (build-time)
Renders the schedule's human-readable fee table (e.g. eBay category rates) from the schedule's constants with the source link and verified date.

### 10.5 `ComparisonTable.astro` (build-time)
For hubs and "X vs Y" pages: rows of fee components per platform and the outcome for 3 example sales.

### 10.6 Other
`MoneyInput`/`PercentInput`/`SelectInput`/`ToggleInput` (accessible, validated), `SplitBar` (SVG: fees / your costs / profit or loss; labels + legend; `role="img"` with `aria-label` summary), `SourceNote`, `LastVerified`.

---

## 11. Page specifications

Conventions:
- **Title** ≤ 60 chars (with `{YEAR}` substituted); **meta description** 140–160 chars (tests enforce). `{YEAR}` = build year.
- One H1. Primary keyword in title, H1, first 100 words and one H2.
- Every calculator page includes: intro with current headline rate · calculator · SourceNote · "How {platform} fees work" (formula in plain words + bullet list of each fee) · `FeeTable` · `WorkedExamples` · "How to pay less in fees" (legit tips) · "Payouts and timing" (where relevant) · "Taxes" (generic: marketplaces collect sales tax; income reporting via Form 1099-K when you pass IRS thresholds — **do not state a threshold number**, link IRS.gov) · FAQ · related calculators.
- Word counts (article text, excluding calculator UI and generated tables): hand-written sections ≥ 700 words for platform pages, ≥ 900 for eBay fee/Stripe/PayPal, ≥ 900 for comparison pages, ≥ 600 for hubs, home ≥ 700.
- FAQs: 5–7 per page, answers 40–90 words, first sentence answers directly, numbers pulled from the schedule (render from data so they stay in sync — never hard-code a rate in prose; use a `<Rate scheduleId path />` helper or template strings from schedule constants).

### 11.1 Core pages

**Home — `/`**
- Title: `Fee Calculators for Sellers & Small Businesses | AfterFees`
- Meta: `See what you keep after eBay, Etsy, Depop, Poshmark, Stripe, PayPal, Square and Venmo fees. Free calculators with fee rates checked against official pages.`
- H1: `Know What You Keep After Fees`
- Keywords: `fee calculator` (1,900 · KD 32 · $6.04) + brand.
- Content: `CompareTool kind="marketplace"` ("Where should I sell this?"), then `CalcGrid` of all calculators grouped (Marketplaces, Payments, Compare), "Why trust these numbers" block (verification process, last verified date range, link to How we verify), short explainer of fee types (commission, processing, per-order, payout fees). ≥ 700 words.
- FAQ (5): Which marketplace has the lowest fees? (answer computed from the compare table for a $50 sale, with caveats) · Why do fees differ from what I see in my account? · Do these calculators include sales tax? · How often are fees updated? · Is my data stored?

**Marketplace hub — `/marketplace-fees/`**
- Title: `Marketplace Seller Fees Compared ({YEAR}) – eBay, Etsy & More`
- Meta: `Compare seller fees on eBay, Etsy, Depop, Poshmark, Mercari, Whatnot and Grailed in one table, then calculate what you keep on any sale with our free tools.`
- H1: `Marketplace Seller Fees Compared`
- Content: `ComparisonTable` (commission, processing, fixed fees, who pays shipping, payout fees), `CompareTool`, explainer sections per fee type, links. ≥ 600 words.

**Payments hub — `/payment-processing-fees/`**
- Title: `Payment Processing Fees ({YEAR}) – Stripe, PayPal, Square`
- Meta: `Compare card processing fees for Stripe, PayPal, Square, Venmo, Cash App and Clover: online, in-person, keyed and international rates in one clear table.`
- H1: `Payment Processing Fees Compared`
- Content: comparison table by channel (online card, in-person, keyed, invoice, ACH, international surcharge, instant payout fee), processor `CompareTool`, explainer (interchange basics, flat-rate vs interchange-plus, surcharging rules overview with "check your state and card network rules"). ≥ 600 words.

### 11.2 Marketplace calculators (Phase 1)

| Path | Title | Meta (140–160) | H1 | Primary / secondary keywords (vol · KD · CPC) |
|---|---|---|---|---|
| `/ebay-fee-calculator/` | `eBay Fee Calculator {YEAR} – Final Value Fees & Profit` | `Calculate eBay final value fees, the per-order fee, store discounts, promoted listing costs and your profit. Uses eBay's current category fee rates for the US.` | `eBay Fee Calculator` | ebay fee calculator 40,500·16·$7.74; ebay fees calculator 8,100·11·$5.38; us ebay fee calculator 3,600·16·$5.69; ebay calculator 14,800·32·$6.04; how much does ebay take 2,400·27; ebay fees 33,100·28; ebay final value fee 1,300·32; ebay fee calculator 2026 880·12; ebay shipping fee calculator 390·6 |
| `/ebay-profit-calculator/` | `eBay Profit Calculator – Fees, Costs, Margin & ROI` | `Find your real eBay profit after final value fees, shipping, item cost and ad fees. See margin and ROI, plus the price you need to hit your profit target.` | `eBay Profit Calculator` | ebay profit calculator 5,400·18·$3.56 |
| `/etsy-fee-calculator/` | `Etsy Fee Calculator {YEAR} – Fees, Profit & Pricing` | `Work out Etsy listing, transaction, payment processing and Offsite Ads fees, then see your profit and the price you need to charge. Uses current US Etsy fees.` | `Etsy Fee Calculator` | etsy fee calculator 2,900·9·$0.87; etsy fees 2,900·29; how much does etsy take 880·21; etsy profit calculator 720·1·$3.85; etsy pricing calculator 260 |
| `/depop-fee-calculator/` | `Depop Fee Calculator {YEAR} – What You Keep After Fees` | `Depop charges US sellers no selling fee, but payment processing and boosting fees still apply. Calculate exactly what you keep from any Depop sale in seconds.` | `Depop Fee Calculator` | depop fee calculator 1,900·0·**$11.14**; depop fees 3,600·0·$5.25; how much does depop take 1,300·0·$6.15; depop profit calculator 260 |
| `/poshmark-fee-calculator/` | `Poshmark Fee Calculator {YEAR} – 20% and $2.95 Fees` | `Calculate Poshmark's flat $2.95 fee on low-priced sales and 20% fee on everything else. See your earnings, profit and the price you need to list at.` | `Poshmark Fee Calculator` | poshmark fees 1,900·0·$4.00; how much does poshmark take 1,300·1·$4.06; poshmark fee calculator 590·0; poshmark calculator 210 |
| `/mercari-fee-calculator/` | `Mercari Fee Calculator {YEAR} – 10% Selling Fee & Profit` | `Calculate Mercari's 10% selling fee on item price plus shipping, Instant Pay costs and your profit, with a clear explanation of how Mercari's fees changed.` | `Mercari Fee Calculator` | mercari fees 1,300·0·$6.16; mercari fee calculator 590·0 |
| `/whatnot-fee-calculator/` | `Whatnot Fee Calculator {YEAR} – Commission & Processing` | `Calculate Whatnot's commission and the 2.9% + $0.30 payment processing fee on live sales. See your payout and profit per item, including coin and pallet rates.` | `Whatnot Fee Calculator` | whatnot fees 1,900·1; whatnot fee calculator 1,600·0; how much does whatnot take 720·0·$9.67; whatnot profit calculator 140 |
| `/grailed-fee-calculator/` | `Grailed Fee Calculator {YEAR} – Commission & Processing` | `Calculate Grailed's commission (6% under $120, 9% at $120 and up) plus payment processing fees, and see exactly what you take home from each sale.` | `Grailed Fee Calculator` | grailed fees 1,900·0·$2.33; grailed fee calculator 720·0 |

> Note on meta descriptions that quote rates (Whatnot, Grailed, Depop, Poshmark): generate them from schedule constants at build time so they stay correct after fee changes; the strings above show the expected output with current fees.

**Page-specific content requirements (Phase 1 marketplaces):**
- **eBay fee calculator** (≥ 900 words): options = category (full table from Appendix A.1), store subscription (None/Starter/Basic/Premium/Anchor/Enterprise), Promoted Listings General ad rate %, international buyer (1.65% international fee), below-standard seller (advanced), item type (athletic shoes ≥ $150 rule auto-handled by category). Sections: how FVF works (incl. that it's charged on item + shipping + tax), per-order fee, category table, store vs no-store table and break-even ("a Basic store pays for itself when monthly sales exceed $X" — compute from data), promoted listings, international fee, below-standard surcharge, insertion fees (250 free/month, $0.35 after), how to pay less. FAQ: How much does eBay take from a sale? · Does eBay charge fees on shipping and sales tax? · What is eBay's final value fee in {YEAR}? · Is an eBay Store worth it? · How do promoted listing fees work? · What is the per-order fee? · Does eBay charge a fee if my item doesn't sell?
- **eBay profit calculator:** same schedule, `variant="profit"`: cost fields open by default, reverse mode default target = profit; sections on ROI vs margin, pricing strategy, break-even price; links to fee calculator (avoid duplicating its content — focus on profit, sourcing, ROI).
- **Etsy:** options = Offsite Ads (none / 15% / 12% — with the $10k rule explained), listing fee count (default 1 listing = $0.20; multi-quantity note: $0.20 per additional quantity sold), currency conversion (2.5% if listing currency ≠ payout currency). Etsy Payments processing 3% + $0.25 (US). Sections incl. Etsy Ads (separate, budget-based), Share & Save (mention only if verified), pricing formula for makers (materials + labour + fees).
- **Depop:** options = boosted listing (none / boosted — rate per Appendix A.4 after you resolve the 8% vs 12% question), Depop shipping label (affects boost base). Sections: no selling fee in US (since 2024), processing fee on item + shipping + tax, boosting, refunds reverse fees.
- **Poshmark:** buyer pays shipping (no shipping input; show note), fee on listing price; Texas seller fee tax option (advanced; resolve exact rule). Sections: $2.95 vs 20% threshold and the "pricing just under the threshold" effect (show both sides of the threshold with numbers), bundles, offers/discounts.
- **Mercari:** 10% of item price + buyer-paid shipping for listings created/updated on or after Jan 6, 2025; no seller processing fee; buyer protection fee is paid by the buyer (show as buyer line); Instant Pay $3 (toggle); legacy listing note.
- **Whatnot:** options = commission tier (8% default; selectable 7.5/7/6.5% and "custom %" — **verify tier table**), category (standard 8% vs Coins & Money / Pallets 4%), shipping and tax inputs (processing applies to total incl. shipping and tax; commission excludes them). Note the limited-time 0%-above-$1,500 promotion only as a dated note if still active.
- **Grailed:** commission 6% (< $120, min $1.99) / 9% (≥ $120); Grailed label toggle (commission base excludes shipping when using a Grailed label); processing (verify current rate) domestic vs international.

### 11.3 Payment calculators (Phase 1)

| Path | Title | Meta | H1 | Keywords |
|---|---|---|---|---|
| `/stripe-fee-calculator/` | `Stripe Fee Calculator {YEAR} – Fees & What You Receive` | `Calculate Stripe fees for domestic, international and manually entered cards, ACH and invoices. See what you receive, or what to charge so fees are covered.` | `Stripe Fee Calculator` | stripe fee calculator 1,600·4·**$19.66**; stripe fees 5,400·12·$5.07; stripe fee 5,400·13; stripe processing fee 2,400·11·$4.88; how much does stripe charge 880·13·$5.21 |
| `/paypal-fee-calculator/` | `PayPal Fee Calculator {YEAR} – Checkout, Cards & Invoices` | `Calculate PayPal fees for Checkout, card payments, invoices, Pay Later and QR codes, including the international surcharge. Uses PayPal's current US rates.` | `PayPal Fee Calculator` | paypal fee calculator 18,100·32·$8.24; paypal fees 9,900·49·$12.91; paypal fee 9,900·43; how much does paypal charge 1,000·42; paypal invoice fee 880·31 |
| `/paypal-goods-and-services-fee-calculator/` | `PayPal Goods and Services Fee Calculator ({YEAR})` | `Calculate the PayPal Goods and Services fee when you sell to friends or online buyers, see what you receive and what to charge so the buyer covers the fee.` | `PayPal Goods and Services Fee Calculator` | paypal goods and services fee 12,100·30·**$16.26**; paypal goods and services fee calculator 2,400·28 |
| `/square-fee-calculator/` | `Square Fee Calculator {YEAR} – In-Person, Online & Keyed` | `Calculate Square processing fees for tap, dip and swipe, online, invoice and manually keyed payments. See what you receive and how Square compares with Stripe.` | `Square Fee Calculator` | square fee calculator 1,600·0·$6.81; square processing fees 3,600·8·**$10.80**; square fees 8,100·28·$8.74; how much does square charge 1,600·26 |
| `/venmo-fee-calculator/` | `Venmo Fee Calculator {YEAR} – Business, Goods & Services` | `Calculate Venmo fees for business profiles, goods and services payments and instant transfers. See exactly what you receive from any Venmo payment.` | `Venmo Fee Calculator` | venmo fees 5,400·11; venmo business fee 1,900·19·**$21.63**; venmo goods and services fee 1,600·11; venmo fee calculator 1,300·0 |
| `/venmo-instant-transfer-fee/` | `Venmo Instant Transfer Fee Calculator ({YEAR})` | `Calculate Venmo's instant transfer fee, including the minimum and maximum, see how much reaches your bank, and decide if a free standard transfer is better.` | `Venmo Instant Transfer Fee Calculator` | venmo instant transfer fee 4,400·9·**$14.60**; venmo instant transfer fee calculator 260 |
| `/cash-app-fee-calculator/` | `Cash App Fee Calculator {YEAR} – Instant & Business Fees` | `Calculate Cash App instant deposit fees, business payment fees and card-funded payments. See what you receive and when a free standard deposit makes sense.` | `Cash App Fee Calculator` | cash app fee calculator 1,300·0; cash app fees 3,600·28·$3.30; cash app instant transfer fee 2,400·5; cash app business fee 210·9·$11.82; cash app instant transfer fee calculator 390·1·$6.78 |

**Page-specific requirements (Phase 1 payments):**
- **Every processor calculator** has two modes: "I charge $X → I receive $Y" and "I want to receive $Y → charge $X" (fee pass-through). Show a short, careful **surcharging note**: "Passing card fees to customers (surcharging) is restricted: card networks cap surcharges, surcharges aren't allowed on debit cards, and some states limit or ban them. Check your processor's rules and your state's laws." No legal advice.
- **Stripe:** options = payment type (domestic card, international card, + currency conversion, manually entered card, ACH Direct Debit, Terminal in-person, Link), invoicing (none / Invoicing Starter 0.4% / Plus 0.5%), instant payout toggle (1.5%, min $0.50 — applied to the payout). Sections: standard pricing, international and FX surcharges, ACH vs card (with savings example at $1,000/$5,000), invoicing fee, disputes ($15), instant payouts, custom/IC+ pricing for large businesses (mention only), "How to pass Stripe fees to customers" (with the formula and the surcharge caution).
- **PayPal:** options = transaction type (PayPal Checkout / Guest Checkout / Pay with Venmo 3.49% + $0.49; standard card 2.99% + $0.49; Pay Later 4.99% + $0.49; QR code 2.29% + $0.09; in-person card 2.29% + $0.09; keyed card 3.49% + $0.09; invoice (same as payment method used) / invoice paid by bank ACH 1% capped $10), international buyer (+1.5%). Page shows "PayPal fee table last updated by PayPal on Nov 4, 2026".
- **PayPal Goods & Services:** 2.99% per official table (verify whether a fixed fee applies — Appendix A.12), friends & family vs goods & services explanation (F&F has no buyer protection; not for sales — say so neutrally), "buyer covers the fee" reverse mode.
- **Square:** options = channel (in-person 2.6% + 15¢, online 2.9% + 30¢, invoices/payment links 3.3% + 30¢, keyed/card-on-file 3.5% + 15¢), plan note (Plus/Premium may have different rates — verify), instant transfer (verify rate). Section "Square vs Stripe" links to the comparison page.
- **Venmo:** options = payment type (business profile 1.9% + $0.10; goods & services seller fee 2.99%; Tap to Pay — conflicting 2.9% + $0.09 vs 2.29% + $0.09 → resolve), instant transfer toggle (1.75%, min $0.25, max $25). Personal payments between friends are free — say so.
- **Venmo instant transfer:** single-purpose calculator: amount → fee (1.75%, min/max) → arrives; table of fees for $10, $14.29 (min threshold), $50, $100, $500, $1,000, $1,428.57 (cap threshold), $5,000; standard vs instant comparison; limits (verify).
- **Cash App:** options = business payment (2.6% + $0.15 from a customer's Cash App; 3% Tap to Pay), instant deposit (conflicting ranges 0.5–1.75% vs 0.5–2.5%, min $0.25, cap $75 → verify; until verified show as an editable rate with default 1.75%), add money from credit card 3%, paper money deposit $1.

### 11.4 Comparison pages (Phase 1: first two; Phase 2: rest)

| Path | Title | Meta | H1 | Keywords |
|---|---|---|---|---|
| `/depop-vs-poshmark/` | `Depop vs Poshmark ({YEAR}): Fees, Payouts & Which to Use` | `Compare Depop and Poshmark fees side by side, see which one pays you more at every price point, and learn which app suits your items and style of selling.` | `Depop vs Poshmark` | depop vs poshmark 5,400·0·$2.59 |
| `/square-vs-stripe-fees/` | `Square vs Stripe Fees ({YEAR}) – Which Costs Less?` | `Compare Square and Stripe fees for online, in-person, keyed and invoice payments, with a calculator that shows which one costs less for your business.` | `Square vs Stripe Fees` | square vs stripe fees 590·0·**$17.37** |
| `/stripe-vs-paypal-fees/` | `Stripe vs PayPal Fees ({YEAR}) – Side-by-Side Calculator` | `Compare Stripe and PayPal fees for cards, PayPal Checkout, invoices and international payments, and see which one leaves you more money on every sale.` | `Stripe vs PayPal Fees` | stripe vs paypal fees 320·15·$12.56; paypal vs stripe fees 320·15·$8.66 |
| `/poshmark-vs-mercari/` | `Poshmark vs Mercari ({YEAR}): Fees and Which Pays More` | `Compare Poshmark and Mercari seller fees, shipping rules and payouts, with a calculator that shows which app pays you more for the same item and price.` | `Poshmark vs Mercari` | poshmark vs mercari 1,300·0·$2.91 |
| `/ebay-vs-mercari/` | `eBay vs Mercari ({YEAR}): Fees and Which Pays More` | `Compare eBay and Mercari seller fees, shipping and payouts side by side, and see which marketplace pays you more for the same item at any price.` | `eBay vs Mercari` | ebay vs mercari 1,000·0·$2.97 |
| `/ebay-vs-poshmark/` | `eBay vs Poshmark ({YEAR}): Fees and Which Pays More` | `Compare eBay and Poshmark fees, shipping rules and payouts, and see which one pays you more for clothing, shoes and accessories at any price point.` | `eBay vs Poshmark` | ebay vs poshmark 880·0·$1.70 |
| `/whatnot-vs-ebay/` | `Whatnot vs eBay ({YEAR}): Fees for Live and Online Sales` | `Compare Whatnot and eBay seller fees for live auctions and online listings, and see which one pays you more for cards, collectibles and other items.` | `Whatnot vs eBay` | whatnot vs ebay 480·0 |

Each comparison page: a two-platform calculator (`CompareTool` limited to the two ids, side-by-side result cards with a "difference" line), a build-time chart/table of payout differences across $10–$500, sections on fees, shipping (who pays), buyer audience and categories, payout speed, selling experience (neutral, factual, no fabricated stats), "which should you choose" decision list, FAQ (5). ≥ 900 words. Note: "depop vs poshmark" searchers want more than fees — cover audience, categories and selling experience honestly.

### 11.5 Phase 2 calculators

| Path | Title | Meta | H1 | Keywords |
|---|---|---|---|---|
| `/facebook-marketplace-fee-calculator/` | `Facebook Marketplace Fee Calculator – Shipped Orders` | `Facebook Marketplace charges 10% (minimum $0.80) on shipped orders and nothing on local pickup. Calculate your fee and payout for any shipped sale.` | `Facebook Marketplace Fee Calculator` | facebook marketplace fees 720·0; facebook marketplace fee calculator 140 |
| `/tiktok-shop-fee-calculator/` | `TikTok Shop Fee Calculator {YEAR} – Referral Fees & Profit` | `Calculate TikTok Shop referral fees by category, affiliate creator commission and your profit per order, with the fee base and refund rules explained.` | `TikTok Shop Fee Calculator` | tiktok shop fees 320·0·**$51.23**; tiktok shop fee calculator 260·0·**$37.29**; tiktok shop seller fees 140·15·$37.62 |
| `/stockx-fee-calculator/` | `StockX Fee Calculator {YEAR} – Seller Fees by Level` | `Calculate StockX transaction fees by seller level plus the 3% payment processing fee, and see your payout for sneakers, streetwear and collectibles.` | `StockX Fee Calculator` | stockx fees 480·0; stockx seller fees 260·0; stockx fee calculator 70 |
| `/reverb-fee-calculator/` | `Reverb Fee Calculator {YEAR} – Selling & Processing Fees` | `Calculate Reverb's 5% selling fee and payment processing fee for any gear sale, including Preferred Seller rates and international orders. See your payout.` | `Reverb Fee Calculator` | reverb fee calculator 590·0; reverb fees 480·0 |
| `/tcgplayer-fee-calculator/` | `TCGplayer Fee Calculator {YEAR} – Seller Fees & Payout` | `Calculate TCGplayer marketplace commission and payment processing fees for card sales, and see your payout by seller type, including Pro and Direct sellers.` | `TCGplayer Fee Calculator` | tcgplayer fees 1,600·4; tcgplayer fee calculator 480·0 |
| `/kdp-royalty-calculator/` | `KDP Royalty Calculator – eBook & Paperback Royalties` | `Calculate Amazon KDP royalties for eBooks (35% or 70%) and paperbacks, including printing costs by page count, ink and trim size. See earnings per copy.` | `KDP Royalty Calculator` | kdp royalty calculator 1,000·1; kdp printing cost calculator 390·0·**$15.08**; amazon kdp royalty calculator 390 |
| `/stripe-ach-fee-calculator/` | `Stripe ACH Fee Calculator – 0.8% Capped at $5` | `Calculate Stripe ACH Direct Debit fees (0.8%, capped at $5.00) and compare them with card fees to see how much you save on larger invoices and payments.` | `Stripe ACH Fee Calculator` | stripe ach fee 880·21·**$32.10** |
| `/stripe-invoice-fee-calculator/` | `Stripe Invoice Fee Calculator – Invoicing + Card Fees` | `Calculate the total cost of a Stripe invoice: the Invoicing fee plus card or ACH processing. See what you receive on each paid invoice and how to lower it.` | `Stripe Invoice Fee Calculator` | stripe invoice fee 260·21·**$55.71** |
| `/stripe-connect-fee-calculator/` | `Stripe Connect Fee Calculator – Platform & Payout Fees` | `Estimate Stripe Connect costs for platforms and marketplaces: active account fees, payout fees and card processing, per payment and per month in one view.` | `Stripe Connect Fee Calculator` | stripe connect fees 210·19·**$67.58** |
| `/clover-fee-calculator/` | `Clover Fee Calculator – Processing Rates by Plan` | `Estimate Clover processing fees for card-present and keyed transactions by plan, add your monthly software cost and see your effective rate per sale.` | `Clover Fee Calculator` | clover fees 1,300·5·**$23.36** |
| `/credit-card-processing-fee-calculator/` | `Credit Card Processing Fee Calculator – Any Provider` | `Calculate card processing fees for any provider with your own rate, or work out a surcharge to pass fees on. Includes common rates for popular processors.` | `Credit Card Processing Fee Calculator` | credit card processing fee calculator 1,300·0·$7.44; credit card fee calculator 480·17·$9.61; toast processing fees 260·0·$28.20; processing fee calculator 90·0·$11.62 |

Requirements:
- **TikTok Shop:** referral fee 6% standard with category exceptions (Appendix A.13), fee base = customer payment + platform discount − tax (includes buyer-paid shipping); optional affiliate commission % input; refund administration fee explained.
- **KDP:** two tabs: eBook (35% vs 70% with delivery cost by file size, the 70% price band, auto-pick the better option and explain eligibility) and Paperback (list price, page count, ink type, trim size → printing cost from the verified KDP table → royalty at 50%/60% per the verified rule). Expanded distribution note. Hardcover only if the table is verified.
- **Clover:** plan select (rates from Appendix A.17, all `PARTIAL`; label "Published starting rates; your merchant agreement may differ") + monthly software cost input → effective rate at your monthly volume.
- **Credit card processing (generic):** custom % + fixed, monthly fees, volume → effective rate; preset dropdown filled from processor schedules (Stripe, Square, PayPal, Clover, plus **Toast as a user-entered rate**, because Toast's pay-as-you-go rate isn't published — explain); surcharge calculator mode with the compliance caution.
- **Stripe Connect:** inputs: payments/month, average payment, payouts/month, active accounts → monthly cost (verified constants: $2 per monthly active account, 0.25% + 25¢ per payout, card fees per payment). Note "Stripe handles pricing" option = no platform fee.

### 11.6 Phase 3 (conditional)
`/copart-fee-calculator/` (`Copart Fee Calculator {YEAR} – Buyer Fees & Total Cost`) and `/iaa-fee-calculator/` (`IAA Fee Calculator {YEAR} – Buyer Fees & Total Cost`; also target "iaai fee calculator" 1,300·0·$8.07, "iaai fees" 880·0·$9.04). Only with fully verified tables (see §3.3, Appendix A.20–21). Inputs: bid amount, member type, payment method, title type, internet/virtual bid → buyer fee, bid fee, gate/service, title, environmental fees, total cost. Strong disclaimer: fees vary by location and change; confirm on the auction site before bidding.

---

## 12. Trust, legal and utility pages

| Page | Title | Requirements |
|---|---|---|
| `/how-we-verify-fees/` | `How We Verify Fees – AfterFees` | Process: each calculator uses only the platform's official fee pages; every rule has a source URL and a quote; re-checked at least every 90 days and whenever a platform announces changes; what we can't model (custom rates, promotions, account-specific pricing, currency conversion details); rounding assumptions; how to report an error (email). If `PUBLIC_AUTHOR_NAME` is set, show "Reviewed by {name}". ≥ 500 words. This is the key E-E-A-T page |
| `/fee-updates/` | `Fee Updates Log – Platform Fee Changes Tracked` | Generated from `src/data/fee-history.ts`: reverse-chronological list (date, platform, change, link to source, link to calculator). Seed it with the changes found during research: Depop removed US selling fee (2024) and boosting rate change (Mar 23, 2026 — verify); Mercari 10% seller fee for listings from Jan 6, 2025; Poshmark reverted to 20% / $2.95 (Oct 24, 2024) and Texas seller fee tax (Oct 1, 2025); Grailed 6% under $120 (May 20, 2026); Whatnot tiered commission; TCGplayer commission to 10.75% and cap $75 (Jan 2026); KDP 70% band widened to $2.99–$12.99 (July 7, 2026 — verify); StockX Flex +2% (Mar 1, 2026) and StockX Live transaction fee (Dec 1, 2026 — verify); PayPal US fee page updated Nov 4, 2026. Each entry must link its source |
| `/about/` | `About AfterFees` | Independent project; why; editorial independence (no paid placements; if affiliate links are ever added they'll be disclosed); contact |
| `/privacy/` | `Privacy Policy – AfterFees` | No accounts; calculations run in the browser and are never sent to us; preferences in localStorage; hosting logs; Google AdSense cookies & personalised ads (opt-out links: Google Ads Settings, aboutads.info); EEA/UK consent via Google's certified CMP; US state privacy rights; optional cookieless analytics; children; contact; effective date |
| `/terms/` | `Terms of Use – AfterFees` | Estimates only; no warranty of accuracy; not financial, tax or legal advice; confirm with the platform; trademarks belong to owners; owner-editable jurisdiction placeholder `<!-- OWNER: set governing law -->` |
| `/contact/` | `Contact – AfterFees` | mailto from env; "Report a fee error" guidance (platform, page, what changed, source link) |
| `/404` | `Page Not Found – AfterFees` | CalcGrid; noindex; no ads |

No ads on trust/legal/404 pages.

---

## 13. Technical SEO specification

1. `Seo.astro`: title, meta description, canonical (absolute, trailing slash, no query), robots, Open Graph (title, description, url, type website, site_name, image 1200×630, image:alt), Twitter `summary_large_image`, theme-color (light/dark), GSC meta.
2. **JSON-LD:**
   - Home: `WebSite` + `Organization` (name, url, logo).
   - Calculator pages: `WebApplication` (`applicationCategory: "FinanceApplication"`, `operatingSystem: "Any"`, `offers` price 0 USD, `isAccessibleForFree`, `browserRequirements`), `BreadcrumbList`, `FAQPage` (exactly matching visible FAQs).
   - Comparison/hub pages: `Article` (headline, dateModified = latest verifiedAt of included schedules, author = Organization or `PUBLIC_AUTHOR_NAME` Person) + BreadcrumbList + FAQPage.
   - Fee updates: `Article` with `dateModified`.
   - **No** `AggregateRating`/`Review`/`HowTo`/`FinancialProduct` markup.
3. Sitemap (`@astrojs/sitemap`, exclude 404) with `lastmod` = schedule `verifiedAt` for calculator pages (use the integration's `serialize` hook).
4. robots.txt endpoint referencing `${SITE_URL}/sitemap-index.xml`.
5. URLs: lowercase, hyphenated, trailing slash, **no years in URLs** (years only in titles).
6. Internal linking: registry-driven related calculators (3–6), hubs link to every calculator, every calculator links to its hub, its comparison pages and the compare tool; footer lists all; high-CPC pages (Stripe, Square, PayPal G&S, Venmo business, Clover, TikTok Shop, Depop) linked from hubs and sidebars.
7. Outbound links to official fee pages (`rel="noopener"`, open in same tab is fine) — they support trust; do not nofollow official sources.
8. Freshness signals: visible "Fees verified {date}" per calculator, `dateModified` in schema, Fee updates page.
9. Core Web Vitals: LCP < 1.5 s on fast 4G mobile, CLS < 0.05 (ad slots reserve space; server-rendered results so no layout jump when JS hydrates), INP < 100 ms.

---

## 14. AdSense and monetisation

### 14.1 Implementation
Same pattern as a standard static AdSense setup:
- `AdSenseScript.astro` adds the async script with `?client=` only when `PUBLIC_ADSENSE_CLIENT` is set and `showAds` is true.
- `AdSlot.astro` with positions `below-results | in-content | sidebar | before-faq`; renders nothing in production when client/slot env is missing; dashed placeholder in `astro dev`; label "Advertisement"; reserved min-height (280px mobile / 120px desktop for horizontal; sidebar 600px sticky).
- `ads.txt` endpoint: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` derived from the client ID; otherwise a comment line.

### 14.2 Placement rules (policy + UX — critical on input-heavy pages)
- **Never** place an ad between inputs and results, inside the calculator card, or adjacent to inputs/buttons (accidental-click risk and terrible UX). First ad goes after the SourceNote below the full calculator card.
- On mobile, the sticky mini-result bar must never overlap an ad or vice versa; do not use sticky/anchor ads on mobile in v1.
- Max 4 ad units per page; none on trust/legal/404.
- No ads styled like calculator controls; no "click" language near ads.
- Manual placements only (no Auto ads in v1).
- Consent: owner enables Google's certified CMP for EEA/UK and US state regulations in AdSense.

### 14.3 Future monetisation (do not build now; keep architecture open)
Affiliate links to processors/listing tools could be added later with clear disclosure on each page and in About. Do not add any affiliate code in this build.

---

## 15. Performance, security headers, hosting and deploy

### 15.1 Budgets (tested)
JS ≤ 30 KB gz per calculator page (≤ 45 KB gz on compare/hub pages), CSS ≤ 25 KB gz, HTML ≤ 80 KB (tables can be large; keep markup lean).

### 15.2 `public/_headers`
```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  X-Frame-Options: SAMEORIGIN

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

### 15.3 Hosting
Cloudflare Pages: build `npm run build`, output `dist`, `NODE_VERSION=22.23.4` (or newer), env vars per §6. Apex domain + `www` → apex redirect. Netlify works with the same `_headers`.

### 15.4 README
Dev, test, deploy, env vars, **how to update a fee** (edit schedule → update `verifiedAt`, `sources[].quote`, add `fee-history` entry → update golden tests → `npm test`), how to add a platform, manual QA checklist.

### 15.5 CI (optional)
`.github/workflows/fee-calculator-site.yml` on changes under `fee-calculator-site/**`: Node 22.23.4+, `npm ci`, `npx playwright install --with-deps chromium`, `npm test`. A scheduled weekly job running `npm run sources` (report-only) is a nice-to-have. Pushing workflow files may need a token with `workflow` scope; if rejected, keep the file and tell the owner.

---

## 16. Testing specification

### 16.1 Type check
`npm run check` — zero errors/warnings in `src/`.

### 16.2 Unit tests (`tests/unit`, Vitest)
| File | Must test |
|---|---|
| `money.test.ts` | parse ("$1,234.56", "1234.5", ".99", "", "-1", "abc", "1e9") → cents or error; format; half-up and bankers rounding at .5 boundaries; no float drift (sum of 1,000 random lines equals integer sum) |
| `primitives.test.ts` | percentOf, tieredMarginal (exactly at, just below, just above each threshold), tieredWhole, capped, atLeast, clampRange |
| `schedules/*.test.ts` | **Every golden case in Appendix B** (exact cents unless marked ±1¢); every option; zero price; very large price; shipping/tax inclusion rules; buyer-paid lines excluded from payout; warnings emitted where specified |
| `schedules.meta.test.ts` | Every schedule: unique id; `sources.length ≥ 1` with https URL on the platform's official domain (allow-list per platform) and non-empty quote; `verifiedAt` valid ISO date not in the future; `status` set; `summary` non-empty; `breakpoints()` sorted unique; `compute` never returns negative fees or NaN for 500 random inputs (property test with seeded RNG) |
| `solve.test.ts` | Reverse solver returns the **minimum** price, cross-checked against an independent brute-force search over every cent: Poshmark target payout $12.00 → **$14.95**; target $12.01 → **$14.96** (still under the flat-fee threshold — a naive solver that assumes monotonic fees would wrongly return a price above $15); eBay target payout $8.60 (no shipping/tax) → **$10.42** (prices up to $10.00 can't reach it because of the per-order step); Facebook minimum-fee region; processors: closed form vs brute force for 1,000 random targets; unreachable target → null |
| `compare.test.ts` | Sorting by payout; assumptions footnotes present; identical inputs across platforms |
| `url-state.test.ts` | Round-trip encode/decode; clamping of malicious/out-of-range params; unknown params ignored |
| `registry.test.ts` | Paths unique; related ids resolve; every page with `scheduleId` maps to an existing schedule; phase consistency |
| `freshness.test.ts` | **Fails** if any shipped schedule's `verifiedAt` is older than 180 days relative to build date; **warns** (console) at > 90 days; fails if any shipped schedule has `status: 'unverified'` **unless** the affected rate is exposed as an editable input (`schedule.unverifiedFields` listed and UI shows the confirm note) |
| `history.test.ts` | Fee history entries sorted desc, each with https source and existing platform id |

### 16.3 Built-site QA (`tests/site`, Vitest over `dist/`)
For every page:
- One H1; title ≤ 60 (actual year substituted), unique; meta 140–160 (trust/legal 70–160), unique.
- Canonical absolute, trailing slash, no query string, equals page URL.
- OG tags present; og:image exists.
- JSON-LD parses; required types per §13.2; FAQPage text equals visible FAQ text.
- No broken internal links (`/path/` → `dist/path/index.html`); all internal links end with `/` (except files).
- Word counts per §11 (article text).
- Primary keyword (from `src/data/keywords.ts`) in title, H1 and first 100 words.
- **Rate consistency:** every page's server-rendered default result and `WorkedExamples` numbers equal `schedule.compute(...)` recomputed in the test (parse numbers from `data-cents` attributes, not text).
- **No hard-coded rates in prose:** fail if a page's article text contains a percentage that doesn't match any constant of the schedules linked from that page (allow-list for generic numbers like "100%"); this catches stale copy after fee updates.
- SourceNote present on every calculator page with a link whose host matches the schedule's official domain allow-list, and a "Fees verified" date equal to `schedule.verifiedAt`.
- "Unofficial calculator — not affiliated with {Platform}" present on each calculator page.
- No platform logo images (no `<img>` whose src/alt contains platform names).
- Budgets per §15.1.
- Ads: default build has zero `adsbygoogle`/`googlesyndication`; ads-on build (`OUT_DIR=dist-ads PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000 PUBLIC_ADSENSE_SLOT_*=1234567890 astro build`) has the script once on calculator pages, ≤ 4 `<ins>` per page, **no ad element located between the calculator card and the SourceNote (DOM order check)**, none on trust/legal/404; ads.txt contains `pub-0000000000000000`.
- Sitemap lists every indexable page with `lastmod`; robots references it; `_headers` copied.
- Banned phrases (outside disclaimers): "guaranteed", "exact fees" (we provide estimates), "official calculator", "tax advice".

### 16.4 End-to-end (`tests/e2e`, Playwright, Chromium desktop 1366×768 + Pixel 7)
Config: `webServer` = `npm run preview`; `--trace off`; in Claude Code cloud containers use pre-installed browsers (pin 1.63.0 or set `executablePath`).
- **All pages smoke:** 200, no console/page errors, one H1, no horizontal overflow at 360 px, calculator visible in first viewport on calculator pages, axe zero serious/critical.
- **eBay calculator:** default render shows server-computed payout before JS; type price 100, shipping 10 → `out-fees` = $15.36, `out-payout` = $94.64; set tax 8% → fees $16.56; choose category "Athletic Shoes", price 200 → fees $16.00, no per-order line; store Basic → 12.7% line; promoted 5% → ad fee line on correct base; international toggle → 1.65% line; reverse mode target payout $94.64 → price ≈ $100.00 (shipping fixed at 10).
- **Poshmark threshold:** price 14.99 → fee $2.95; 15.00 → per verified rule (Appendix A.5); reverse target $12.00 → $14.95.
- **Depop / Mercari / Whatnot / Grailed / Etsy:** one golden case each through the UI.
- **Stripe:** 100 → fee $3.20, receive $96.80; international → $4.70; reverse receive 100 → charge $103.30; ACH 5,000 → $5.00.
- **PayPal:** checkout 100 → $3.98; international checkout → $5.48; G&S 100 → $2.99 (per verified rule).
- **Square / Venmo / Cash App:** one golden case each; Venmo instant 10 → $0.25 (min), 2,000 → $25.00 (cap).
- **Compare tool:** price 50, shipping 8 → table sorted by payout; each row's payout equals the platform calculator's result for the same inputs (open each linked calculator via its prefilled link and compare).
- **URL state:** `/stripe-fee-calculator/?price=250&type=international` renders the right result; "Copy link" produces a URL that restores identical state in a new page.
- **Validation:** "-5", "abc", empty → inline error, results show "—", no NaN anywhere on the page (assert page text never contains "NaN" or "Infinity").
- **Keyboard:** complete a calculation using only Tab/typing/Enter; focus order logical; mode switch operable with arrow keys.
- **Theme toggle** persists; **no-JS:** with JavaScript disabled, calculator pages still show the default worked result and the worked-examples table.
- **Screenshots** (not asserted) of home, eBay, Stripe, Depop vs Poshmark at 390×844 and 1440×900 into `test-results/screenshots/` — review them and fix visual issues.

### 16.5 Manual QA (owner, before launch — in README)
Spot-check 3 platforms against the platforms' own seller dashboards/fee previews (eBay listing fee preview, Etsy sold order fees, Stripe dashboard) and record results in DECISIONS.md.

---

## 17. Content writing rules

1. **Audience:** US resellers, crafters, creators, freelancers and small-business owners pricing items or invoices *right now*. Plain US English, short paragraphs, tables and worked examples.
2. **Lead with the number.** "Depop charges a 3.3% + $0.45 payment processing fee on US sales and no selling fee." Then explain.
3. **Every rate in prose comes from schedule constants** (template helpers), never typed by hand. Each page cites its official source with a link and date.
4. **Honesty:** state what the calculator doesn't model (custom/negotiated rates, promotions, account-specific tiers, currency conversion spreads, chargebacks, shipping label variations, state-specific taxes). Show tier assumptions as warnings. Never claim "exact" or "official".
5. **Not advice:** no tax, legal or financial advice. For taxes say: marketplaces collect and remit sales tax in most states; income from sales may be reportable; platforms issue Form 1099-K above IRS thresholds — check IRS.gov (link) for current thresholds; consult a tax professional. Surcharging: describe constraints at a high level and point to processor/state rules.
6. **Neutral comparisons:** facts and numbers only; no disparaging language; no fabricated statistics ("X% of sellers…") — only cite numbers with sources.
7. **Trademarks:** platform names used descriptively; disclaimer on each calculator and footer; no logos.
8. **Freshness language:** "Fees verified {date}" rather than "updated today"; no fake "updated" dates — dates come from data.
9. **Style:** sentence-case headings; "$0.30" not "30 cents" in tables; "%" with numbers; consistent terms ("payout" = what the platform sends you; "profit" = payout minus your costs).
10. **Avoid fluff:** no "In today's fast-paced world", no "Look no further", no filler intros.

---

## 18. Fee data maintenance process

This site lives or dies on current data. Build these into the repo:
1. **Schedule metadata** (`verifiedAt`, `sources[]` with quotes) + `fee-history.ts` changelog.
2. **`scripts/check-sources.mjs`:** for each source URL, fetch (with Playwright fallback for JS pages), extract main text, normalise whitespace, hash; compare with `src/data/source-hashes.json`; print a table of changed/unreachable sources. Never auto-edit fees. Owner runs monthly (or weekly CI job).
3. **Freshness gate:** build-time test fails > 180 days (§16.2), warns > 90 days.
4. **Owner checklist (README):** monthly `npm run sources`; when a source changed → read it → update schedule + quotes + `verifiedAt` + fee-history entry → update golden tests → `npm test` → deploy. Also watch platform seller news pages (eBay Seller Center news, Etsy announcements, Depop newsroom, Mercari help "fee structure" articles, Whatnot help center, Stripe/PayPal pricing pages).

---

## 19. Build milestones

| # | Milestone | Deliverables | Acceptance |
|---|---|---|---|
| **M0** | Setup | Scaffold, configs, scripts, `.env.example`, README skeleton, DECISIONS.md, Playwright per environment | `npm run build` + `npm run check` pass |
| **M1** | Fee verification + engine core | Re-open every `VERIFIED` source and confirm; resolve all `PARTIAL`/`UNVERIFIED` items needed for Phase 1 (record quotes/decisions); `money.ts`, `primitives.ts`, `types.ts`, `solve.ts`, `compare.ts`, `url-state.ts`; Phase-1 schedules; unit tests incl. Appendix B goldens | Unit tests green; DECISIONS.md lists every resolution with source quotes |
| **M2** | Layout, design system, SEO, ads | Tokens/CSS, BaseLayout, CalcLayout, Header/Footer/Breadcrumbs/Theme, Seo/JsonLd, Faq, SourceNote, LastVerified, AdSlot/AdSenseScript, ads.txt/robots endpoints, registry, favicon/OG via script | Site QA on placeholder pages passes |
| **M3** | Calculator components | PlatformCalculator, inputs, ResultsPanel, BreakdownTable, SplitBar, ModeSwitch, CompareTool, WorkedExamples, FeeTable, ComparisonTable, Share | Component e2e tests green |
| **M4** | Phase-1 pages | Home, 2 hubs, 8 marketplace pages, 7 payment pages, 2 comparisons, trust/legal pages, fee-history seed | Full `npm test` green |
| **M5** | Phase-2 | Phase-2 schedules (after verification), pages, tests | Full `npm test` green |
| **M6** | Phase-3 (conditional) | Copart/IAA only if tables fully verified; else README TODO with reasons | — |
| **M7** | QA & polish | Budgets, axe, screenshots reviewed and visual fixes, `check-sources` script works, README complete | Everything green |
| **M8** | Handoff | Final report (§0.8), optional CI, push branch | Pushed; report delivered |

---

## 20. Definition of done

- [ ] All Phase 1 and Phase 2 pages exist with specified titles/metas/H1s/content/FAQs/word counts; Phase 3 built or documented as skipped with reasons.
- [ ] Every shipped schedule: `status` verified (or unverified fields exposed as editable inputs with a confirm note), sources with quotes, `verifiedAt` ≤ 180 days old.
- [ ] All Appendix B golden cases pass (updated only if verification changed a rule — with the change documented).
- [ ] Reverse mode returns the minimum price on every calculator; compare tool equals individual calculators.
- [ ] `npm test` passes end to end; summary in the final report.
- [ ] No console errors, no NaN/Infinity rendered, no horizontal scroll at 360 px, axe clean, budgets met, works without JS for default results.
- [ ] Ads compliant (§14.2); zero ad code without env.
- [ ] README (incl. fee update process and manual QA) and DECISIONS.md complete; `fee-history` seeded.

---

## 21. Post-launch checklist (for the human owner)

1. Register `afterfeescalc.com` (or alternative); deploy on Cloudflare Pages with env vars.
2. Search Console: verify, submit sitemap, request indexing of home, hubs and Phase-1 calculators.
3. Apply for AdSense after Phase-1 + trust pages are live; then set client + slot IDs, enable EEA/UK consent + US state regulations, redeploy, check ads.txt.
4. **Monthly:** `npm run sources`; update changed fees the same day (being first with correct new fees is a ranking and trust advantage — add a Fee updates entry).
5. Links/visibility: answer pricing/fee questions genuinely in reseller communities (r/Flipping, r/poshmark, r/Depop, r/Etsy, r/EtsySellers, r/whatnotapp, r/stripe, r/smallbusiness — follow each community's self-promotion rules); reseller newsletters/YouTubers; small-business directories; a free embeddable fee widget (later).
6. Track rankings in OpenSEO (project "Micro-Tools Niche Research"; saved clusters `cluster-ebay-fee-calculator` (54 keywords) and `cluster-stripe-fee-calculator` (34 keywords)).
7. Month-3 review: Search Console queries → add missing platforms/variants where impressions exist (e.g. eBay store break-even, Etsy pricing for specific crafts, Square plan comparison).

---

## 22. Known gotchas

1. **Fees change often** (we found 8+ changes in 2024–2026 alone). The verification step in M1 is mandatory, and the freshness gate must stay on.
2. **Non-monotonic fees** (Poshmark $15, eBay $10 per-order step, Grailed $120, minimum fees) break naive binary-search reverse calculators — use the breakpoint-aware solver.
3. **Fees on sales tax:** eBay (FVF) and several processors' fees apply to tax-inclusive totals; payouts exclude tax. Tax default 0% → show the note.
4. **Rounding** isn't always documented; compute per line, round half-up, document assumptions; allow ±1¢ only where undocumented.
5. **Official pages that render with JavaScript** (Copart) or put tables in images (IAA) — use Playwright; if not transcribable, don't ship the calculator.
6. **Conflicting official pages** (Poshmark "$15 and under" vs "under $15"; Venmo Tap to Pay 2.9% vs 2.29%; Cash App instant 0.5–1.75% vs 0.5–2.5%; Depop boost 8% vs 12%) — resolve by the most recent/binding document (fee policy/terms over marketing pages), record in DECISIONS.md.
7. **Account-specific pricing** (Whatnot tiers, StockX levels, TCGplayer seller types, Clover merchant agreements, Stripe custom pricing) → expose as options with sensible defaults and warnings.
8. **Trademark/impersonation:** no logos, no lookalike UI, clear "unofficial" labelling.
9. **Astro 7 requires Node ≥ 22.23.4; TypeScript must be 6.x** for `@astrojs/check`.
10. **Playwright in Claude Code cloud containers:** browsers pre-installed at `/opt/pw-browsers` (v1.63.0); don't run `playwright install`.
11. **Year in titles** comes from the build date — remember to redeploy in January (README note) so "{YEAR}" titles roll over.
12. **Floating-point money bugs:** never use floats for displayed money; all results in integer cents.

---

## Appendix A — Fee schedules, sources and verification status

All fees are US, USD, as read on **2026-11-14**. Status legend: **VERIFIED** (official page, quote captured) · **PARTIAL** (official, but an ambiguity/conflict to resolve) · **UNVERIFIED** (secondary or stale source — must verify). Quotes are short excerpts from the official page.

### A.1 eBay (non-store and store) — VERIFIED (except where marked)
Sources: https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822 · https://www.ebay.com/sellercenter/selling/start-selling-on-ebay/seller-fees · https://www.ebay.com/help/selling/fees-credits-invoices/store-selling-fees-managed-payments-sellers?id=4809 (no effective date shown on pages; no 2026 fee change found on Seller News for Aug/Nov 2026 — a third-party blog's claim of a July 2026 flat-rate reform was **not** confirmed; re-check Seller News months not read: Jan–Jul, Sep, Oct 2026).

**Final value fee base:** "The total amount of the sale includes the item price, any handling charges, any shipping costs collected from the buyer (some exceptions apply), sales tax, and any other applicable fees." Exceptions: 1-day/international shipping → cheapest domestic option offered; eBay International Shipping → cost to ship to US hub; sneakers with free Authenticity Guarantee label → no FVF on shipping.

**Per-order fee:** "For orders $10.00 or less the per order fee is $0.30, for orders over $10.00 the per order fee is $0.40." Not charged on Athletic Shoes ≥ $150. "An order is defined as any number of items purchased by the same buyer at checkout with the same shipping method."

**Non-store FVF (per item, tiered marginal unless "whole"):**
| Category | Rate |
|---|---|
| Most categories (incl. Motors Parts & Accessories, Automotive Tools & Supplies, Safety & Security Accessories) | 13.6% up to $7,500; 2.35% on portion over $7,500 |
| Books & Magazines; Movies & TV (except Movie NFTs); Music (except Vinyl Records and Music NFTs) | 15.3% up to $7,500; 2.35% over |
| Coins & Paper Money (except Bullion) | 13.25% up to $7,500; 2.35% over |
| Coins & Paper Money > Bullion | 13.6% if sale ≤ $7,500; 7% if over $7,500 (**whole**) |
| Clothing > Women > Women's Bags & Handbags | 15% if ≤ $2,000; 9% if over $2,000 (**whole**) |
| Comic Books & Memorabilia; Non-Sport Trading Cards; Sports Trading Cards; Collectible Card Games | 13.25% up to $7,500; 2.35% over |
| Jewelry & Watches (except Watches, Parts & Accessories) | 15% if ≤ $5,000; 9% if over $5,000 (**whole**) |
| Watches, Parts & Accessories | 15% up to $1,000; 6.5% from $1,000 to $7,500; 3% over $7,500 (marginal) |
| NFT categories | 5% |
| Heavy Equipment; Commercial Printing Presses; Food Trucks, Trailers & Carts | 3% up to $15,000; 0.5% over (insertion fee $20) |
| Musical Instruments > Guitars & Basses | 6.7% up to $7,500; 2.35% over |
| Men's/Women's Athletic Shoes | 8% if ≥ $150 (no per-order fee); 13.6% if < $150 |
| Motors vehicles; Real Estate | Separate fee pages — **out of scope** (show note) |
> **PARTIAL:** confirm whether "whole" categories (Bullion, Women's Bags, Jewelry) apply the higher/lower rate to the entire amount ("if sale is …" wording suggests whole) — implement as whole, note in DECISIONS.md.

**Insertion fees:** 250 zero-insertion-fee listings per month, then $0.35 per listing per category (non-refundable).
**International fee:** "1.65% of the total amount of the sale" when buyer's address is outside the US and the seller isn't using eBay International Shipping. Seller currency conversion charge 3.25% (out of scope; mention).
**Below Standard:** "an additional 6% on the final value fees" (7% after four consecutive months); "Item not as described" Very High: +5% in affected categories. **PARTIAL:** confirm whether this is +6 percentage points on the FVF rate or +6% of the FVF amount (implement as advanced option; default off).
**Reserve fee:** $5 or 7.5% of reserve price, whichever is greater, max $250 (auction-only; out of scope v1 — mention).
**Dispute fee:** $20 per dispute (mention).

**Store subscriptions (monthly renewal / yearly renewal price per month):** Starter $7.95 / $4.95 · Basic $27.95 / $21.95 · Premium $74.95 / $59.95 · Anchor $349.95 / $299.95 · Enterprise not available monthly / $2,999.95 yearly. Insertion allocations: Basic 1,000 fixed-price (all) + 10,000 select; Premium 10,000 + 50,000; Anchor 25,000 + 75,000; Enterprise 100,000 + 100,000 (auction allocations and after-allocation fees per source).
**Store FVF (Basic, Premium, Anchor, Enterprise):**
| Category | Rate |
|---|---|
| Most categories | 12.7% up to $2,500; 2.35% over |
| Books & Magazines (and Movies/Music per source — **verify list**) | 15.3% up to $2,500; 2.35% over |
| Cell Phones & Accessories (most); most Consumer Electronics | 9.35% up to $2,500; 2.35% over |
| Computers/Tablets (listed subset); Video Game Consoles | 7.35% up to $2,500; 2.35% over |
| Coins & Paper Money (most) | 9% up to $4,000; 2.35% over |
| Bullion | 7.5% up to $1,500; 5% $1,500–$10,000; 4.5% over $10,000 |
| Jewelry & Watches (most) | 13% up to $5,000; 7% over $5,000 |
| Watches, Parts & Accessories | 12.5% up to $1,000; 4% to $5,000; 3% over $5,000 |
| Women's Bags & Handbags | 13% up to $2,000; 7% over $2,000 |
| Athletic Shoes | 7% if ≥ $150 (no per-order fee); 12.7% under $150 |
| Guitars & Basses | 6.7% up to $2,500; 2.35% over |
| Heavy Equipment etc. | 2.5% up to $15,000; 0.5% over |
| Motors Parts & Acc. (tires) | 9.5% up to $1,000; 2.35% over · other Parts & Acc./Tools/Safety 11.5% up to $1,000 (**verify upper tier**) |
| NFT | 5% |
| Starter store | Same as non-store FVF (13.6% most categories) |
> The non-store "Consumer Electronics / Cell Phones / Computers" rows: the official non-store table lists them under "Most categories" (13.6%) — confirm during M1 that there are no separate non-store rates for these.

**Promoted Listings:** General strategy = cost per sale ("You'll only pay when your item sells after a click on your ad"); ad rate chosen by seller (2%–100%). **UNVERIFIED:** whether the ad fee base includes shipping and sales tax — check https://www.ebay.com/help/selling/ebay-advertising/promoted-listings-overview?id=5295 . Priority strategy = cost per click (out of scope; mention).

### A.2 Etsy (US) — PARTIAL
Sources: https://www.etsy.com/legal/fees/ · https://help.etsy.com/hc/en-us/articles/360035902374-Etsy-Fee-Basics · https://www.etsy.com/sell
- Listing fee $0.20 per listing (4 months or until sold); multi-quantity: $0.20 for each additional quantity sold (**verify wording**).
- Transaction fee 6.5% of the order total in listing currency, "covers the item price plus any postage and gift wrap you charge".
- Payment processing (Etsy Payments, US): **3% + $0.25** — **verify base** (believed: total sale price incl. shipping and sales tax).
- Offsite Ads: 15% of order total if < $10,000 sales in past 365 days (optional), 12% if ≥ $10,000 (mandatory), capped at $100 per order.
- Currency conversion: 2.5% when listing currency differs from payment account currency.
- Out of scope: Etsy Ads (budget-based), Share & Save credits (mention only if verified), regulatory operating fees (non-US).

### A.3 Mercari (US) — VERIFIED
Sources: https://www.mercari.com/us/help_center/article/169/ · https://www.mercari.com/us/help_center/article/2517/ · https://www.mercari.com/us/help_center/article/2518/
- "A 10% selling fee of the combined amount of item price and buyer-paid shipping will be charged to the seller for listings created or updated on or after January 6, 2025." No separate seller payment processing fee for those listings.
- Buyer pays a 3.6% Buyer Protection fee (show as buyer-paid line; **verify current %**).
- Legacy listings (created before Jan 6, 2025, not updated): processing fee 2.9% + $0.50 — **PARTIAL** (who pays) → show as note only.
- Withdrawals: ACH free ($2 for failed withdrawal); Instant Pay $3.

### A.4 Depop (US) — PARTIAL
Sources: https://www.depop.com/help/seller-fees-and-charges/ · https://news.depop.com/company-news/depop-removes-selling-fees-in-the-united-states-evolves-fee-structure/
- No selling fee for US sellers on USD sales.
- Payment processing (Depop Payments via Stripe): **3.3% + $0.45**, charged on item price + shipping + applicable taxes.
- Boosting fee charged on item price (excl. taxes) and, if not using a Depop shipping label, shipping. Rate: page indicates **12% for listings from 23 March 2026** and **8%** for the other tier — **resolve exact rule** (which listings get 8% vs 12%).
- All fees reversed on refund.

### A.5 Poshmark (US) — PARTIAL
Sources: https://support.poshmark.com/s/article/297755057?language=en_US · https://poshmark.com/terms?poshmark=fee-policy
- Flat **$2.95** on low-priced sales; **20%** on others. **Conflict at exactly $15.00:** support page: "for sales under $15, Poshmark takes a flat commission of $2.95" (→ $15.00 pays 20% = $3.00); Fee Policy text: "20% seller fee for sales over $15 and $2.95 for sales $15 and under" (→ $15.00 pays $2.95). **Resolve using the binding Fee Policy (terms) unless the support page is newer and explicit; record decision.**
- Fee base: listing/sale price (buyer pays shipping via Poshmark label; no shipping input).
- Texas sellers: "Texas Seller Fee Tax" deducted from earnings from Oct 1, 2025 — **verify computation** (tax on the fee?) → advanced option.
- Bundles: fee applied per order (verify) — note only.

### A.6 Whatnot (US) — PARTIAL
Sources: https://www.whatnot.com/seller/fees · https://help.whatnot.com/hc/en-us/articles/4847069165965-Whatnot-seller-fees
- Commission on item final sale price, **excluding shipping and taxes**: standard **8%**; tiers down to **6.5%** based on prior-period sales (recalculated every 4 weeks); custom as low as 3% for select high-volume sellers — **verify tier thresholds** (implement tier select + custom % with default 8%).
- Category exceptions: **Coins & Money** and **Pallets** 4% commission.
- Payment processing: **2.9% + $0.30** on total order value (item + buyer-paid shipping + buyer-paid taxes).
- Taxes on fees in some states deducted from earnings (note).
- Promotions (e.g. 0% commission on portion above $1,500 in select categories, limited time) — note only, dated.

### A.7 Grailed — PARTIAL
Sources: https://support.grailed.com/hc/en-us/articles/30282580172045-What-are-the-fees · https://support.grailed.com/hc/en-us/articles/30299544492301-Does-Grailed-charge-a-payment-processing-fee
- Commission: **9%** for sales ≥ $120; **6%** for sales < $120 on/after **May 20, 2026**, **minimum $1.99**. Base includes buyer-paid shipping unless a Grailed Label is used (then listing price only).
- Payment processing (Stripe): **3.49% + $0.49** US domestic, **4.99% + $0.49** international — from an older article → **verify current**.
- International sellers: 9% commission across the board.

### A.8 Facebook Marketplace (shipped orders) — VERIFIED
Sources: https://www.facebook.com/legal/merchant_policies · https://www.facebook.com/fb-answers/fees-for-selling-on-facebook-marketplace/
- Individual sellers: **10% per shipped transaction, minimum $0.80**, calculated on the total transaction including shipping and applicable taxes. Local pickup: no fee. (Older 5% pages are outdated.)

### A.9 TikTok Shop (US) — VERIFIED
Sources: https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en (updated 10/08/2026) · https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018&lang=en
- Standard referral fee **6%** ("Starting April 1, 2024 … referral fee … 6% per order").
- Exceptions: Jewelry sub-categories Diamond, Gold, Jade, Platinum/Carat Gold, Ruby/Sapphire/Emerald **5%**; Pre-Owned categories **5%** with **3%** on portion over $10,000; Collectibles (Cultural Items, Entertainment, Sports Collectibles, Trading Cards & Accessories) **6%** with **3%** over $10,000.
- Base: "Referral Fee = Referral Fee Rate × (Customer Payment + Platform Discount − Tax)"; "The Referral Fee calculation base includes the shipping fee paid by the customer."
- Refund administration fee: 20% of the referral fee, capped at $5 per SKU (from May 15, 2025).
- Affiliate creator commission: seller-set % (input).

### A.10 StockX — PARTIAL
Sources: https://stockx.com/help/articles/what-are-stockxs-fees-for-sellers · https://stockx.com/help/articles/what-is-the-stockx-seller-program-what-are-seller-levels
- Verified Marketplace: transaction fee by level — L1 9.0%, L2 8.5%, L3 8.0%, L4 7.5%, L5 7.0%; payment processing **3%**. Level thresholds per quarter: L2 12 sales or $1,500; L3 40 or $5,000; L4 200 or $25,000; L5 800 or $100,000.
- Flex: +2% (from Mar 1, 2026). Listings Marketplace: $0 seller transaction fee. Live Marketplace: transaction fee from Dec 1, 2026 (7% L1 → 5% L5) — **verify**.
- Payout: Visa/Mastercard debit 2% (min $1.95, max $9.95); PayPal/Venmo/StockX balance no fee.
- **Verify** fee bases (sale price only?) and any minimum transaction fee.

### A.11 Reverb (US) — VERIFIED
Sources: https://help.reverb.com/hc/en-us/articles/40917652290843-What-fees-will-I-pay-for-selling-on-Reverb · https://help.reverb.com/hc/en-us/articles/41988473838491-Availability-and-processing-fees-for-Reverb-Payments
- Selling fee **5%** of total sale amount incl. shipping, **min $0.50, max $500** (USD).
- Payment processing **3.19% + $0.49** (Preferred Sellers **2.99% + $0.49**), applies regardless of buyer payment method.
- International: +1% cross-border; 2.5% currency conversion if listing currency ≠ payout currency.

### A.12 PayPal (US) — VERIFIED (fee page "Last Updated: November 4, 2026")
Source: https://www.paypal.com/us/business/paypal-business-fees
- Fixed fee (USD, commercial): **$0.49**. International commercial surcharge: **+1.50%**.
- PayPal Checkout / Guest Checkout / Pay with Venmo: **3.49% + $0.49** · Standard credit/debit card: **2.99% + $0.49** · Pay Later: **4.99% + $0.49** · Alternative payment methods: 2.89% + fixed (2.99% + fixed via Payment Links/Buttons) · QR code: **2.29% + $0.09** · Card present: **2.29% + $0.09** · Manual card entry: **3.49% + $0.09** · All other commercial: 3.49% + fixed.
- **Send/Receive Money for Goods and Services: 2.99%** — **PARTIAL:** confirm whether a fixed fee applies (table shows none).
- Invoicing: same as payment method used (3.49%/2.99%/4.99% + $0.49); Pay by Bank (ACH) on invoices **1% capped at $10**.
- **UNVERIFIED:** currency conversion spread (3%/4%), instant transfer (1.5%, min $0.50 — note "paypal instant transfer fee" keyword 1,900/KD 39), chargeback fee ($20) — verify before showing.

### A.13 Stripe (US) — VERIFIED
Sources: https://stripe.com/pricing · https://support.stripe.com/questions/stripe-invoicing-pricing · https://stripe.com/connect/pricing
- Cards (domestic): **2.9% + 30¢**; manually entered: **+0.5%**; international cards: **+1.5%**; currency conversion: **+1%**.
- ACH Direct Debit: **0.8%, $5.00 cap**.
- Terminal (in-person): **2.7% + 5¢** domestic; +1.5% international; +$0.10 per authorization for Tap to Pay.
- Link: 2.9% + 30¢ (+1.5% international, +1% FX).
- Invoicing: **Starter 0.4%**, **Plus 0.5%** per paid invoice (on top of processing).
- Billing: from 0.7% — **UNVERIFIED** (open https://stripe.com/billing/pricing).
- Instant Payouts: **1.5%** of payout volume, **min 50¢**.
- Disputes: **$15.00** per dispute received (countered/appealed fees also $15 — verify wording).
- Connect ("you handle pricing"): **$2 per monthly active account**; **0.25% + 25¢ per payout sent**; Instant Payouts 1% of payout volume; cross-border payouts from 0.25%. "Stripe handles pricing": no platform fee.

### A.14 Square (US) — PARTIAL (official page rate-limited our fetch; figures from Square's official pages via search)
Sources: https://squareup.com/us/en/payments/our-fees · https://squareup.com/us/en/pricing
- In-person (tap/dip/swipe): **2.6% + 15¢** · Online: **2.9% + 30¢** · Invoices & payment links: **3.3% + 30¢** · Manually keyed / card on file: **3.5% + 15¢**.
- **Verify:** plan differences (Free/Plus/Premium), Afterpay rate, instant transfer fee, and the page date (search metadata suggested ~15 months old).

### A.15 Venmo — PARTIAL
Sources: https://venmo.com/business/profiles · https://venmo.com/purchaseprotection · https://help.venmo.com/cs/articles/instant-bank-transfer-faq-vhel302 · https://help.venmo.com/cs/articles/tap-to-pay-on-iphone-faq-vhel116
- Business profile payments: **1.9% + $0.10**.
- Goods & services (personal profile, seller fee): **2.99%**.
- Instant transfer: **1.75%, min $0.25, max $25**; standard transfer free (1–3 business days).
- Tap to Pay: **conflict** — 2.9% + $0.09 (business profile page) vs 2.29% + $0.09 (help article) → resolve.
- Several Venmo pages appear old — **re-verify all four numbers**. Personal friends-and-family payments: free (bank/debit/balance).

### A.16 Cash App — PARTIAL
Sources: https://cash.app/help/US/EN-US/6521-cash-for-business-fees · https://cash.app/us/en/legal/cash-payment-terms · https://cash.app/cardfees
- Business: **2.6% + $0.15** per payment received from a customer's Cash App; **3%** for Tap to Pay. Fees deducted at transaction time; percentage fees use **banker's rounding** (per terms).
- Instant deposit: **conflict** — 0.5%–2.5% ($0.25–$1 min, max $75) vs 0.5%–1.75% ($0.25 min) → resolve; until resolved expose rate as editable (default 1.75%).
- Add money from credit card: 3%. Paper money deposit: $1. Standard deposit: free.

### A.17 Clover — PARTIAL (published starting rates; merchant agreements vary)
Sources: https://www.clover.com/pricing · https://www.clover.com/pricing/flex · https://www.clover.com/pricing/station-duo · https://www.clover.com/pricing/personal-services
- Card present: **2.3%–2.6% + 10¢** depending on plan/bundle (e.g. Starter 2.6% + 10¢, higher tiers 2.3% + 10¢); keyed/card-not-present: **3.5% + 10¢**. Some pages list 2.9% + 30¢ (Register Lite / virtual) — older.
- "Your payment card processor or acquiring bank sets all transaction rates" → present as typical published rates + custom rate input.

### A.18 Toast — UNVERIFIED (no public pay-as-you-go rate)
Sources: https://pos.toasttab.com/pricing
- Pay-as-you-go processing rate not published; American Express card-present 3.29% + 15¢ shown on bundles page. → Do **not** build a Toast calculator; include Toast in the generic credit-card calculator as a **user-entered rate** with an explanation.

### A.19 TCGplayer — PARTIAL
Sources: https://help.tcgplayer.com/hc/en-us/articles/201357836-TCGplayer-Fees · https://help.tcgplayer.com/hc/en-us/articles/360047732673-Fee-Calculation-Examples · https://seller.tcgplayer.com/blog/important-changes-to-tcgplayer-direct-minimum-pricing-and-marketplace-fees
- Marketplace commission: **10.75%** (Level 1–4, from Jan 2026); Pro/Sync **9.25%**; Direct **8.95%**; commission cap raised from $50 to **$75** (**verify per item vs per order**).
- Processing: **2.5% + $0.30** domestic; **3.5% + $0.30** international; Pro fee 2.5%.
- Fee base rules (cash/debit vs credit card; subtotal vs total incl. tax) — **verify using the "Fee Calculation Examples" page and match its examples in golden tests**.

### A.20 Amazon KDP — PARTIAL
Sources: https://kdp.amazon.com/en_US/help/topic/G200644210 (eBook royalties) · https://kdp.amazon.com/en_US/help/topic/G200634560 (list price requirements) · https://kdp.amazon.com/en_US/help/topic/G201834340 (paperback printing cost)
- eBook 70%: "70% of your list price without VAT, less delivery costs" for eligible territories; delivery **$0.15/MB** on Amazon.com; 70% price band on Amazon.com **$2.99–$12.99 effective July 7, 2026** (**verify**). 35% option: 35% of list price, no delivery cost. Public domain works: 35% only.
- Paperback: royalty **50% or 60%** depending on list price and marketplace (**verify threshold**); printing cost = fixed + page count × per-page (by ink type, trim size, marketplace) — **transcribe the full table**. KDP's own example: $9.99 list, 250 pages → royalty ≈ $5.99 at 60% minus printing ≈ $4.00 → ≈ $1.99 per copy (use as a golden test once the table is transcribed).

### A.21 Copart — UNVERIFIED (official fee pages returned empty bodies to a plain fetch; JS-rendered)
Try: https://www.copart.com/content/us/en/member-services/member-fees and Copart's member-fee schedules for licensed/non-licensed, secured/unsecured payment, clean/non-clean title. Needs: buyer-fee tier table (bid ranges → fee, % above top tier), virtual/internet bid fee tiers, gate fee, environmental fee, title mailing fee, broker fees. Phase 3 only.

### A.22 IAA (IAAI) — PARTIAL
Sources: https://www.iaai.com/marketing/standard-iaa-licensed-buyer-fees · https://www.iaai.com/marketing/standard-iaa-non-licensed-buyer-fees · https://www.iaai.com/Marketing/buyer-fees
- Segments: Licensed standard volume ("24 or fewer units purchased, or total vehicle sales less than $75,000 in the past 12 months, OR have 5 or more bidder accounts"), Licensed high volume (25+ units AND $75,000+ AND < 5 bidder accounts), Non-licensed.
- Tier tables and internet/proxy bid fee tables are **images** labelled "Effective November 4, 2024" — must be transcribed.
- Ancillary (Effective October 1, 2026): Service fee **$105 per unit**; Title-handling fee **$20**; Premium Imagery Set fee **$10** (eligible vehicles); EH&S and fuel surcharge (no amount); storage varies by branch. Phase 3 only.

---

## Appendix B — Golden test cases

Computed from the rules in Appendix A with half-up rounding per fee line. **If M1 verification changes a rule, recompute the affected cases, update this table in the repo copy (`tests/unit/golden.md`), and note it in DECISIONS.md.** Defaults: tax 0%, no discount, seller costs 0 unless stated.

| # | Platform / options | Inputs | Expected |
|---|---|---|---|
| E1 | eBay, most categories, no store | price $100, shipping $10 | FVF 13.6% × $110 = **$14.96**; per-order **$0.40**; fees **$15.36**; payout **$94.64** |
| E2 | eBay, same | price $8, shipping $0 | FVF $1.088 → **$1.09**; per-order **$0.30**; fees **$1.39**; payout **$6.61** |
| E3 | eBay, same | price $10,000 | 13.6% × 7,500 = $1,020.00 + 2.35% × 2,500 = $58.75 → FVF **$1,078.75**; + $0.40 → **$1,079.15** |
| E4 | eBay, Athletic Shoes | price $200 | FVF 8% = **$16.00**; no per-order fee; fees **$16.00** |
| E5 | eBay, Athletic Shoes | price $149.99 | 13.6% → $20.398… → **$20.40** + $0.40 = **$20.80** |
| E6 | eBay, most categories, tax 8% (on item + shipping) | price $100, shipping $10 | base $118.80; FVF $16.1568 → **$16.16** + $0.40 = **$16.56**; payout **$93.44** |
| E7 | eBay, Basic store, most categories | price $100, shipping $10 | 12.7% × $110 = **$13.97** + $0.40 = **$14.37** |
| E8 | eBay, Women's Bags (whole), no store | price $2,500 | 9% × 2,500 = **$225.00** + $0.40 = **$225.40** (if M1 confirms "whole") |
| E9 | eBay, international buyer | price $100, shipping $10 | E1 + 1.65% × $110 = **$1.82** (1.815 → 1.82) → fees **$17.18** |
| T1 | Etsy, no Offsite Ads | price $25, shipping $5 | listing **$0.20**; transaction 6.5% × $30 = **$1.95**; processing 3% × $30 + $0.25 = **$1.15**; fees **$3.30**; payout **$26.70** (assumes processing base excludes tax at 0% tax) |
| T2 | Etsy, Offsite Ads 15% | price $25, shipping $5 | T1 + 15% × $30 = **$4.50** → fees **$7.80** |
| T3 | Etsy, Offsite Ads 15% | price $1,000 | Offsite Ads capped at **$100.00** |
| D1 | Depop, not boosted | price $40, shipping $8 | processing 3.3% × $48 = $1.584 → **$1.58** + $0.45 = **$2.03**; payout **$45.97** |
| P1 | Poshmark | price $10 | fee **$2.95**; payout **$7.05** |
| P2 | Poshmark | price $14.99 | fee **$2.95**; payout **$12.04** |
| P3 | Poshmark | price $15.00 | **$3.00** (support-page rule) or **$2.95** (fee-policy rule) — per M1 decision |
| P4 | Poshmark | price $100 | fee **$20.00**; payout **$80.00** |
| M1 | Mercari | price $50, buyer-paid shipping $7 | 10% × $57 = **$5.70**; payout **$51.30**; buyer protection fee shown as buyer-paid line (3.6% × $57 = $2.05, not deducted) |
| W1 | Whatnot, standard 8% | price $50, shipping $5, tax $4 (enter as 7.2727…% → use explicit tax amount option in test helper) | commission 8% × $50 = **$4.00**; processing 2.9% × $59 = $1.711 → **$1.71** + $0.30 = **$2.01**; fees **$6.01** |
| W2 | Whatnot, Coins & Money | price $100 | commission **$4.00**; processing $2.90 + $0.30 = **$3.20**; fees **$7.20** |
| G1 | Grailed, Grailed label, domestic | price $100 | commission 6% = **$6.00**; processing 3.49% × $100 + $0.49 = **$3.98**; fees **$9.98** (verify processing) |
| G2 | Grailed, Grailed label | price $200 | 9% = **$18.00**; processing $6.98 + $0.49 = **$7.47**; fees **$25.47** |
| G3 | Grailed | price $20 | 6% = $1.20 → min **$1.99** |
| F1 | Facebook Marketplace | total $5 (incl. shipping) | 10% = $0.50 → min **$0.80** |
| F2 | Facebook Marketplace | total $50 | **$5.00** |
| K1 | TikTok Shop, standard | customer pays $30 item + $5 shipping, tax $2 | base $35 (tax excluded) → 6% = **$2.10** |
| X1 | StockX Level 1 | price $200 | transaction 9% = **$18.00**; processing 3% = **$6.00**; payout **$176.00** (verify bases) |
| R1 | Reverb, standard | price $500, shipping $30 | selling 5% × $530 = **$26.50**; processing 3.19% × $530 = $16.907 → **$16.91** + $0.49 = **$17.40**; fees **$43.90** |
| R2 | Reverb | price $5 | selling 5% = $0.25 → min **$0.50** |
| S1 | Stripe, domestic card | charge $100 | **$3.20**; receive **$96.80** |
| S2 | Stripe, international card | charge $100 | 4.4% + 30¢ = **$4.70** |
| S3 | Stripe, manually entered | charge $100 | 3.4% + 30¢ = **$3.70** |
| S4 | Stripe, reverse (receive $100) | — | charge **$103.30** (fee $2.9957 → $3.00 + $0.30 = $3.30) |
| S5 | Stripe ACH | charge $5,000 | min(0.8% × 5,000 = $40, $5) = **$5.00** |
| S6 | Stripe ACH | charge $200 | **$1.60** |
| S7 | Stripe Terminal | charge $100 | 2.7% + 5¢ = **$2.75** |
| S8 | Stripe Invoicing Starter + card | invoice $1,000 | invoicing 0.4% = **$4.00** + card $29.00 + $0.30 = **$33.30** total |
| Y1 | PayPal Checkout | $100 | **$3.98**; receive **$96.02** |
| Y2 | PayPal Checkout, international | $100 | 4.99% + $0.49 = **$5.48** |
| Y3 | PayPal standard card | $100 | 2.99% + $0.49 = **$3.48** |
| Y4 | PayPal Goods & Services | $100 | **$2.99** (if no fixed fee confirmed) |
| Y5 | PayPal invoice paid by ACH | $2,000 | 1% = $20 → cap **$10.00** |
| Q1 | Square in-person | $100 | **$2.75** |
| Q2 | Square online | $100 | **$3.20** |
| Q3 | Square invoice | $100 | **$3.60** |
| Q4 | Square keyed | $100 | **$3.65** |
| V1 | Venmo business profile | $100 | **$2.00** |
| V2 | Venmo goods & services | $100 | **$2.99** |
| V3 | Venmo instant transfer | $10 | 1.75% = $0.175 → min **$0.25** |
| V4 | Venmo instant transfer | $100 | **$1.75** |
| V5 | Venmo instant transfer | $2,000 | $35 → cap **$25.00** |
| C1 | Cash App business payment | $100 | **$2.75** (banker's rounding) |
| C2 | Cash App business payment | $10.50 | 2.6% × 10.50 = $0.273 → $0.27 + $0.15 = **$0.42** |
| B1 | KDP eBook 70%, 2 MB | list $4.99 | delivery $0.30; 70% × (4.99 − 0.30) = $3.283 → **$3.28** |
| B2 | KDP eBook 35% | list $4.99 | **$1.75** (1.7465 → 1.75) |
| B3 | KDP eBook | list $1.99 | 70% not eligible (below band) → auto 35% = **$0.70** (0.6965 → 0.70) |
| SOLVE1 | Poshmark reverse, target payout $12.00 | — | **$14.95** |
| SOLVE2 | Poshmark reverse, target payout $12.01 | — | **$14.96** (14.96 − 2.95 = 12.01; must not jump past the $15 threshold) |
| SOLVE3 | eBay reverse (most categories, no store, shipping $0, tax 0%), target payout $8.60 | — | **$10.42** ($10.42 − $1.42 FVF − $0.40 = $8.60; $10.41 gives $8.59; $10.00 gives only $8.34) |
| SOLVE4 | Stripe reverse, receive $100.00 | — | **$103.30** ($103.29 → receive $99.99) |

---

## Appendix C — Full keyword data

US, 2026-11-14 (OpenSEO / DataForSEO). KD 0–100. "—" = no CPC data. Google Ads groups close variants — don't sum variants that share one bucket.

### C.1 Marketplace calculators
| Keyword | Vol | KD | CPC |
|---|---|---|---|
| ebay fee calculator | 40,500 | 16 | $7.74 |
| ebay fees | 33,100 | 28 | $1.22 |
| ebay calculator | 14,800 | 32 | $6.04 |
| ebay fees calculator | 8,100 | 11 | $5.38 |
| ebay profit calculator | 5,400 | 18 | $3.56 |
| copart fee calculator | 4,400 | 0 | $4.02 |
| us ebay fee calculator | 3,600 | 16 | $5.69 |
| depop fees | 3,600 | 0 | $5.25 |
| copart fees | 2,900 | 0 | $3.44 |
| etsy fee calculator | 2,900 | 9 | $0.87 |
| etsy fees | 2,900 | 29 | $1.70 |
| how much does ebay take | 2,400 | 27 | $1.14 |
| depop fee calculator | 1,900 | 0 | $11.14 |
| whatnot fees | 1,900 | 1 | $0.53 |
| poshmark fees | 1,900 | 0 | $4.00 |
| grailed fees | 1,900 | 0 | $2.33 |
| whatnot fee calculator | 1,600 | 0 | — |
| tcgplayer fees | 1,600 | 4 | $0.07 |
| how much does depop take | 1,300 | 0 | $6.15 |
| how much does poshmark take | 1,300 | 1 | $4.06 |
| mercari fees | 1,300 | 0 | $6.16 |
| iaai fee calculator | 1,300 | 0 | $8.07 |
| ebay final value fee | 1,300 | 32 | $5.69 |
| ebay store fees | 1,300 | 34 | $2.72 |
| kdp royalty calculator | 1,000 | 1 | $0.46 |
| ebay fee calculator 2026 | 880 | 12 | $6.77 |
| how much does etsy take | 880 | 21 | $2.18 |
| iaai fees | 880 | 0 | $9.04 |
| etsy profit calculator | 720 | 1 | $3.85 |
| how much does whatnot take | 720 | 0 | $9.67 |
| grailed fee calculator | 720 | 0 | — |
| copart buyer fees | 720 | 10 | — |
| facebook marketplace fees | 720 | 0 | $0.06 |
| amazon fba fee calculator *(excluded)* | 590 | 24 | $14.33 |
| mercari fee calculator | 590 | 0 | — |
| poshmark fee calculator | 590 | 0 | $0.15 |
| reverb fee calculator | 590 | 0 | — |
| ebay final value fee calculator | 480 | 32 | — |
| reverb fees | 480 | 0 | $0.24 |
| tcgplayer fee calculator | 480 | 0 | — |
| stockx fees | 480 | 0 | — |
| gunbroker fee calculator *(excluded)* | 480 | 0 | — |
| ebay shipping fee calculator | 390 | 6 | $3.21 |
| kdp printing cost calculator | 390 | 0 | $15.08 |
| tiktok shop fees | 320 | 0 | $51.23 |
| tiktok shop fee calculator | 260 | 0 | $37.29 |
| depop profit calculator | 260 | 0 | — |
| etsy pricing calculator | 260 | 14 | $1.51 |
| iaai buyer fees | 260 | 0 | $9.28 |
| stockx seller fees | 260 | 0 | $2.09 |
| poshmark calculator | 210 | 0 | $0.94 |
| facebook marketplace fee calculator | 140 | 0 | — |
| tiktok shop seller fees | 140 | 15 | $37.62 |
| whatnot profit calculator | 140 | 0 | — |
| stockx fee calculator | 70 | 0 | — |

### C.2 Payment calculators
| Keyword | Vol | KD | CPC |
|---|---|---|---|
| paypal fee calculator | 18,100 | 32 | $8.24 |
| paypal goods and services fee | 12,100 | 30 | $16.26 |
| paypal fees | 9,900 | 49 | $12.91 |
| paypal fee | 9,900 | 43 | $7.10 |
| square fees | 8,100 | 28 | $8.74 |
| stripe fees | 5,400 | 12 | $5.07 |
| stripe fee | 5,400 | 13 | $5.07 |
| venmo fees | 5,400 | 11 | $0.36 |
| venmo instant transfer fee | 4,400 | 9 | $14.60 |
| square processing fees | 3,600 | 8 | $10.80 |
| cash app fees | 3,600 | 28 | $3.30 |
| paypal goods and services fee calculator | 2,400 | 28 | — |
| stripe processing fee | 2,400 | 11 | $4.88 |
| cash app instant transfer fee | 2,400 | 5 | — |
| venmo business fee | 1,900 | 19 | $21.63 |
| paypal instant transfer fee | 1,900 | 39 | $4.72 |
| fee calculator | 1,900 | 32 | $6.04 |
| stripe fee calculator / stripe fees calculator | 1,600 | 4 | $19.66 |
| square fee calculator | 1,600 | 0 | $6.81 |
| venmo goods and services fee | 1,600 | 11 | — |
| how much does square charge | 1,600 | 26 | $6.89 |
| venmo fee calculator | 1,300 | 0 | — |
| cash app fee calculator | 1,300 | 0 | — |
| credit card processing fee calculator | 1,300 | 0 | $7.44 |
| clover fees | 1,300 | 5 | $23.36 |
| how much does paypal charge | 1,000 | 42 | $5.53 |
| how much does stripe charge | 880 | 13 | $5.21 |
| stripe ach fee | 880 | 21 | $32.10 |
| paypal invoice fee | 880 | 31 | $1.49 |
| how much does cash app charge | 880 | 28 | — |
| square vs stripe fees | 590 | 0 | $17.37 |
| credit card fee calculator | 480 | 17 | $9.61 |
| cash app instant transfer fee calculator | 390 | 1 | $6.78 |
| stripe vs paypal fees | 320 | 15 | $12.56 |
| paypal vs stripe fees | 320 | 15 | $8.66 |
| stripe invoice fee | 260 | 21 | $55.71 |
| paypal invoice fee calculator | 260 | 23 | $27.34 |
| toast processing fees | 260 | 0 | $28.20 |
| venmo instant transfer fee calculator | 260 | 0 | — |
| stripe connect fees | 210 | 19 | $67.58 |
| cash app business fee | 210 | 9 | $11.82 |
| venmo goods and services fee calculator | 210 | 0 | — |
| processing fee calculator | 90 | 0 | $11.62 |

### C.3 Comparisons
| Keyword | Vol | KD | CPC |
|---|---|---|---|
| depop vs poshmark | 5,400 | 0 | $2.59 |
| best place to sell clothes online *(KD 29 — cover inside comparisons/home, not a target)* | 3,600 | 29 | $9.03 |
| poshmark vs mercari | 1,300 | 0 | $2.91 |
| ebay vs mercari | 1,000 | 0 | $2.97 |
| ebay vs poshmark | 880 | 0 | $1.70 |
| square vs stripe fees | 590 | 0 | $17.37 |
| whatnot vs ebay | 480 | 0 | — |
| stripe vs paypal fees | 320 | 15 | $12.56 |

### C.4 Measured but excluded / no demand
seller fee calculator 50 (KD 34) · marketplace fee calculator 10 · reseller profit calculator 20 · payment processing fee calculator 10 · transaction fee calculator 30 · merchant fee calculator 10 · surcharge calculator 170 · credit card surcharge calculator 20 · zelle fees 1,300 (KD 27, no fees to calculate) · apple pay fees 880 (KD 26) · shopify payments fees 320 (KD 42) · shopify fee calculator 140 · amazon seller fees 1,600 (KD 28) · walmart marketplace fees 50 · offerup fees 210 · vinted fees 880 · goat fee calculator 20 · freelance hourly rate calculator 70 · freelance rate calculator 390 · churn rate calculator 210 (CPC $23.18) · mrr/arr calculator 140 each · w2 vs 1099 calculator 480.

---

## Appendix D — Competitor and SERP data

Desktop US SERPs read 2026-11-14 (each read 3× and merged; "s1/s2/s3" = appeared in 1/2/3 reads — low numbers mean unstable rankings).

| Keyword | Page-1 picture | Opportunity |
|---|---|---|
| ebay fee calculator (40.5k/16) | wise.com, resellerworkbench.com (10 RD, #1 in one read), ebayfeescalculator.com (exact match, 706 RD), Play Store app, productpricingcalculator, zikanalytics, spocket, nettedfees, yotpo, ebay.com; AI Overview + PAA; every domain unstable | Moderate on head term; build the best tool + content hub |
| ebay profit calculator (5.4k/18) | startup.info listicle, ebayfeescalculator.com, sellertoolnest, autods, sellerprofittools, yotpo, zikanalytics, Play Store, profitio, listinggenie, flowlister, getflippd | Weak, churning |
| etsy fee calculator (2.9k/9) | 14+ small tools all s1–s2 (easychannel, etsypricingcalc, chargeflow, ecombalance, productmetrics, wallmockup, ardentseller, launchmystore, keepmargin …) | Weak, no owner |
| depop fee calculator (1.9k/0) | nifty.ai article, retailed.io, Facebook post (#2, s3), **Reddit "Depop Fee Calculator" (#2)**, sellerfeecalc.com (78 RD), vendoo blog, **depop-calculator.lovable.app (#4)**, flipsail | HIGH (3/3 criteria) |
| poshmark fees (1.9k/0) | zipsale.co.uk, donotpay, **poshmark-calculator.lovable.app (#2, s3)**, sikayetvar (complaint site), Pinterest, sellerfeecalc, Facebook | Very weak |
| mercari fees (1.3k/0) | sellura.io, 3dsellers, Facebook, resellcalendar (fee-change news), thefreebieguy, flowlister, PR Newswire, sellraze, getflippd, Reddit r/Flipping | Weak; fee-change confusion = content opportunity |
| whatnot fee calculator (1.6k/0) | Play Store app, flipsail, exportyourstore, Facebook, whatnotfeecalculator.com (exact match, 75 spam RD), drapify, getflippd, **Reddit r/whatnotapp (#8)** | HIGH (2/3) |
| copart fee calculator (4.4k/0) | advancemotorsllc tool, stat.vin, Spanish-language tools, salvageauctionestimator, caromoto, a forum thread, carflipiq, Facebook, copart.com, Scribd PDF of fee schedule | Weak (phase 3, data-gated) |
| iaai fee calculator (1.3k/0) | iaaicalculator.com (exact match, s3), iaai.com, help.iaai.com, remarketspace, carflipiq, caromoto, mercedesforum thread, feecalculator.us | Moderate |
| stripe fee calculator (1.6k/4) | stripe.com, depositfix (1,038 RD side page), random subdomain `fees.c-dj3dw.com` (#2), renlar (266 RD), navfuse, tradly, nocutsell, feexio, globalfeecalculator, feeprobe, anchorclick subdomain | HIGH (2/3) |
| paypal fee calculator (18.1k/32) | upseotools, novo.co, freetoolsuite, chargeflow, calc.ninfrock.com (s3), weareindy, nestify, rabetweb, cloudways, newisty, bizcalcs, payable.at — small tools despite KD 32 | Stretch but beatable |
| square fee calculator (1.6k/0) | squareup.com calculator, sublyna, ebayfeescalculator.com, paymentcloudinc, nerdwallet, novo, bluevine, mazalpos, pelcro, chargeflow, feewhiz, checkoutpage, calculatefees.com | Moderate |
| venmo instant transfer fee (4.4k/9) | shapes.inc, zenti, donotpay, lendedu, joingerald, marketfees.app, **Reddit r/venmo (#4)**, KOCO news, newisty, Facebook, toolsoverflow | Weak, informational |
| clover fees (1.3k/5) | clover.com, review sites (zoftwarehub, saasworthy, sonary, comparecamp, gappsy), merchant-services blogs | Informational; calculator + honest explainer can win |

---

## Appendix E — Reference algorithms

### E.1 Money parsing and rounding
```ts
export function parseMoney(s: string): number | null {          // returns cents or null
  const t = s.replace(/[\s,$]/g, '');
  if (!/^\d*(\.\d{0,2})?$/.test(t) || t === '' || t === '.') return null;
  const [d, f = ''] = t.split('.');
  return Number(d || '0') * 100 + Number((f + '00').slice(0, 2));
}
// rate × base(cents) → exact value in cents (may be fractional) → round
export function roundCents(x: number, mode: 'half-up' | 'bankers' = 'half-up'): number {
  const eps = 1e-9;                                    // guard float noise like 2.9 * 103.3
  const floor = Math.floor(x + eps);
  const diff = x - floor;
  if (Math.abs(diff - 0.5) < 1e-7) return mode === 'half-up' ? floor + 1 : (floor % 2 === 0 ? floor : floor + 1);
  return Math.round(x + (x >= 0 ? eps : -eps));
}
export const pct = (baseCents: number, rate: number, mode: 'half-up' | 'bankers' = 'half-up') => roundCents(baseCents * rate, mode);
```
(Prefer computing `baseCents * rateBasisPoints / 10000` with integer basis points where rates have ≤ 2 decimal places of a percent, e.g. 13.6% = 1360 bp, 3.49% = 349 bp, 2.35% = 235 bp, 0.8% = 80 bp, 1.65% = 165 bp, to avoid float noise; round once.)

### E.2 Tiered fees
```ts
type Tier = { upTo: number | null; rate: number };     // upTo in cents, null = infinity
export function tieredMarginal(base: number, tiers: Tier[]): number {   // exact (unrounded) cents
  let rest = base, prev = 0, total = 0;
  for (const t of tiers) {
    const cap = t.upTo ?? Infinity;
    const slice = Math.max(0, Math.min(rest, cap - prev));
    total += slice * t.rate; rest -= slice; prev = cap;
    if (rest <= 0) break;
  }
  return total;
}
export function tieredWhole(base: number, tiers: Tier[]): number {
  const t = tiers.find(t => t.upTo === null || base <= t.upTo)!;
  return base * t.rate;
}
```

### E.3 Breakpoint-aware reverse solver
```text
Goal: minimum price p (cents, 1 ≤ p ≤ MAX) with metric(p) ≥ target, where metric is payout or profit.
1. B = sorted unique breakpoints from schedule.breakpoints(input) ∪ {1, MAX}, plus each breakpoint ± 1.
2. Form segments [B[i], B[i+1] − 1]. Within a segment the fee formula is continuous and non-decreasing
   in p, so metric(p) is non-decreasing (assumption asserted in tests by sampling).
3. For each segment in ascending order:
     if metric(segment.hi) < target → continue
     binary-search the smallest p in [lo, hi] with metric(p) ≥ target → candidate; return the first candidate found
     (segments are ascending, so the first hit is the global minimum).
4. If none → null.
Unit test: compare with brute force over every cent up to $2,000 for each schedule with random options/targets.
```
Breakpoints per schedule (examples): eBay → order total crossing $10.00 (converted to item price given shipping/tax), each tier boundary ($7,500, $2,500, $1,000, $5,000, $2,000, $15,000, $150 for athletic shoes) · Poshmark → $15.00 · Grailed → $120.00 and the $1.99 minimum crossover ($33.17) · Facebook → $8.00 total (min fee crossover) · Venmo instant → $14.29 and $1,428.58 · Reverb → $10.00 (min $0.50) and $10,000 (max $500) · Stripe ACH → $625.00 (cap) · PayPal ACH invoice → $1,000 (cap) · Etsy Offsite Ads → $666.67 / $833.34 (cap at 15% / 12%).

### E.4 Processor closed form (no caps/minimums)
```ts
// receive R (cents) with fee = rate × P + fixed  →  P = ceil((R + fixed) / (1 − rate)), then fix rounding
export function chargeToReceive(R: number, rate: number, fixed: number, compute: (p: number) => number /*fee*/) {
  let p = Math.ceil((R + fixed) / (1 - rate));
  while (p - compute(p) < R) p++;          // at most a few iterations due to rounding
  while (p - 1 - compute(p - 1) >= R) p--; // ensure minimal
  return p;
}
```

### E.5 Effective rate & margin
`effectiveFeePct = sellerFees / (price + shippingCharged)`; `marginPct = profit / (price + shippingCharged)`; `roiPct = profit / itemCost` (null if itemCost = 0). Display with 1 decimal; guard division by zero (show "—").

---

*End of specification.*
