# Sound Test Hub — Complete Build Specification

> **Purpose of this document.** This is a self-contained handoff spec for an AI coding agent (e.g. Claude Code) to build, test and ship a complete static website from scratch. Read it fully before writing code. Everything needed is here: goals, research data, scope, stack and exact versions, file structure, design system, the audio engine, every tool component, every page (titles, meta descriptions, keywords, outlines, FAQs), SEO, AdSense, testing, deployment and acceptance criteria.
>
> **Prepared:** 2026-11-14 · **Market:** United States (English) · **Keyword data source:** OpenSEO (DataForSEO) — US monthly search volume, keyword difficulty (KD 0–100), cost-per-click (CPC, USD).

---

## Table of contents

0. [Instructions for the builder agent](#0-instructions-for-the-builder-agent)
1. [Project summary](#1-project-summary)
2. [Research context (why these pages)](#2-research-context-why-these-pages)
3. [Scope: in and out](#3-scope-in-and-out)
4. [Tech stack, versions and hard constraints](#4-tech-stack-versions-and-hard-constraints)
5. [Project structure](#5-project-structure)
6. [Configuration and environment variables](#6-configuration-and-environment-variables)
7. [Design system](#7-design-system)
8. [Site-wide layout and shared UI](#8-site-wide-layout-and-shared-ui)
9. [Audio engine specification](#9-audio-engine-specification)
10. [Tool component specifications](#10-tool-component-specifications)
11. [Page specifications (hand-written pages)](#11-page-specifications-hand-written-pages)
12. [Programmatic Hz pages](#12-programmatic-hz-pages)
13. [Legal, utility and error pages](#13-legal-utility-and-error-pages)
14. [Technical SEO specification](#14-technical-seo-specification)
15. [AdSense and monetisation](#15-adsense-and-monetisation)
16. [Performance, security headers, hosting and deploy](#16-performance-security-headers-hosting-and-deploy)
17. [Testing specification](#17-testing-specification)
18. [Content writing rules](#18-content-writing-rules)
19. [Build milestones](#19-build-milestones)
20. [Definition of done](#20-definition-of-done)
21. [Post-launch checklist (for the human owner)](#21-post-launch-checklist-for-the-human-owner)
22. [Known gotchas](#22-known-gotchas)
- [Appendix A — Full keyword data](#appendix-a--full-keyword-data)
- [Appendix B — Competitor data](#appendix-b--competitor-data)
- [Appendix C — Voice clip generation script](#appendix-c--voice-clip-generation-script)
- [Appendix D — Reference algorithms](#appendix-d--reference-algorithms)

---

## 0. Instructions for the builder agent

1. **Read the whole document first.** Then create a task list from [§19 Build milestones](#19-build-milestones) and work through it in order.
2. **Where to build.** Create the project in a new folder named `sound-test-site/` at the root of the current repository (unless the user tells you to use a separate repository). Do not modify anything outside that folder except adding a CI workflow (see §16.5), which is optional.
3. **Do not ask questions unless truly blocked.** Every decision has a default in this document. If something is ambiguous, choose the option that best serves: (a) correctness of the audio tools, (b) honest, useful content, (c) page speed, (d) SEO, in that order — and note the decision in `sound-test-site/DECISIONS.md`.
4. **Verify environment assumptions early** (Milestone 0): especially that Web Audio runs in headless Chromium (see §17.4 and §22).
5. **Commit after each milestone** with a clear message. Run the full test suite before every commit from Milestone 3 onward. Never skip or weaken a test to make it pass; fix the code or, if the test itself is wrong, fix the test and explain why in the commit message.
6. **Content matters as much as code.** Hand-written pages must meet the word counts and honesty rules in §11 and §18. Do not pad with filler.
7. **No placeholders in the final build** except the clearly marked env-driven ones (AdSense IDs, contact email, Search Console token).
8. **Finish with a report**: what was built, test results (paste the summary), anything not done and why, and the exact commands the owner runs to deploy.

---

## 1. Project summary

| Item | Value |
|---|---|
| Brand name | **Sound Test Hub** |
| Domain (recommended, unregistered as of 2026-11-14) | `soundtesthub.com` — alternatives: `soundchecktool.com`, `speakerping.com`, `hztester.com`, `stereocheckup.com` |
| What it is | A fast, privacy-first website of free browser-based audio tools: speaker/headphone tests, left/right channel test, bass test, surround test, frequency sweep, tone generator, Hz test tones, water-eject speaker cleaner, dog whistle, high-frequency/mosquito tones, noise generator, audio latency test |
| How it works | 100% client-side. All sound is synthesised in the browser with the Web Audio API. Nothing is uploaded. No backend, no database, no paid APIs |
| Business model | Google AdSense display ads, targeting US organic search traffic |
| Framework | Astro (static output), vanilla TypeScript for interactive parts, plain CSS |
| Total pages at launch | ~40 (12 hand-written tool pages, 18 programmatic Hz pages + hub, 3 phase-2 tool pages, 4 legal pages, 404) |
| Primary keyword | `sound test` — 33,100 US searches/month, KD 8, CPC $4.03 |

### Goals (in priority order)
1. Every tool works correctly and reliably on desktop Chrome/Edge/Firefox/Safari and mobile iOS Safari / Android Chrome.
2. Each page is the most useful result for its keyword: tool above the fold, honest guidance, real troubleshooting.
3. Excellent page speed (static HTML, tiny JS, no web fonts).
4. Clean technical SEO and AdSense-ready layout and policies.
5. A comprehensive automated test suite (unit, built-site QA, browser end-to-end with real audio-signal verification).

---

## 2. Research context (why these pages)

Data gathered with OpenSEO on 2026-11-14 (US market). Full tables in Appendix A and B.

### 2.1 Competitive landscape for the main term ("sound test")
- **Two strong generalist sites** hold #1 on the head terms: `onlinemictest.com` (≈2,930 referring domains) and `webcammictest.com` (≈1,844 referring domains). Both are mic/webcam sites with a sound test added. **Strategy: beat them on depth and specialisation, not links.**
- **Seven of the top-10 results for "sound test" are YouTube/Spotify** — Google lacks good interactive tool pages.
- **Young competitors are entering fast:**
  - `soundtest.io` — went from 16 to 81 referring domains between Aug and Nov 2026 (active link building).
  - `audiotest.io` — 7 referring domains, first links Oct 2026, already ranks #5–6 for "audio test" and "bass test".
  - `soundforgepro.com` — a page published days before the research already ranked on page 1 for "left right audio test".
  - Conclusion: the window is open but closing. **Ship fast**, then iterate.
- Google shows an **AI Overview on every one of these SERPs**, so pages must offer an interactive tool and a clear reason to click (results, troubleshooting), not just a definition.

### 2.2 Realistic targets
- Head terms (`sound test`, `audio test`, `speaker test`, `sound check`): top 5 within ~3–6 months.
- Sub-pages (left/right, headphone, bass, stereo, surround, dog whistle, Hz pages): #1 is achievable — only small/new tools and videos rank.

### 2.3 Revenue notes
- Best CPCs: `left right audio test` $15.10, `sound check` $7.24, `left right speaker test` $5.49, `spatial audio test` $4.89, `5.1 surround sound test` $4.37, `sound test` $4.03, `mosquito sound` $3.10, `subwoofer test` $3.09.
- Hz pages and dog-whistle pages have low CPC; their job is traffic and internal links into high-CPC pages.

---

## 3. Scope: in and out

### In scope
| Area | Pages |
|---|---|
| Speaker & headphone output tests | Home (sound test), left/right test, headphone test, stereo/polarity test, bass test, surround test, frequency sweep |
| Tone tools | Tone generator, 18 Hz test-tone pages + Hz hub |
| Fix & clean | Water eject (speaker cleaner) |
| High-frequency | Dog whistle, high-frequency sound (hearing-range check, non-medical), mosquito sound |
| Noise | Pink noise (calibration), noise generator (white/pink/brown) |
| Timing | Audio latency (Bluetooth delay) test |
| Legal/utility | About, Privacy, Terms, Contact, 404 |

### Out of scope (do NOT build) — with reasons
| Excluded | Why |
|---|---|
| Microphone test | 135k/mo but KD 36; owned by onlinemictest/webcammictest. Phase 3 at the earliest |
| Hearing test (named as such) | KD 52, medical/YMYL territory; risky for AdSense and trust. The high-frequency page is explicitly a *non-medical* "hearing range check" |
| 432 Hz / 528 Hz / 963 Hz "healing" frequency pages | Searchers want to *listen to music* (Spotify/YouTube dominate); health claims are an AdSense policy risk |
| Brown/white noise as long-form "sleep sounds" | 90.5k/mo for "brown noise" but intent is hour-long YouTube/Spotify tracks. We offer a generator page only |
| Device-specific pages (iPhone speaker test 590/mo, earbuds 480, AirPods 210, car 110, laptop 110) | Too little demand per page; cover as FAQ/troubleshooting sections inside other pages |
| Any backend, accounts, user uploads, analytics cookies | Not needed; privacy is a selling point |

### Phase 3 (optional, only if the owner asks later — not part of this build)
Microphone-based tools: pitch detector (12,100/mo, KD 0, crowded with small tools), dB meter online (2,900/mo, KD 11), sound meter online (2,900/mo, KD 18). The architecture should not block adding these later (e.g. `Permissions-Policy` must be easy to change).

---

## 4. Tech stack, versions and hard constraints

### 4.1 Versions (checked against npm on 2026-11-14)
| Package | Version | Notes |
|---|---|---|
| Node.js | **≥ 22.23.4** | Astro 7 requires `node >=22.23.4`. Set `"engines"` in package.json and `.nvmrc` = `22.23.4` (or newer 22.x/24.x) |
| `astro` | `^7.4.12` | Astro 7 stable since June 2026; 7.4.x since Oct 2026. Use only core, stable APIs (pages, layouts, components, `getStaticPaths`, `<script>` bundling, endpoints) |
| `@astrojs/sitemap` | `^3.7.5` | |
| `@astrojs/check` | `^0.9.12` | Peer-requires `typescript ^5 || ^6` |
| `typescript` | `~6.0.3` | **Do not use TypeScript 7.x** — `@astrojs/check` does not support it yet |
| `vitest` | `^5.1.0` | Node `^22.12 || ^24 || >=26` |
| `@playwright/test` | **`1.63.0` exactly** if running in a Claude Code cloud container (matches the pre-installed browsers in `/opt/pw-browsers`, `PLAYWRIGHT_BROWSERS_PATH` is preset — do **not** run `playwright install`). On any other machine use the latest and run `npx playwright install chromium` |
| `@axe-core/playwright` | `^4.14.0` | Accessibility checks in e2e |

No other runtime dependencies. **Zero client-side frameworks** (no React/Preact/Vue/Svelte). Interactive code is vanilla TypeScript inside Astro components' `<script>` tags (Astro bundles and de-duplicates them) plus modules in `src/lib/`.

### 4.2 Hard constraints
1. **Static output only** (`output: 'static'`). No server endpoints at runtime, no SSR adapter.
2. **No third-party scripts or fonts** except Google AdSense (`pagead2.googlesyndication.com`) when its env var is set, and optional Cloudflare Web Analytics (cookieless) when its env var is set.
3. **No paid APIs, no external audio files.** All tones/noise are synthesised. The only audio assets are the small self-generated voice clips (Appendix C), served from `/audio/voice/`.
4. **JS budget:** ≤ 35 KB gzipped of JavaScript per page (all chunks the page loads, excluding AdSense). Enforced by a test (§17.3).
5. **No cookies** set by our own code. `localStorage` only for preferences (volume, theme), wrapped in try/catch.
6. **Accessibility:** WCAG 2.2 AA. Every control reachable and usable by keyboard; zero serious/critical axe violations.
7. **Honesty:** no medical/health claims, no claims the tools can do what browsers cannot (see §18).

---

## 5. Project structure

```
sound-test-site/
├── .nvmrc                         # 22.23.4
├── .gitignore                     # node_modules, dist, .astro, test-results, playwright-report
├── astro.config.mjs
├── package.json
├── tsconfig.json                  # extends "astro/tsconfigs/strict"
├── vitest.config.ts
├── playwright.config.ts
├── README.md                      # how to develop, test, deploy; env vars
├── DECISIONS.md                   # decisions the builder made that were not in the spec
├── public/
│   ├── favicon.svg
│   ├── apple-touch-icon.png       # 180x180, generated (scripts/generate-icons)
│   ├── og/default.png             # 1200x630, generated
│   ├── audio/voice/*.mp3          # generated voice clips (Appendix C)
│   ├── robots.txt
│   └── _headers                   # Cloudflare Pages / Netlify headers (§16.2)
├── scripts/
│   ├── generate-voices.sh         # Appendix C
│   └── generate-images.mjs        # renders OG image + apple-touch-icon with Playwright from an HTML template
├── src/
│   ├── config/
│   │   ├── site.ts                # brand, URL, env access helpers
│   │   └── pages.ts               # registry of every page: slug, nav label, group, related pages
│   ├── data/
│   │   ├── frequencies.ts         # Hz page data (§12)
│   │   └── keywords.ts            # optional: target keywords per page (used by tests to assert presence in title/H1)
│   ├── lib/
│   │   ├── audio/
│   │   │   ├── engine.ts          # SoundEngine (§9)
│   │   │   ├── voices.ts          # tone/sweep/noise/kick/buffer voice factories
│   │   │   ├── noise.ts           # pure noise generators (seeded)
│   │   │   ├── math.ts            # pure helpers (log slider, note names, dB, sweep formula, clamping)
│   │   │   ├── scheduler.ts       # lookahead scheduler for rhythmic patterns (kick, pulses, clicks)
│   │   │   ├── latency.ts         # pure latency statistics
│   │   │   ├── unlock.ts          # iOS/Safari unlock + audioSession
│   │   │   └── index.ts           # getEngine() singleton; exposes window.soundTestHub
│   │   ├── dom.ts                 # tiny DOM helpers (qs, on, setPressed, announce)
│   │   └── storage.ts             # safe localStorage get/set
│   ├── components/
│   │   ├── layout/ BaseLayout.astro, ToolLayout.astro, Header.astro, Footer.astro, Breadcrumbs.astro, ThemeToggle.astro, GlobalAudioBar.astro
│   │   ├── seo/ Seo.astro, JsonLd.astro
│   │   ├── content/ Faq.astro, RelatedTests.astro, TestGrid.astro, Callout.astro, LastUpdated.astro, DeviceTable.astro
│   │   ├── ads/ AdSlot.astro, AdSenseScript.astro
│   │   └── tools/
│   │       ├── ToolCard.astro           # shared frame: title, controls slot, status line, meters, visualizer
│   │       ├── LevelMeters.astro
│   │       ├── Visualizer.astro
│   │       ├── ChannelTest.astro
│   │       ├── PolarityTest.astro
│   │       ├── StereoPan.astro
│   │       ├── BassTest.astro
│   │       ├── SweepTest.astro
│   │       ├── ToneGenerator.astro
│   │       ├── SurroundTest.astro
│   │       ├── SpatialDemo.astro
│   │       ├── WaterEject.astro
│   │       ├── DogWhistle.astro
│   │       ├── HearingRangeCheck.astro
│   │       ├── MosquitoTone.astro
│   │       ├── NoiseGenerator.astro
│   │       └── LatencyTest.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── left-right-audio-test.astro
│   │   ├── headphone-test.astro
│   │   ├── stereo-test.astro
│   │   ├── bass-test.astro
│   │   ├── surround-sound-test.astro
│   │   ├── frequency-sweep.astro
│   │   ├── tone-generator.astro
│   │   ├── water-eject.astro
│   │   ├── dog-whistle.astro
│   │   ├── high-frequency-sound.astro
│   │   ├── mosquito-sound.astro
│   │   ├── pink-noise.astro
│   │   ├── noise-generator.astro
│   │   ├── audio-latency-test.astro
│   │   ├── hz/index.astro
│   │   ├── hz/[freq].astro
│   │   ├── about.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── contact.astro
│   │   ├── 404.astro
│   │   └── ads.txt.ts             # endpoint generating ads.txt from env
│   └── styles/
│       ├── tokens.css
│       ├── base.css
│       └── components.css
└── tests/
    ├── unit/                      # Vitest: pure logic
    ├── site/                      # Vitest: QA over built dist/ HTML
    ├── e2e/                       # Playwright
    └── helpers/                   # fft.ts, goertzel.ts, html.ts (parse dist)
```

### 5.1 package.json scripts
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
    "voices": "bash scripts/generate-voices.sh",
    "images": "node scripts/generate-images.mjs"
  }
}
```

### 5.2 astro.config.mjs
- `site: process.env.SITE_URL ?? 'https://soundtesthub.com'`
- `output: 'static'`, `trailingSlash: 'always'`, `build: { format: 'directory' }`
- `integrations: [sitemap({ filter: (page) => !page.includes('/404') })]`
- `compressHTML: true`
- No image integration needed (no raster images in content; icons are inline SVG).

---

## 6. Configuration and environment variables

All public env vars are read at build time via `import.meta.env`. Missing optional vars must never break the build.

| Variable | Required | Default | Used for |
|---|---|---|---|
| `SITE_URL` | no | `https://soundtesthub.com` | canonical URLs, sitemap, OG URLs |
| `PUBLIC_SITE_NAME` | no | `Sound Test Hub` | brand text |
| `PUBLIC_CONTACT_EMAIL` | no | `hello@soundtesthub.com` (placeholder) | Contact/Privacy pages |
| `PUBLIC_ADSENSE_CLIENT` | no | — | e.g. `ca-pub-1234567890123456`. If unset: no AdSense script, no ad markup in production builds, ads.txt contains only a comment |
| `PUBLIC_ADSENSE_SLOT_BELOW_TOOL` | no | — | ad unit slot ID |
| `PUBLIC_ADSENSE_SLOT_IN_CONTENT` | no | — | ad unit slot ID |
| `PUBLIC_ADSENSE_SLOT_SIDEBAR` | no | — | ad unit slot ID |
| `PUBLIC_ADSENSE_SLOT_BEFORE_FAQ` | no | — | ad unit slot ID |
| `PUBLIC_GSC_VERIFICATION` | no | — | `<meta name="google-site-verification">` |
| `PUBLIC_CF_BEACON_TOKEN` | no | — | Cloudflare Web Analytics (cookieless) |

Provide `.env.example` listing all of them with comments. Never commit a real `.env`.

---

## 7. Design system

### 7.1 Principles
- Tool first: the interactive tool card sits directly under the H1 and is visible without scrolling on a 390×844 phone and a 1366×768 laptop.
- Big, obvious, touch-friendly controls (min 44×44 px hit area), clear states (idle / playing / stopped), and immediate visual feedback (meters move when sound plays).
- Calm, modern, trustworthy. No stock photos, no autoplaying anything, no pop-ups.
- Consistent channel colours everywhere: **Left = blue, Right = orange**, Center/both = accent teal.

### 7.2 Tokens (`src/styles/tokens.css`)
Define on `:root` (light) and override for dark via `@media (prefers-color-scheme: dark)` on `:root:not([data-theme="light"])` **and** on `:root[data-theme="dark"]`.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#ffffff` | `#0b0f14` |
| `--surface` | `#f5f7fa` | `#121821` |
| `--surface-2` | `#eef2f6` | `#18212c` |
| `--text` | `#0f172a` | `#e6edf3` |
| `--muted` | `#475569` | `#9aa8b8` |
| `--border` | `#e2e8f0` | `#243040` |
| `--accent` | `#0f766e` | `#2dd4bf` |
| `--accent-contrast` (text on accent) | `#ffffff` | `#04201d` |
| `--left` | `#1d4ed8` | `#60a5fa` |
| `--right` | `#c2410c` | `#fb923c` |
| `--warn` | `#b45309` | `#fbbf24` |
| `--danger` | `#b91c1c` | `#f87171` |
| `--focus` | `#2563eb` | `#93c5fd` |
| `--radius` | `12px` | |
| `--radius-sm` | `8px` | |
| `--shadow` | `0 1px 2px rgb(15 23 42 / .06), 0 4px 16px rgb(15 23 42 / .06)` | `0 1px 2px rgb(0 0 0 / .4)` |
| `--content-width` | `72ch` | |
| `--page-width` | `1120px` | |

All text/background pairs must pass WCAG AA (4.5:1 body text, 3:1 large text and UI component boundaries). Verify with axe in e2e.

### 7.3 Typography
- System stack only: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`; numbers in tool readouts use `font-variant-numeric: tabular-nums`.
- Base 17px / 1.6. Scale: H1 clamp(1.75rem, 4vw, 2.5rem), H2 1.5rem, H3 1.2rem. Readouts (frequency display) 2.5–3.5rem bold.

### 7.4 Layout
- Page container max `--page-width`, 16px side gutters on mobile, 24px ≥ 768px.
- ≥ 1024px: two columns — main (content max 72ch) + 300px right sidebar (Popular tests list + sticky sidebar ad). Tool card spans the full main column width.
- < 1024px: single column; sidebar content moves below the article.
- No horizontal scrolling at any width ≥ 320px (tested).

### 7.5 Component look
- **Buttons:** primary (accent fill), secondary (surface + border), channel buttons (outlined in `--left` / `--right`; filled when playing). Pressed/playing state uses `aria-pressed="true"` and a visible animated "playing" indicator (3 bars) that is static under `prefers-reduced-motion`.
- **Sliders:** native `<input type="range">` styled; always paired with a numeric `<input type="number">` or readout and a visible label.
- **Tool card:** surface background, radius, shadow, 16–24px padding; header row (tool name + status pill "Ready / Playing / Stopped"), body (controls), footer (meters + optional visualizer + safety hint).
- **Callouts:** info/warn/success variants with icon (inline SVG) and left border.
- **Theme toggle:** in header; three states not needed — light/dark toggle that overrides system; store in `localStorage['sth:theme']`; inline script in `<head>` applies it before paint to avoid flash.

### 7.6 Icons
Inline SVG only (speaker, headphones, waves, play, stop, left/right arrows, warning, check). No icon font. Logo: a simple speaker glyph with two sound-wave arcs + wordmark "Sound Test Hub". `favicon.svg` is the glyph (with dark-mode-aware fill via embedded `@media (prefers-color-scheme: dark)` in the SVG).

---

## 8. Site-wide layout and shared UI

### 8.1 `BaseLayout.astro`
Props: `title`, `description`, `path`, `ogImage?`, `noindex?`, `jsonLd?: object[]`, `breadcrumbs?: {name, path}[]`, `showAds?: boolean` (default true).
Renders: `<html lang="en">`, head (Seo component, theme inline script, CSS, GSC meta, AdSense script if enabled, CF beacon if set), skip link ("Skip to tool"), Header, `<main id="main">`, Footer.

### 8.2 `ToolLayout.astro`
Extends BaseLayout. Props add: `h1`, `intro` (1–2 sentences rendered under H1), `lastUpdated` (ISO date), `related: string[]` (page ids from registry), `faqs: {q, a}[]`. Slots: `tool` (the tool card), default (article content). Structure:
1. Breadcrumbs
2. H1 + intro
3. Tool slot (`id="tool"`)
4. Safety/compatibility hint line (shared): "Start with your volume low. On iPhone, turn off Silent Mode."
5. Ad: below tool
6. Article (default slot) — the in-content ad is inserted by the page author after the 2nd H2 using `<AdSlot position="in-content" />`
7. Ad: before FAQ (only if article ≥ 1,000 words — page author decides by including it)
8. FAQ section (`Faq.astro`, renders visible Q&A and FAQPage JSON-LD from the same data)
9. RelatedTests
10. LastUpdated
Sidebar (≥1024px): "Popular tests" (home, left-right, headphone, bass, surround, tone generator) + sticky sidebar ad.

### 8.3 Header
- Left: logo + wordmark linking to `/`.
- Nav (desktop): Sound Test · Left/Right · Headphones · Bass · Surround · Tone Generator · **All tests ▾** (a `<details>` dropdown listing every tool page, grouped).
- Mobile: a `<details>`-based menu button (no JS required to open).
- Right: `GlobalAudioBar` (master volume slider with speaker icon + percentage; "Stop all" button visible only while something plays; Esc key also stops all) and ThemeToggle.

### 8.4 Footer
Columns: **Speaker tests** (home, left-right, headphone, stereo, bass, surround, sweep), **Tone tools** (tone generator, Hz directory, dog whistle, high-frequency, mosquito), **Fix & noise** (water eject, pink noise, noise generator, latency test), **Site** (About, Privacy, Terms, Contact). Bottom line: © year brand · "All sounds are generated in your browser. Nothing is recorded or uploaded." · "Not affiliated with Apple, Dolby, Google or any device maker mentioned on this site."

### 8.5 Page registry (`src/config/pages.ts`)
Single source of truth used by nav, footer, related links, TestGrid and tests:
```ts
export type PageId = 'home' | 'left-right' | 'headphone' | 'stereo' | 'bass' | 'surround' | 'sweep' | 'tone' | 'water-eject' | 'dog-whistle' | 'high-frequency' | 'mosquito' | 'pink-noise' | 'noise' | 'latency' | 'hz-hub';
export interface PageEntry { id: PageId; path: string; navLabel: string; cardTitle: string; cardBlurb: string; group: 'speaker-tests' | 'tone-tools' | 'fix-noise'; icon: string; }
```
A unit test asserts every registry path has a matching built page and vice versa (excluding legal/hz detail pages).

---

## 9. Audio engine specification

`src/lib/audio/` — the heart of the site. Must be framework-free, strictly typed, and testable both with a real `AudioContext` and with an injected `OfflineAudioContext`.

### 9.1 Responsibilities
- Create the `AudioContext` lazily on the first user gesture; resume it if suspended/interrupted.
- Provide an **output bus** with N channels (2 by default; 6 or 8 for surround), master volume, a safety limiter (stereo mode), per-channel level metering and a spectrum analyser.
- Provide **voices** (tone, sweep, noise, kick pattern, pulse pattern, buffer/voice clip, click track, HRTF orbit) that can be routed to: `'left' | 'right' | 'both' | number` (discrete channel index) with optional per-channel polarity inversion.
- Ownership/exclusivity: when a component starts sound, other components' sounds stop (unless explicitly allowed to mix), and those components are notified so their UI resets.
- Emit events for UI: `statechange`, `voicestart`, `voiceend`, `release`.

### 9.2 Public API (TypeScript)
```ts
export type ChannelTarget = 'left' | 'right' | 'both' | number;
export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type NoiseColor = 'white' | 'pink' | 'brown';

export interface EngineOptions {
  context?: BaseAudioContext;      // inject OfflineAudioContext in tests
  channels?: number;               // default 2
  masterVolume?: number;           // 0..1, default from storage or 0.5
  limiter?: boolean;               // default true when channels === 2
}

export interface Voice {
  readonly id: string;
  readonly owner: string;
  stop(fadeSeconds?: number): void;          // default 0.02 s fade
  readonly ended: Promise<void>;
}
export interface ToneVoice extends Voice {
  setFrequency(hz: number, rampSeconds?: number): void;
  setWaveform(w: Waveform): void;
  setGain(g: number): void;                  // 0..1 voice gain (before master)
}
export interface SweepVoice extends Voice {
  readonly startTime: number;                // context time
  currentFrequency(): number;                // computed from sweep formula (§D.3)
}

export class SoundEngine extends EventTarget {
  constructor(opts?: EngineOptions);
  readonly context: BaseAudioContext;
  readonly sampleRate: number;
  readonly maxFrequency: number;             // floor(sampleRate / 2) - 50, also capped at 22000 for UI
  ensureRunning(): Promise<void>;            // call inside user gesture handlers; performs unlock (§9.5)
  get state(): AudioContextState | 'closed';

  // output configuration
  get channels(): number;
  maxOutputChannels(): number;               // destination.maxChannelCount (realtime) or channels (offline)
  configureChannels(n: 2 | 6 | 8): boolean;  // returns false if device can't; rebuilds bus, stops all voices

  // volume
  get masterVolume(): number;
  setMasterVolume(v: number): void;          // 0..1, perceptual mapping (§D.1), persisted to storage

  // voices (owner = component instance id)
  playTone(o: { owner: string; frequency: number; waveform?: Waveform; gain?: number; target?: ChannelTarget; invertRight?: boolean; duration?: number }): ToneVoice;
  playSweep(o: { owner: string; from: number; to: number; duration: number; mode?: 'log' | 'linear'; target?: ChannelTarget; gain?: number; loop?: boolean }): SweepVoice;
  playNoise(o: { owner: string; color: NoiseColor; target?: ChannelTarget; gain?: number; invertRight?: boolean; duration?: number }): Voice;
  playPattern(o: { owner: string; kind: 'kick' | 'pulse' | 'click'; bpm?: number; pattern?: number[]; frequency?: number; target?: ChannelTarget; gain?: number; onTick?: (contextTime: number, index: number) => void }): Voice;
  playBuffer(o: { owner: string; url: string; target?: ChannelTarget; gain?: number }): Promise<Voice>;   // voice clips; decoded buffers cached
  playOrbit(o: { owner: string; seconds: number; elevation?: number; gain?: number; onPosition?: (azimuthDeg: number) => void }): Voice; // HRTF demo, stereo only

  // ownership
  claim(owner: string): void;                // stop voices of all other owners (dispatch 'release' {owner} for each)
  stopAll(): void;                           // stop everything, dispatch 'release' for all owners
  isPlaying(owner?: string): boolean;

  // analysis
  getChannelLevels(): { rms: number; peak: number; db: number }[];     // per output channel, from time-domain data
  getSpectrum(out: Float32Array): void;                                 // dB per bin (AnalyserNode)
  getChannelSamples(channel: number, out: Float32Array): void;          // time-domain samples for tests/meters
  peakFrequency(): number;                                              // bin with max magnitude * binWidth (UI + tests)
}

export function getEngine(): SoundEngine;   // lazy singleton for the page
export function createEngine(opts: EngineOptions): SoundEngine;  // for tests (OfflineAudioContext)
```
`src/lib/audio/index.ts` must also set `window.soundTestHub = { getEngine, createEngine, version }` (tiny, harmless, used by e2e tests and handy for debugging).

### 9.3 Audio graph
```
voice sources ─▶ voice GainNode (envelope + voice gain)
               ─▶ routing: connect to ChannelMergerNode(N) input(s)
                   • 'left'  → merger input 0
                   • 'right' → merger input 1
                   • 'both'  → inputs 0 and 1 (right via GainNode(-1) when invertRight)
                   • number  → that input index
merger(N) ─▶ masterGain (channelCount N, channelCountMode 'explicit', channelInterpretation 'discrete')
masterGain ─▶ [stereo only] DynamicsCompressor limiter ─▶ destination
masterGain ─▶ [N > 2] destination directly (compressor would downmix to 2ch)
masterGain ─▶ ChannelSplitterNode(N) ─▶ AnalyserNode per channel (fftSize 2048, for meters/tests)
masterGain ─▶ AnalyserNode "spectrum" (fftSize 8192, smoothingTimeConstant 0.6)
```
- For N > 2: set `destination.channelCount = N`, `channelCountMode = 'explicit'`, `channelInterpretation = 'discrete'`. Only allowed if `N <= destination.maxChannelCount`.
- Limiter settings: threshold −3 dB, knee 0, ratio 20, attack 0.003 s, release 0.1 s.
- **Envelopes:** every start ramps gain 0 → target over 20 ms (`linearRampToValueAtTime`); every stop uses `setTargetAtTime(0, t, fade/3)` and stops sources at `t + fade + 0.05`. No clicks.
- Voices clean up (disconnect nodes) on end. `ended` promise resolves after cleanup.
- `duration` (optional) auto-stops a voice.

### 9.4 Frequency and safety limits
- Clamp frequency to `[1, engine.maxFrequency]`. UI shows a note when the requested value was clamped (e.g. "Your device's sample rate is 44.1 kHz, so the maximum is 22,000 Hz").
- Default voice gains: tones 0.5, noise 0.4, high-frequency tones (> 12 kHz) 0.25, sub-bass tones (< 40 Hz) 0.6, water eject 0.8 (user is warned).
- Master volume default 0.5; persisted (`localStorage['sth:volume']`).

### 9.5 Unlock and mobile handling (`unlock.ts`)
On the first `ensureRunning()` call (inside a user gesture):
1. If `navigator.audioSession` exists (Safari 17+), set `navigator.audioSession.type = 'playback'` so audio plays even when the iPhone's silent switch is on (feature-detect; wrap in try/catch).
2. Play a short silent `<audio>` element (inline base64 silent WAV/MP3 data URI, `playsinline`) — classic iOS unlock that also helps with the ringer switch on older iOS.
3. Create/resume the `AudioContext` (`latencyHint: 'interactive'`).
4. Listen for `statechange`; if the context becomes `'suspended'` or `'interrupted'` (iOS), show the "Tap to resume audio" prompt in active tool cards and resume on next gesture.
5. On `visibilitychange` → visible, attempt `resume()` if voices were active.

### 9.6 Ownership model
Each tool component generates an owner id (`${componentName}-${n}`). Before starting a voice the component calls `engine.claim(owner)`. Components listen for the engine's `release` event; when `detail.owner === myOwner`, they reset their UI to idle. `GlobalAudioBar` listens to `voicestart`/`voiceend` to show/hide "Stop all".

### 9.7 Lookahead scheduler (`scheduler.ts`)
For rhythmic patterns (kick loop, dog-whistle pulses, water-eject pulse mode, latency clicks, surround sequence): classic "two clocks" scheduler — `setInterval` every 25 ms, schedules events within the next 100 ms using `context.currentTime`. Must keep perfect timing under main-thread jank. Unit-test the pure scheduling function (given current time, last scheduled time, interval → list of times to schedule).

### 9.8 Voice clips
- Files in `public/audio/voice/`: `left.mp3`, `right.mp3`, `center.mp3`, `front-left.mp3`, `front-right.mp3`, `subwoofer.mp3`, `surround-left.mp3`, `surround-right.mp3`, `rear-left.mp3`, `rear-right.mp3`, `both.mp3` (says "Both sides").
- Generated with espeak-ng (Appendix C). Mono, 48 kHz, ~48 kbps, loudness-normalised, silence trimmed, each < 10 KB.
- Fetched and decoded lazily on first use, cached in a `Map<url, AudioBuffer>`.
- If decoding fails, fall back to a tone cue (left: one 600 Hz beep; right: two 900 Hz beeps; center: 750 Hz long beep) and log a console warning — never break the test.

---

## 10. Tool component specifications

Common rules for all tool components:
- Root element: `<section class="tool-card" data-tool="<name>" aria-labelledby=...>` inside `ToolCard.astro`.
- Every interactive control has a visible label or `aria-label`; play/stop buttons use `aria-pressed`; status changes are announced through one shared visually hidden `aria-live="polite"` region.
- Keyboard: `Space`/`Enter` activate focused buttons (native); tone generator supports the global shortcuts listed in its spec; `Esc` = stop all (global).
- Every component works with **no JavaScript errors** when Web Audio is unavailable: show a clear message "Your browser doesn't support the Web Audio API" (feature-detect `window.AudioContext || window.webkitAudioContext`).
- `data-testid` attributes on all key controls and readouts (names listed per component) — used by e2e tests.
- Components accept props to set defaults so pages can reuse them (e.g. compact variants).

### 10.1 `LevelMeters.astro`
- Shows one horizontal meter per output channel (2 by default, N in surround) labelled L / R (or channel names), colours `--left` / `--right` / accent.
- Updates at animation frame rate only while any voice is playing (10 fps under `prefers-reduced-motion`), from `engine.getChannelLevels()`; shows dBFS readout and 1 s peak hold.
- `data-testid="meter-<index>"` with attribute `data-level` updated to the latest RMS (for tests).

### 10.2 `Visualizer.astro`
- `<canvas>` spectrum: log frequency axis 20 Hz–20 kHz (labels 20, 50, 100, 200, 500, 1k, 2k, 5k, 10k, 20k), dB axis −100…0; plus a small waveform strip.
- Draws only while playing; pauses when tab hidden. Respects DPR for crisp lines. Uses CSS variables for colours (read via `getComputedStyle`).
- Optional (prop `visualizer={false}` to omit on compact cards).

### 10.3 `ChannelTest.astro` (left/right test)
Props: `variant: 'speakers' | 'headphones'` (changes copy only), `compact?: boolean`, `defaultSignal?: 'voice' | 'tone' | 'noise'`.
UI:
- Three large buttons: **◀ Left**, **Both**, **Right ▶** (`data-testid="ch-left|ch-both|ch-right"`). Clicking plays the selected signal in that channel; clicking again stops. Only one plays at a time.
- Signal selector (segmented control): Voice (spoken "Left"/"Right"/"Both sides", repeats every 1.5 s), Tone (440 Hz sine, left / 660 Hz right — different pitches help), Noise (pink noise).
- "Loop alternate" toggle: automatically alternates Left → Right every 2 s (`data-testid="ch-alternate"`).
- Level meters below.
- **Result check (not in compact mode):** after the user has played Left and Right at least once, show: "Where did you hear the LEFT sound?" [Left] [Right] [Both] [Nowhere] and the same for RIGHT. Compute a result:
  - correct/correct → ✅ "Your left and right channels are working and correctly placed."
  - swapped → ⚠️ "Your channels are swapped" + link to the fix section anchor.
  - left nowhere or right nowhere → ⚠️ "One channel is silent" + steps.
  - both heard on both sides → ⚠️ "Mono audio is probably on" + steps (Windows/macOS/iOS/Android mono setting).
  - Result card `data-testid="ch-result"` with `data-result="ok|swapped|left-silent|right-silent|mono|other"`. Purely client-side; nothing stored.

### 10.4 `PolarityTest.astro`
- Two buttons: **In phase** and **Out of phase** (`data-testid="pol-in|pol-out"`). Signal: pink noise band-limited 80–500 Hz is fine, or a 80 Hz + pink noise mix; default **pink noise** in both channels; out-of-phase inverts the right channel (`invertRight: true`).
- Copy in the card: "In phase should sound centred and full. Out of phase sounds wide, hollow and lacking bass. If 'In phase' sounds hollow, one speaker is wired backwards."

### 10.5 `StereoPan.astro`
- Plays pink noise or a tone that pans smoothly Left → Center → Right and back (StereoPanner automation or merger gains), with a moving dot on a horizontal track. Controls: play/stop, speed (slow/normal), signal. Purpose: centre image and placement check. `data-testid="pan-play"`.

### 10.6 `BassTest.astro`
Props: `compact?: boolean`.
- **Kick loop**: play/stop (`data-testid="bass-kick"`), tempo 60–140 BPM (default 100), kick synthesised (Appendix D.4).
- **Low sweep**: 20 → 200 Hz over 20 s (log), live current frequency readout (`data-testid="bass-sweep-freq"`), buttons "I first hear bass now" (records lowest audible) and "Rattle here" (records rattle frequencies list). Shows results summary.
- **Fixed tones grid**: 20, 25, 30, 35, 40, 50, 60, 80, 100, 120, 150, 200 Hz buttons (`data-testid="bass-tone-<hz>"`), each toggles a sine at that frequency; tones below 40 Hz use gain 0.6 and show a note "may be felt more than heard".
- Safety note: "Turn the volume down before starting. Small speakers can be damaged by loud low bass."

### 10.7 `SweepTest.astro`
Props: `from=20`, `to=20000`, `duration=20`, `compact?`.
- Controls: range presets (Full 20 Hz–20 kHz, Bass 20–200 Hz, Treble 2–20 kHz), duration (10/20/30/60 s), mode (log/linear; default log), channel (both/left/right), loop.
- Live readout of current frequency (`data-testid="sweep-freq"`), progress bar.
- Buttons: "Mark lowest I hear" / "Mark highest I hear" (`data-testid="sweep-mark-low|sweep-mark-high"`) — during an upward full sweep, low mark = first audible point, high mark = when it disappears. Results displayed with plain-language interpretation and a device comparison table (§11.7).
- Respect `engine.maxFrequency` (clamp `to`).

### 10.8 `ToneGenerator.astro`
Props: `initialFrequency=440`, `min=1`, `max=22000`, `compact?`, `presets?: number[]`, `lockFrequency?: boolean` (Hz pages: frequency fixed by default but adjustable via "Fine-tune" disclosure).
UI:
- Large frequency readout, editable `<input type="number" step="0.1">` (`data-testid="tone-freq"`), log-scale slider (`data-testid="tone-slider"`, mapping in Appendix D.1).
- Buttons: −10, −1, −0.1, +0.1, +1, +10; ×2 (octave up), ÷2 (octave down).
- Waveform segmented control: Sine / Square / Sawtooth / Triangle (`data-testid="tone-wave-<name>"`).
- Channel: Both / Left / Right.
- Volume (voice gain) slider separate from master.
- Play/Stop big button (`data-testid="tone-play"`).
- Musical note readout: nearest note + cents (e.g. "A4 +0 cents") — Appendix D.2.
- Changing frequency while playing glides smoothly (`setTargetAtTime` 0.01–0.03 s), no restart.
- Keyboard shortcuts when the card has focus-within: `Space` play/stop, `↑/↓` ±1 Hz, `Shift+↑/↓` ±10 Hz, `Alt+↑/↓` ±0.1 Hz, `PageUp/PageDown` octave.
- **Shareable state:** reads `?f=<hz>&w=<wave>` from the URL on load (client-side only; canonical unchanged); a "Copy link" button writes the current state into the URL and copies it.
- Preset chips (e.g. 50, 60, 100, 440, 1000, 10000) linking to the matching `/hz/<f>/` page **and** setting the tone.

### 10.9 `SurroundTest.astro`
- On load (after first gesture to create context) detect `destination.maxChannelCount`. Show: "Your browser can output **N** channels." (`data-testid="sur-max"`).
- Layout selector: **Stereo (2.0)**, **5.1**, **7.1**. Options that exceed N are disabled with explanation and a link to the setup section ("How to enable 5.1/7.1 output on Windows").
- Room diagram (SVG) with speaker buttons placed around a listener: FL, C, FR, (SL, SR for 7.1), BL/SR..., LFE. Clicking a speaker plays pink noise (LFE: 50 Hz-ish low-passed noise or 40–80 Hz tone) **plus** the spoken channel name to that discrete channel. `data-testid="sur-ch-<index>"`.
- "Play all in order" button cycles channels (2 s each).
- Channel order (Web Audio discrete): 5.1 = 0 FL, 1 FR, 2 C, 3 LFE, 4 SL (surround left), 5 SR. 7.1 = 0 FL, 1 FR, 2 C, 3 LFE, 4 BL (rear left), 5 BR (rear right), 6 SL, 7 SR (common WAVE order; note in copy that some systems swap side/rear pairs — that's what this test reveals).
- If N == 2: show a callout explaining multichannel output requires e.g. Windows + Chrome/Edge with an HDMI AV receiver configured as 5.1/7.1, and offer the **SpatialDemo** for headphones.

### 10.10 `SpatialDemo.astro` (3D audio for headphones)
- `PannerNode` with `panningModel: 'HRTF'`, source = pulsing pink noise (or voice "front/left/behind/right" at cardinal points). The source orbits the listener once every 8 s; optional elevation toggle (above/level/below). A circular SVG shows the current position (`data-testid="spatial-pos"` with `data-azimuth`).
- Copy: "Use headphones. You should hear the sound circle around your head. This is binaural (HRTF) audio — it is not Dolby Atmos or Apple Spatial Audio, which a website can't trigger."

### 10.11 `WaterEject.astro`
- Big circular Start button with progress ring (`data-testid="we-start"`, progress `data-testid="we-progress"` with `data-progress` 0..1).
- Modes (`data-testid="we-mode-<id>"`): **Steady 165 Hz** (default), **Pulse** (165 Hz, 0.5 s on / 0.5 s off), **Low sweep** (100 → 300 → 100 Hz cycling over 4 s).
- Duration: 30 / 60 / 120 s (default 60).
- Gain 0.8 by default (master still applies); show "Volume: turn your phone to maximum, speaker facing down." instructions above the button.
- When done: success message + "Run again" + tips. Stop button available throughout.

### 10.12 `DogWhistle.astro`
- Frequency slider 8,000–22,000 Hz (clamped to `engine.maxFrequency`), default 16,000 Hz; numeric readout (`data-testid="dw-freq"`); presets 10k, 12k, 14k, 16k, 18k, 20k.
- Patterns (`data-testid="dw-pattern-<id>"`): **Steady**, **Short pulses** (0.2 s on / 0.3 s off), **Recall** (short-short-long: 0.2 on, 0.2 off, 0.2 on, 0.2 off, 0.8 on, 1.0 off).
- Default gain 0.3. Play/stop `data-testid="dw-play"`.
- Info line under slider: "Phone and laptop speakers usually stop around 18–20 kHz. Many adults can still hear 10–16 kHz."

### 10.13 `HearingRangeCheck.astro` (non-medical)
- Mode A "Step up": plays tones starting at 8 kHz, increasing by 1 kHz every 3 s (or on "Next") up to `min(20 kHz, maxFrequency)`; user presses **"I can't hear it anymore"** (`data-testid="hr-stop"`). Result (`data-testid="hr-result"`, `data-hz`): "The highest tone you heard through this device: 15,000 Hz."
- Mode B "Pick a tone": grid 8k, 10k, 12k, 14k, 15k, 16k, 17k, 17.4k, 18k, 19k, 20k.
- Shows an approximate reference table (§11.11) with heavy caveats and a prominent disclaimer: "This is not a hearing test and can't diagnose anything. Results depend heavily on your speakers or headphones. If you're worried about your hearing, see an audiologist."
- Default gain 0.25; no tone louder than master × 0.25.

### 10.14 `MosquitoTone.astro`
- Presets: 15 kHz, 16 kHz, **17.4 kHz ("teen tone")**, 18 kHz, 19 kHz (`data-testid="mq-<hz>"`), plus a second section **"Mosquito buzz (the insect)"**: a synthesised insect buzz — sawtooth around 550 Hz with slight random frequency wobble (±20 Hz, 6–8 Hz LFO) and amplitude flutter, optional stereo fly-by (pan automation). `data-testid="mq-buzz"`.
- Gain 0.25 for high tones, 0.3 for buzz.

### 10.15 `NoiseGenerator.astro`
Props: `defaultColor: NoiseColor`, `showTimer?: boolean`, `calibration?: boolean`.
- Colour selector: White / Pink / Brown (`data-testid="noise-<color>"`), play/stop (`data-testid="noise-play"`), volume.
- Timer (if `showTimer`): Off / 15 / 30 / 60 / 120 min with 10 s fade-out at the end.
- Channel: both / left / right (calibration mode adds per-channel buttons for speaker-level matching and a reminder to use −20 dBFS pink noise: set voice gain to 0.1 = −20 dB).
- Noise buffers: 8 s per colour generated once with seeded PRNG (Appendix D.5), looped with 50 ms crossfade at the loop point to avoid clicks.

### 10.16 `LatencyTest.astro`
Algorithm in Appendix D.6. UI:
- Explanation + "Start" (`data-testid="lat-start"`). Plays a short click (1 kHz, 8 ms, or a woodblock-like burst) every 600 ms (100 BPM). Big tap target (`data-testid="lat-tap"`, also `Space` key) — user taps *along with* the beat.
- Progress "Taps: 7 / 16". After 16 valid taps (first 4 discarded as warm-up), show median delay in ms, spread (MAD), interpretation (`data-testid="lat-result"`, `data-ms`).
- Also show browser-reported latency: `baseLatency + outputLatency` when available (`outputLatency` is missing on some browsers, e.g. Safari — show "not reported by this browser").
- "Compare": store result A (e.g. wired/built-in) and result B (Bluetooth) in memory and show the difference = Bluetooth delay estimate.
- Interpretation table: < 40 ms excellent (wired/built-in), 40–100 ms good (low-latency Bluetooth codecs), 100–200 ms typical Bluetooth, 200–300 ms noticeable in games/lip-sync, > 300 ms poor.

---

## 11. Page specifications (hand-written pages)

Conventions for every page in this section:
- **Title** ≤ 60 characters; **meta description** 140–160 characters (tests enforce). Use the exact strings below (adjust only if a test fails length checks).
- **H1** exactly as given; exactly one H1 per page.
- **Words**: count of visible article text (excluding nav/footer/tool UI). Tests enforce the minimum.
- **Primary keyword** must appear in title, H1, first 100 words and at least one H2. Secondary keywords appear naturally (no stuffing; keyword density not a goal).
- **FAQs**: render visibly and as FAQPage JSON-LD from the same array. Answers 40–90 words each, direct first sentence.
- **Internal links**: at least 4 contextual links in the article body to other pages, plus RelatedTests.
- **lastUpdated**: build date by default (constant in `site.ts`), shown as "Last updated November 2026".
- Ad slots: `below-tool` (automatic in ToolLayout), `in-content` after 2nd H2, `before-faq` if ≥ 1,000 words, sidebar (automatic ≥1024px).

### 11.1 Home — `/`
- **Title:** `Sound Test – Check Your Speakers & Headphones Online`
- **Meta:** `Free online sound test: check left and right speakers, headphones, bass and stereo in seconds. Runs in your browser, with no download and nothing uploaded.`
- **H1:** `Sound Test: Check Your Speakers and Headphones`
- **Intro:** "Press a button to play sound in your left speaker, right speaker or both. Everything runs in your browser — no download, no sign-up."
- **Keywords:** primary `sound test` (33,100 · KD 8 · $4.03); secondary `audio test` (14,800 · 10 · $2.98), `sound check` (8,100 · 10 · $7.24), `test speakers` (8,100 · 0 · $1.29), `speaker test` (8,100 · 14 · $1.29), `speaker check` (260).
- **Tool:** `ChannelTest variant="speakers"` (full, with result check) + `LevelMeters` + `Visualizer`; directly below the card a **TestGrid** of all tools (cards with icon, title, 1-line blurb).
- **Words:** ≥ 1,100.
- **Outline (H2s):**
  1. How to use this sound test (3 steps; what "Voice / Tone / Noise" do)
  2. What each sound test checks (short paragraph per tool + link)
  3. No sound at all? Fix it step by step — H3s: Windows 11/10 (output device in Quick Settings, volume mixer, troubleshooter, driver), Mac (System Settings › Sound › Output, mute keys), iPhone (Silent Mode / Action button, volume, Bluetooth still connected), Android (media volume vs ringer, Bluetooth), Chromebook, TV/monitor over HDMI (output device = HDMI, TV speakers vs soundbar)
  4. Sound only comes from one speaker (→ link left-right test; mono audio setting, balance slider, cable/connection, Bluetooth re-pair)
  5. Sound quality problems: crackling, buzzing, distortion, too quiet (sample rate/enhancements on Windows, loose cables, ground-loop hum → link /hz/60/, blown speaker check with /bass-test/ and /frequency-sweep/)
  6. Is it safe? (volume, speakers, hearing — start low)
  7. Privacy: everything is generated in your browser
- **FAQs (7):** How do I test my speakers? · Why is there no sound on my computer? · Why is sound only coming out of one speaker? · Why can't I hear anything on my iPhone? (Silent Mode — and we try to play anyway on recent iOS) · Is this sound test safe for my speakers? · Does this sound test work on phones? · Do I need to download anything?
- **JSON-LD:** WebSite + WebApplication + FAQPage (+ no breadcrumbs on home).

### 11.2 Left/Right — `/left-right-audio-test/`
- **Title:** `Left Right Audio Test – Check Stereo Speakers & Earbuds`
- **Meta:** `Play sound in the left, right or both channels to find swapped or silent speakers, headphones and earbuds. Free left/right audio test with live channel meters.`
- **H1:** `Left Right Audio Test`
- **Keywords:** primary `left right audio test` (3,600 · 5 · **$15.10**); secondary `left right speaker test` (2,400 · 8 · $5.49), `headphone test left right` (1,300 · 20), `left right test` (1,000 · 10), `stereo test` (2,400 · 0).
- **Tool:** `ChannelTest` full (default signal: voice), `LevelMeters`, alternate loop.
- **Words:** ≥ 1,200 (highest-CPC page — make it the most thorough).
- **Outline:**
  1. How to run the left/right test
  2. Reading your result (table: what you heard → what it means → fix) — swapped, one side silent, both from both sides (mono), quieter on one side (balance), crackling on one side (cable/driver)
  3. How to fix swapped left and right channels — speakers (cables to L/R inputs, AVR speaker assignment), headphones (worn backwards; L/R markings), earbuds (case left/right), software (Windows "Mono audio", Realtek/vendor apps; macOS balance; game audio settings)
  4. One side is silent — step list: test with another device, check balance slider (Windows: Sound › Properties › Balance; macOS: Sound › Output › Balance; iPhone: Settings › Accessibility › Audio & Visual › Balance; Android: Accessibility › Audio adjustment), mono audio, cable wiggle test, clean jack, Bluetooth re-pair/reset earbuds
  5. Why left/right matters (stereo imaging, positional audio in games, film mixes)
  6. Laptop and phone speakers: are they really stereo? (many phones use earpiece + bottom speaker as stereo pair; some cheap laptops have mono)
- **FAQs (7):** How do I know if my left and right speakers are swapped? · Why do I only hear sound in one ear? · How do I fix left and right audio on Windows 11? · How do I fix it on a Mac? · How do I fix it on iPhone? · Why does the "left" sound come from both sides? · Do laptop speakers have true stereo?

### 11.3 Headphone test — `/headphone-test/`
- **Title:** `Headphone Test – Left/Right, Bass & Frequency Check`
- **Meta:** `Test headphones and earbuds online: left/right channels, bass, frequency range, stereo imaging and 3D sound. Free, private and works on any phone or computer.`
- **H1:** `Headphone Test`
- **Keywords:** primary `headphone test` (8,100 · 3 · $0.90); secondary `headphone test left right` (1,300), `earbuds test` (480), `airpods test` (210).
- **Tool:** tabs or stacked sections inside one card: Left/Right (`ChannelTest variant="headphones" compact`), Bass (`BassTest compact`: kick + low sweep), Frequency range (`SweepTest compact`), 3D sound (`SpatialDemo`), Polarity (`PolarityTest`). Tabs must be accessible (`role="tablist"`, arrow-key navigation) — or use stacked `<details>` sections if simpler.
- **Words:** ≥ 1,100.
- **Outline:** Quick left/right check · Bass check · Frequency range check (what to expect: most headphones 20 Hz–20 kHz on paper; perception varies) · 3D/imaging check · Comparing two pairs fairly (volume-match, same track) · Troubleshooting: one earbud silent (charge, reset, clean mesh), muffled sound (earwax/mesh, fit/seal, EQ, Bluetooth codec), crackling (cable, dirty jack), Bluetooth audio lag (→ latency test) · Notes for AirPods, Galaxy Buds and gaming headsets (balance, mono, spatial audio settings) · Safe listening (60/60 guideline as general advice).
- **FAQs (7):** How do I test if my headphones are working? · How do I check if one earbud is broken? · What frequency range should headphones have? · How do I test headphone bass? · Why do my headphones sound muffled? · Do headphones need "burn-in"? (honest: evidence is weak; your ears adapt) · Can I test AirPods with this?

### 11.4 Stereo test — `/stereo-test/`
- **Title:** `Stereo Test – Speaker Phase & Polarity Check Online`
- **Meta:** `Check stereo channels, speaker phase and polarity. Hear the difference between in-phase and out-of-phase sound and spot reversed speaker wires in seconds.`
- **H1:** `Stereo Test: Channels, Phase and Polarity`
- **Keywords:** primary `stereo sound test` (2,400 · 0) / `stereo test` (2,400 · 0); secondary `speaker polarity test` (480 · 0 · $1.18), `speaker phase test` (210 · 0).
- **Tool:** `ChannelTest compact`, `PolarityTest`, `StereoPan`.
- **Words:** ≥ 900.
- **Outline:** Channel check · What phase and polarity mean (plain language) · Running the polarity test · Fixing reversed polarity (red/black, +/− at amp and speaker; ribbed/marked wire) · Centre image and speaker placement (equilateral triangle, toe-in, distance from walls) · When "out of phase" is intentional (it isn't for normal listening).
- **FAQs (5):** What does out of phase sound like? · How do I know if my speakers are wired backwards? · Does polarity matter for headphones? · What is a stereo image? · Why does my sound seem off-centre?

### 11.5 Bass test — `/bass-test/`
- **Title:** `Bass Test – Subwoofer & Low Frequency Test Online`
- **Meta:** `Test your subwoofer, speakers or headphones with bass tones from 20 Hz to 200 Hz, a low-frequency sweep and a kick drum loop. Find weak bass and rattles fast.`
- **H1:** `Bass Test`
- **Keywords:** primary `bass test` (4,400 · 0 · $2.00); secondary `subwoofer test` (720 · 0 · $3.09), `subwoofer test tone` (260 · $9.02), `low frequency sound` (1,300 · 5).
- **Tool:** `BassTest` full + `LevelMeters` + `Visualizer`.
- **Words:** ≥ 1,000.
- **Outline:** How to test bass (start low volume) · Reading results — table of typical low-end limits (phone speakers ~250–400 Hz, laptops ~120–200 Hz, small Bluetooth speakers ~70–120 Hz, bookshelf speakers ~45–70 Hz, home subwoofers ~20–35 Hz, good headphones ~20 Hz; label as typical/approximate) · Rattles and buzzes (room objects, car panels, loose drivers) · Subwoofer setup: crossover (80 Hz common starting point), phase switch (0/180 — use the in-phase test), placement ("subwoofer crawl"), gain matching · Protecting small speakers.
- **FAQs (6):** What Hz is good bass? · Why can't I hear 20 Hz? · How do I test my subwoofer? · What crossover frequency should I use? · Can bass tones damage speakers? · Why does my car rattle at certain frequencies?

### 11.6 Surround test — `/surround-sound-test/`
- **Title:** `Surround Sound Test – 5.1 & 7.1 Speaker Check Online`
- **Meta:** `Check 5.1 and 7.1 surround speakers one channel at a time, plus a 3D spatial audio test for headphones. See how many audio channels your device can output.`
- **H1:** `Surround Sound Test (5.1 and 7.1)`
- **Keywords:** primary `surround sound test` (1,600 · 9); secondary `5.1 surround sound test` (480 · 0 · $4.37), `7.1 surround sound test` (320 · 2), `spatial audio test` (590 · 0 · $4.89), `dolby atmos test` (590 · 17).
- **Tool:** `SurroundTest` + `SpatialDemo`.
- **Words:** ≥ 1,100.
- **Outline:** Check how many channels your browser can output · Running the 5.1/7.1 channel test · Enabling multichannel output: Windows (Settings › System › Sound › device › Speaker setup / "Configure" in classic Sound control panel → 5.1/7.1; Chrome/Edge), macOS (Audio MIDI Setup › Configure Speakers), TVs/soundbars (HDMI ARC usually receives stereo PCM from a browser; eARC/AVR needed for discrete multichannel) · Channel order and common swaps (side vs rear) · 3D audio test for headphones · Dolby Atmos and Apple Spatial Audio explained honestly (need encoded content and system/app support; a website can't trigger them; how to test with a streaming service's Atmos demo content instead).
- **FAQs (6):** How do I test 5.1 surround sound? · Why does the test say my browser only outputs 2 channels? · How do I set up 7.1 on Windows? · Can I test Dolby Atmos online? · Does the 3D audio test work with any headphones? · Why is my center channel silent?

### 11.7 Frequency sweep — `/frequency-sweep/`
- **Title:** `Frequency Sweep – 20 Hz to 20 kHz Speaker Test`
- **Meta:** `Play a smooth sine sweep from 20 Hz to 20 kHz to hear your speakers' range, find rattles and check how high you can hear. Adjustable speed, range and channel.`
- **H1:** `Frequency Sweep (20 Hz – 20 kHz)`
- **Keywords:** primary `frequency sweep` (480 · 8); secondary `speaker frequency test` (90 · $1.25), `frequency response test` (50), `sound test hz` (260).
- **Tool:** `SweepTest` full + `Visualizer`.
- **Words:** ≥ 900.
- **Outline:** How to use · What your marks mean (device table: phone speakers, laptops, earbuds, over-ear headphones, bookshelf speakers, studio monitors, subwoofers — typical ranges, approximate) · Why the top end disappears (device roll-off, age, sample rate limit: 44.1 kHz → 22.05 kHz max) · Finding resonances and rattles · Log vs linear sweeps · Limits of a listening test (it's perception, not a microphone measurement).
- **FAQs (5):** What is a frequency sweep? · What frequency range can humans hear? · Why does the sweep go quiet before 20 kHz? · Is a sweep safe for tweeters? · Log or linear sweep?

### 11.8 Tone generator — `/tone-generator/`
- **Title:** `Tone Generator – Free Online Hz Frequency Generator`
- **Meta:** `Generate a pure tone at any frequency from 1 Hz to 22 kHz. Sine, square, sawtooth or triangle waves, fine-tune in 0.1 Hz steps, pick a channel and share a link.`
- **H1:** `Online Tone Generator`
- **Keywords:** primary `tone generator` (22,200 · 30 · $1.06 — stretch) / `online tone generator` (18,100 · 28 · $1.43 — stretch); realistic secondary `hz generator` (3,600 · 30 · $2.65), `sine wave generator` (2,900 · 18 · $1.75), `sound frequency generator` (2,400 · 22 · $1.71), `1khz test tone` (390), `test tone` (590).
- **Tool:** `ToneGenerator` full with presets `[20, 50, 60, 100, 165, 440, 1000, 10000, 15000]`, `LevelMeters`, `Visualizer`.
- **Words:** ≥ 1,000.
- **Outline:** How to use (incl. keyboard shortcuts table) · Waveforms explained (sine = pure; square/saw = rich harmonics; triangle = soft) · What people use a tone generator for (tuning instruments → 440 Hz; testing speakers/subwoofers; finding rattles; electronics/science demos; matching the pitch of a ringing sound to describe it to a professional — no medical claims) · Musical notes and frequencies table (C4 261.63, D4 293.66, E4 329.63, F4 349.23, G4 392.00, A4 440.00, B4 493.88, C5 523.25; also E1 41.20, A2 110.00, E2 82.41) · Frequency directory (link to `/hz/`) · Share a tone link.
- **FAQs (6):** What frequency is middle C? · What is 440 Hz used for? · What is the difference between sine and square waves? · What is the highest frequency I can generate? · Can I play two tones at once? (not in v1 — say so honestly; suggest two tabs) · Can a tone generator damage speakers?

### 11.9 Water eject — `/water-eject/`
- **Title:** `Water Eject – Speaker Cleaner Sound to Remove Water`
- **Meta:** `Play a 165 Hz tone to help push water out of your phone speaker after a splash. Free water eject sound for iPhone and Android, with no app or shortcut needed.`
- **H1:** `Water Eject: Speaker Cleaner Sound`
- **Keywords:** primary `water eject` (18,100 · 11); secondary `water eject sound` (3,600 · 2 · $1.47), `speaker cleaner` (3,600 · 0 · $1.18), `phone speaker cleaner` (1,600 · 4 · $1.06), `165 hz` (1,000 · 0), `clean speaker sound` (590 · 0), `fix my speakers` (9,900 · 24 — brand of a competitor; do not target in title).
- **Tool:** `WaterEject`.
- **Words:** ≥ 1,000.
- **Outline:** How to use (volume max, speaker facing down, run 60 s, repeat 2–3×) · How it works (low-frequency vibration moves the speaker membrane and pushes droplets out of the grille; same idea as Apple Watch Water Lock's sound) · iPhone steps · Android steps · Dust and lint mode (pulse) and gentle cleaning (soft brush; no sharp objects) · What not to do (no heat/hair dryer, no compressed air up close, don't poke the grille; **Apple's own guidance advises against putting an iPhone in rice**) · When sound stays muffled (dry for hours; liquid-detection alerts; repair) · Honest limits (helps with a little water in the grille; cannot fix water damage).
- **FAQs (7):** Does water eject actually work? · What frequency is the water eject sound? · Is it safe for my speaker? · How long should I play it? · Does it work on AirPods? (not designed for it; dry them, contact Apple if needed) · Is this the same as the Water Eject shortcut? (same principle, no install) · Why is my speaker still muffled?

### 11.10 Dog whistle — `/dog-whistle/`
- **Title:** `Dog Whistle Sound – Online High-Frequency Dog Whistle`
- **Meta:** `Play an adjustable high-pitched dog whistle sound from 8 kHz to 22 kHz. Steady or pulse patterns, training tips and an honest look at what really works.`
- **H1:** `Online Dog Whistle`
- **Keywords:** primary `dog whistle sound` (18,100 · 3 · $1.27); secondary `dog whistle online` (480 · 5 · $1.44), `dog whistle` (60,500 · 24 — stretch, not primary).
- **Tool:** `DogWhistle`.
- **Words:** ≥ 900.
- **Outline:** How to use · Choosing a frequency · Can people hear it? (adults usually hear up to ~12–16 kHz; children/teens higher; many will hear this tool's lower settings) · Honest limits: physical dog whistles typically work around 23–54 kHz (ultrasonic) — phone/laptop speakers and browsers can't produce that; this tool plays high but audible-range tones that dogs hear very well · Using a whistle in training (pair with reward, consistent cue, recall pattern) · Safety and kindness (short bursts, low volume, never as punishment, watch stress signals, other pets).
- **FAQs (6):** Can dogs hear this through my phone? · What frequency is a dog whistle? · Can humans hear a dog whistle? · Do dog whistles stop barking? · Will it hurt my dog's ears? · Does it work on cats?

### 11.11 High-frequency sound — `/high-frequency-sound/`
- **Title:** `High Frequency Sound Test – How High Can You Hear?`
- **Meta:** `Play high-frequency tones from 8 kHz to 20 kHz and find the highest pitch you can hear on your headphones or speakers. A quick, non-medical hearing range check.`
- **H1:** `High Frequency Sound Test`
- **Keywords:** primary `high frequency sound` (4,400 · 9); secondary `high pitch sound` (12,100 · 0 — mixed intent: SFX downloads + "I hear a high-pitched noise"; address with a short section), `20000 hz` (720 · 10), `hearing range test` (260 · 36).
- **Tool:** `HearingRangeCheck` + `ToneGenerator compact initialFrequency=12000`.
- **Words:** ≥ 1,000.
- **Outline:** How to use (headphones recommended, start quiet) · Typical high-frequency hearing by age — a **rough, commonly reported** table with a clear caveat (e.g. under 20: often 17–20 kHz; 20s–30s: ~15–17 kHz; 40s–50s: ~12–15 kHz; 60+: often below 12 kHz — "varies widely") · Why it's not a hearing test (device limits, room, calibration) · Device limits (sample rate, speaker roll-off) · Hearing a high-pitched noise at home? (electronics coil whine, chargers, pest repellers, smoke alarm chirp, tinnitus — see a professional if it's only in your head) · Protecting your hearing.
- **FAQs (6):** What is the highest frequency humans can hear? · Why can't I hear 20,000 Hz? · Is this a real hearing test? (no) · Why do I hear a high-pitched sound in my house? · Can high-frequency sounds damage hearing? · Why can my kids hear sounds I can't?

### 11.12 Mosquito sound — `/mosquito-sound/`
- **Title:** `Mosquito Sound – 17.4 kHz Teen Tone & Mosquito Buzz`
- **Meta:** `Can you hear the mosquito tone? Play the 17.4 kHz "teen tone", other high-pitched ringtones or a realistic mosquito buzz, and learn why adults can't hear it.`
- **H1:** `Mosquito Sound: The 17.4 kHz Teen Tone`
- **Keywords:** primary `mosquito sound` (2,900 · 8 · $3.10); secondary `mosquito ringtone` (720 · 1), `17000 hz` (260), `17.4 khz` (50).
- **⚠ Intent check:** the SERP for "mosquito sound" was **not** inspected in the research. Some searchers want the **insect buzz**. The page covers both: teen tone first, insect buzz second. After launch, check Search Console queries and adjust the order.
- **Tool:** `MosquitoTone`.
- **Words:** ≥ 900.
- **Outline:** Play the teen tone · What the "Mosquito" device is (a 2000s UK anti-loitering device using ~17.4 kHz; later the tone became a "teacher-proof" ringtone) · Why teens hear it and adults don't (age-related high-frequency loss) · Other high-pitched tones (15–19 kHz) · The insect: what a real mosquito sounds like (wingbeat roughly 400–700 Hz; females lower) and the buzz generator · Do mosquito-repellent sounds work? (evidence says ultrasonic repellers don't repel mosquitoes — present cautiously as "studies have generally found no effect").
- **FAQs (5):** What frequency is the mosquito tone? · Why can't adults hear the mosquito sound? · Can a phone play 17.4 kHz? · Do ultrasonic mosquito repellents work? · Why does a mosquito buzz?

### 11.13 Pink noise — `/pink-noise/` (phase 2)
- **Title:** `Pink Noise Generator – Speaker Calibration & Focus`
- **Meta:** `Play pink noise online for speaker calibration, room tuning, sleep or focus. Set the channel and level, with a step-by-step home theater calibration guide.`
- **H1:** `Pink Noise Generator`
- **Keywords:** `pink noise generator` (880 · 30 · $1.80), `pink noise` (33,100 · 27 — stretch).
- **Tool:** `NoiseGenerator defaultColor="pink" calibration showTimer`.
- **Words:** ≥ 800.
- **Outline:** What pink noise is (equal energy per octave; sounds balanced, like steady rain) · Calibrating speaker levels with an SPL meter or phone app (−20 dBFS pink noise per channel, match levels; 75 dB reference is a common home-theatre target) · Using pink noise for room tuning/EQ · Pink vs white vs brown (→ noise generator) · Sleep/focus use (neutral, no health claims).
- **FAQs (4):** What is pink noise used for? · Pink vs white noise? · How do I calibrate speakers with pink noise? · Is pink noise safe to sleep with? (general comfort/volume advice only, no health claims)

### 11.14 Noise generator — `/noise-generator/` (phase 2)
- **Title:** `White, Pink & Brown Noise Generator – Free Online`
- **Meta:** `Free online white, pink and brown noise generator. Mask background sound, focus or relax, with a sleep timer and smooth fade-out. Works in any browser.`
- **H1:** `White, Pink and Brown Noise Generator`
- **Keywords:** `brown noise generator` (1,000 · 12 · $2.03), `noise generator` (1,000 · 33), `white noise generator` (4,400 · 54 — stretch).
- **Tool:** `NoiseGenerator defaultColor="brown" showTimer`.
- **Words:** ≥ 800.
- **Outline:** How to use · The colours explained (white = flat per Hz, hiss; pink = −3 dB/octave, balanced; brown = −6 dB/octave, deep rumble) · Masking noise (offices, neighbours) · Sleep timer & fade · Volume guidance · Why a generator instead of a long video (no ads interrupting, no buffering, infinite).
- **FAQs (4):** What is brown noise? · Which noise colour is best for focus? (subjective; try each) · Can I leave it running all night? · Does it use data? (no, generated locally after page load)

### 11.15 Audio latency test — `/audio-latency-test/` (phase 2)
- **Title:** `Audio Latency Test – Check Bluetooth Audio Delay`
- **Meta:** `Measure your audio delay by tapping along to a beat. Compare wired and Bluetooth headphones to see your real Bluetooth lag in milliseconds. Free and private.`
- **H1:** `Audio Latency Test`
- **Keywords:** `audio latency test` (1,000 · 5), `bluetooth audio delay test` (20), `audio sync test` (390 · 0), `lip sync test` (30).
- **Tool:** `LatencyTest`.
- **Words:** ≥ 800.
- **Outline:** How the tap test works (you tap in time with what you hear; the offset from the scheduled sound reflects total output delay; human timing adds a small constant error, which cancels out when comparing two devices) · Measure wired vs Bluetooth and compare · What's a good result (table) · Reducing Bluetooth lag (codec support, game mode, keep devices close, update firmware, wired for gaming/music production) · Lip-sync issues on TVs (AV sync setting).
- **FAQs (4):** How much delay does Bluetooth add? · Why is my Bluetooth audio out of sync with video? · Does this test work on phones? · Why is the result different each time?

---

## 12. Programmatic Hz pages

### 12.1 Routing
- `src/pages/hz/[freq].astro` with `getStaticPaths()` over `frequencies` from `src/data/frequencies.ts`. URL: `/hz/<number>/` (plain integer, no commas): `/hz/20/`, `/hz/60/`, `/hz/440/`, `/hz/1000/`, `/hz/17000/`.
- `src/pages/hz/index.astro` — the hub ("Frequency Tones Directory").

### 12.2 Data schema
```ts
export interface FrequencyEntry {
  hz: number;                      // e.g. 60
  band: 'sub-bass' | 'bass' | 'low-mid' | 'mid' | 'high-mid' | 'treble' | 'ultra-high';
  searchVolume: number;            // from Appendix A (used for ordering in hub only, not rendered)
  shortFact: string;               // ≤ 110 chars, used in meta description
  intro: string;                   // 2–3 sentences, unique per page
  whatYouHear: string;             // 2–3 sentences
  uses: string[];                  // 3–5 bullet points, unique and specific
  devices: 'auto';                 // device table computed from hz (see 12.4)
  extraFaqs: { q: string; a: string }[];   // 1–2 unique FAQs per frequency
  related: (PageId | `hz-${number}`)[];    // 2–4
  safety?: string;                 // auto for <40 Hz and >12 kHz; optional override
}
```

### 12.3 The 18 frequencies (write `intro`, `whatYouHear`, `uses`, `extraFaqs` from these facts; keep everything accurate and non-medical)
| Hz | US vol | KD | Key facts to use |
|---|---|---|---|
| 20 | 720 | 0 | Commonly cited lower limit of human hearing; felt more than heard; only large subwoofers reproduce it cleanly; phones/laptops/most headphones can't play it audibly; pipe-organ 32-foot stops go even lower (~16 Hz). Related: bass-test, sweep, hz-30 |
| 30 | 480 | 0 | Deep sub-bass; many films' rumble effects and some 808 bass notes sit around 30–50 Hz; a good home subwoofer reaches ~25–30 Hz; room modes make it boom or vanish depending on seat. Related: bass-test, hz-20, hz-40 |
| 40 | 2,400 | 0 | Low E on a 4-string bass guitar ≈ 41.2 Hz; common subwoofer test point. Many searchers come for "40 Hz gamma" research (MIT studies of 40 Hz light-and-sound stimulation in mice) — mention that research exists and is ongoing, **make no health claims**, and point out this page simply plays a tone. Related: bass-test, hz-30, hz-50 |
| 50 | 480 | 0 | Mains electricity frequency in Europe, most of Asia, Africa and Australia → 50 Hz (and 100 Hz) hum from ground loops/transformers. Related: hz-60, hz-100, home (hum troubleshooting) |
| 60 | 3,600 | 13 | Mains frequency in the US, Canada and parts of South America → 60 Hz hum and 120 Hz buzz; ground-loop hum troubleshooting (isolator, same outlet, cheater plugs are unsafe); not the same thing as a 60 Hz monitor refresh rate. Related: hz-50, bass-test, home |
| 80 | 320 | 0 | THX's recommended subwoofer crossover; transition between subwoofer and main speakers; kick drum body. Related: bass-test, surround, hz-100 |
| 100 | 1,000 | 0 | Upper bass "punch"; 100 Hz hum = rectified 50 Hz mains; many small speakers start producing usable bass around here. Related: bass-test, hz-50, hz-150 |
| 150 | 210 | 0 | Low-mid / mid-bass; typical lower limit of laptop speakers; male voice fundamentals ~85–180 Hz. Related: hz-100, hz-200, sweep |
| 165 | 1,000 | 0 | The water-eject tone used by popular speaker-cleaning shortcuts/apps; low-mid frequency that moves a small speaker membrane strongly. Related: **water-eject** (primary link), hz-150, hz-200 |
| 200 | 880 | 0 | Warmth/"mud" region in mixing; phone speakers start to produce sound around 200–400 Hz; female voice fundamentals ~165–255 Hz. Related: hz-165, sweep, tone |
| 440 | 2,900 | 4 | Concert pitch A4 (ISO 16 standard); orchestras tune to it (some to 442); North American dial tone combines 350 Hz + 440 Hz; tuning fork standard. Mention 432 Hz debate neutrally (preference, no scientific health effect claims). Related: tone, hz-1000 |
| 1000 | 1,000 | 1 | Standard 1 kHz reference/test tone (level calibration, line-up tone); the classic TV "censor bleep" is typically ~1 kHz; the phon loudness scale is defined at 1 kHz. Related: tone, sweep, hz-440 |
| 8000 | 320 | 0 | Highest frequency on a standard audiogram (250–8,000 Hz); sibilance ("s" sounds) 5–8 kHz; many voice codecs cut above ~3.4–8 kHz. Related: high-frequency, hz-10000 |
| 10000 | 880 | 0 | Treble "air"/brilliance; cymbals and room ambience; most people under ~50 hear it comfortably (approximate). Related: high-frequency, hz-8000, hz-12000 |
| 12000 | 170 | 0 | Upper treble; commonly becomes harder to hear in later adulthood (approximate, varies). Related: high-frequency, hz-10000, hz-15000 |
| 15000 | 390 | 0 | Many adults over about 40–50 can no longer hear it (varies widely); old CRT TVs whined at ~15.7 kHz (NTSC line frequency 15.734 kHz). Related: high-frequency, mosquito, hz-17000 |
| 17000 | 260 | 0 | Near the "mosquito" teen tone (17.4 kHz); typically audible to teens/young adults; many speakers still reproduce it. Related: **mosquito**, high-frequency, hz-20000 |
| 20000 | 720 | 10 | Commonly cited upper limit of human hearing — rarely audible after the teens; CD audio (44.1 kHz) can represent up to 22.05 kHz; many phone/laptop speakers roll off before 20 kHz. Related: high-frequency, sweep, hz-17000 |

### 12.4 Hz page template
- **Title:** `${hz} Hz Tone – Play a Pure ${hz} Hz Sine Wave Online` (≤ 60 chars for all 18; e.g. "20000 Hz Tone – Play a Pure 20000 Hz Sine Wave Online" = 53).
- **Meta:** `Play a pure ${hz} Hz tone online. ${shortFact} Adjust volume, waveform and channel — free and instant.` → must land 140–160 chars; write each `shortFact` so the total fits (test enforces).
- **H1:** `${hz} Hz Tone` (for ≥ 1000 also show "(${hz/1000} kHz)" in the intro).
- **Tool:** `ToneGenerator initialFrequency={hz} lockFrequency compact` (frequency fixed, fine-tune disclosure available), with play button prominent; `LevelMeters`.
- **Sections:** intro · What you should hear · What ${hz} Hz is used for (bullets from `uses`) · Can your device play ${hz} Hz? (DeviceTable computed: for each device class — phone speaker (~300 Hz–18 kHz), laptop speakers (~150 Hz–18 kHz), earbuds (~20 Hz–20 kHz), over-ear headphones (~20 Hz–20 kHz), bookshelf speakers (~50 Hz–20 kHz), subwoofer (~20–150 Hz) — show "✓ usually", "~ maybe quiet", "✗ unlikely" based on thresholds; label as typical) · Safety note (auto: <40 Hz "felt more than heard — keep volume moderate, protect small speakers"; >12 kHz "high tones can be uncomfortable — keep volume low") · FAQ: 3 templated (What does a ${hz} Hz tone sound like? / Can everyone hear ${hz} Hz? / Can ${hz} Hz damage my speakers or ears?) + `extraFaqs` · Nearby frequencies (prev/next in list + 2 related) · Link to tone generator and the related test pages.
- **Words:** ≥ 350 visible words per Hz page (tests enforce). Text must be meaningfully unique per page (tests check pairwise similarity — §17.3).
- **JSON-LD:** WebApplication + BreadcrumbList (Home › Frequency tones › ${hz} Hz) + FAQPage.

### 12.5 Hz hub `/hz/`
- **Title:** `Frequency Tones Directory – Play Any Hz Test Tone`
- **Meta:** `Play test tones from 20 Hz to 20,000 Hz: sub-bass, mains hum, concert pitch A440, the 1 kHz reference tone and high-frequency hearing tones. Free and instant.`
- **H1:** `Frequency Tones: 20 Hz to 20,000 Hz`
- Grouped table by band with each frequency, one-line fact, play button (inline small ToneGenerator-lite button that plays/stops that tone) and link to its page. Link to tone generator for custom values. ≥ 400 words of intro/explainer (bands explained, safety).

---

## 13. Legal, utility and error pages

All use BaseLayout, `showAds={false}`, simple prose, H1, included in sitemap (except 404).

| Page | Title | Content requirements |
|---|---|---|
| `/about/` | `About Sound Test Hub` | Who/why (independent project building simple, private audio tools), how the tools work (Web Audio, generated locally), editorial approach (practical, tested on real devices, no health claims), contact link. ≥ 300 words |
| `/privacy/` | `Privacy Policy – Sound Test Hub` | No audio recorded or uploaded (we don't access the microphone at all); preferences in localStorage (volume, theme) only; hosting provider logs; **Google AdSense**: third-party vendors including Google use cookies to serve ads based on prior visits; users can opt out of personalised advertising via Google Ads Settings (adssettings.google.com) and aboutads.info; consent management for EEA/UK users via Google's certified CMP; US state privacy rights note; optional Cloudflare Web Analytics (cookieless) if enabled; children's privacy; contact email from env; effective date |
| `/terms/` | `Terms of Use – Sound Test Hub` | Tools provided "as is"; user responsible for safe volume; not medical advice; no warranty for device damage (start low); trademarks belong to owners; governing terms placeholder clearly marked for owner to edit (`<!-- OWNER: set jurisdiction -->`) |
| `/contact/` | `Contact – Sound Test Hub` | Email link from `PUBLIC_CONTACT_EMAIL` (no form, no backend), what to include in bug reports (browser, device, page) |
| `/404` | `Page Not Found – Sound Test Hub` | Friendly message + TestGrid + search-free list of popular tests; `noindex` |

---

## 14. Technical SEO specification

1. **`Seo.astro`** outputs: `<title>`, meta description, canonical (absolute, trailing slash), `robots` (index,follow unless `noindex`), Open Graph (`og:title`, `og:description`, `og:url`, `og:type=website`, `og:site_name`, `og:image` absolute 1200×630, `og:image:alt`), Twitter (`summary_large_image`), `theme-color` (light & dark variants via `media`), GSC verification meta if set.
2. **JSON-LD** (`JsonLd.astro` renders `<script type="application/ld+json">` safely escaped):
   - Home: `WebSite` (name, url) + `WebApplication`.
   - Every tool page: `WebApplication` — `name`, `url`, `applicationCategory: "MultimediaApplication"`, `operatingSystem: "Any"`, `browserRequirements: "Requires JavaScript and the Web Audio API"`, `offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }`, `isAccessibleForFree: true`, `description`.
   - Non-home pages: `BreadcrumbList`.
   - Pages with FAQs: `FAQPage` whose `mainEntity` exactly matches the visible Q&A text. (Note: Google currently shows FAQ rich results only for authoritative government/health sites, so this is for semantics, not snippets.)
   - **Do not** add `AggregateRating`, `Review`, or `HowTo` markup (no fake ratings; HowTo rich results are deprecated).
3. **Sitemap:** `@astrojs/sitemap` → `/sitemap-index.xml`; exclude 404.
4. **robots.txt:** `User-agent: *`, `Allow: /`, `Sitemap: ${SITE_URL}/sitemap-index.xml`. Generate it from config (endpoint `src/pages/robots.txt.ts`) so the sitemap URL follows `SITE_URL`; remove `public/robots.txt` if using the endpoint.
5. **URLs:** lowercase, hyphenated, trailing slash, no dates. Never change them after launch.
6. **Headings:** one H1; logical H2/H3 order (no skipped levels inside article).
7. **Internal linking:** registry-driven RelatedTests on every page; contextual links in body; sidebar "Popular tests"; footer full directory; Hz pages prev/next. High-CPC pages (home, left-right, surround) must be linked from every page (footer + sidebar satisfy this).
8. **Images:** none in content except inline SVG diagrams (with `<title>`/`aria-label`). OG image generated once (default) — per-page OG images optional.
9. **Performance as SEO:** see §16; Core Web Vitals targets LCP < 1.5 s (fast 4G mobile), CLS < 0.05 (ad slots reserve space), INP < 100 ms.
10. **Canonical query params:** tone generator's `?f=` share links keep the canonical without params.
11. **hreflang:** not needed (English, US).
12. **Last updated** visible on every tool page; update when content changes.

---

## 15. AdSense and monetisation

### 15.1 Implementation
- `AdSenseScript.astro`: if `PUBLIC_ADSENSE_CLIENT` is set and the page's `showAds` is true, add to `<head>`:
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}" crossorigin="anonymous"></script>`
- `AdSlot.astro` props: `position: 'below-tool' | 'in-content' | 'sidebar' | 'before-faq'`. Renders:
  ```html
  <aside class="ad ad--{position}" aria-label="Advertisement">
    <span class="ad__label">Advertisement</span>
    <ins class="adsbygoogle" style="display:block" data-ad-client="{CLIENT}" data-ad-slot="{SLOT}" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(window.adsbygoogle = window.adsbygoogle || []).push({});</script>
  </aside>
  ```
  - If client or that position's slot env is missing: render **nothing** in production; in `astro dev` render a dashed placeholder box with the position name (helps layout work).
  - Reserve space to avoid CLS: `.ad--below-tool, .ad--in-content, .ad--before-faq { min-height: 280px }` on mobile, `min-height: 120px` (≥768px) for horizontal; `.ad--sidebar { min-height: 600px; position: sticky; top: 88px }`.
- `ads.txt` endpoint (`src/pages/ads.txt.ts`): if client set → `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` (derive `pub-` id from `ca-pub-`); else a single comment line `# Set PUBLIC_ADSENSE_CLIENT to publish ads.txt`.

### 15.2 Placement rules (policy + UX)
- Never place ads inside a tool card or adjacent to play/stop/channel buttons; there must be at least the safety-hint line plus margin (≥ 24px) between the tool card and the first ad. Never style ads to look like tool controls. Never use text like "click here" near ads.
- Max ads in view on mobile: 1 at a time; total per page ≤ 4 units (below-tool, in-content, before-faq, sidebar on desktop).
- No ads on 404, privacy, terms, contact, about.
- Do not use Auto ads initially (layout shifts and ads inside tools); manual placements only. Owner can experiment later.
- Consent: owner enables Google's certified CMP (Privacy & messaging → European regulations message) and US state regulations settings in AdSense. The site itself needs no custom banner.

### 15.3 Monetisation-driven UX
- Internal links from low-CPC pages (Hz pages, dog whistle, noise) to high-CPC pages (left-right, home, surround, bass).
- Encourage multi-tool sessions: after a result, suggest the next relevant test ("Next: check your bass →").

---

## 16. Performance, security headers, hosting and deploy

### 16.1 Performance budget (enforced by tests where possible)
- HTML per page ≤ 60 KB uncompressed (excluding inline JSON-LD is fine to include — just keep it lean).
- JS per page ≤ 35 KB gzipped (sum of `<script type="module" src>` chunks + inline scripts), excluding AdSense/CF beacon.
- CSS total ≤ 25 KB gzipped (single shared stylesheet preferred).
- No web fonts; no render-blocking third-party resources (AdSense `async`).
- Voice clips lazy-loaded only when used.

### 16.2 `public/_headers` (Cloudflare Pages / Netlify)
```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  X-Frame-Options: SAMEORIGIN

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/audio/*
  Cache-Control: public, max-age=31536000, immutable
```
(No strict CSP in v1 — AdSense requires many dynamic domains; revisit later. If phase-3 microphone tools are added, change `microphone=()` to `microphone=(self)`.)

### 16.3 Hosting (recommended: Cloudflare Pages, free tier)
- Build command `npm run build`, output dir `dist`, env `NODE_VERSION=22.23.4` (or newer satisfying Astro's engine), plus the env vars from §6.
- Custom domain: `soundtesthub.com` (apex) + redirect `www` → apex.
- Netlify or Vercel static also work (same `_headers` for Netlify; Vercel needs `vercel.json` headers — optional).

### 16.4 README must include
Local dev, test commands, env vars, deploy steps (Cloudflare Pages), how to add a new Hz page (edit `frequencies.ts`), how to add a tool page (registry + page + tests), regenerating voices/images.

### 16.5 CI (optional)
`.github/workflows/sound-test-site.yml` at repo root: on push/PR touching `sound-test-site/**` → setup Node 22.23.4+, `npm ci`, `npx playwright install --with-deps chromium`, `npm test`. Note: pushing workflow files may require a token with `workflow` scope; if the push is rejected, keep the file locally and tell the owner.

---

## 17. Testing specification

Four layers. All must pass before "done".

### 17.1 Type check
`npm run check` (`astro check`) — zero errors, zero warnings in `src/`.

### 17.2 Unit tests (`tests/unit`, Vitest, Node environment)
| File | Must test |
|---|---|
| `math.test.ts` | log slider mapping round-trips (`sliderToHz(hzToSlider(f)) ≈ f` for 1, 20, 440, 1000, 20000 within 0.01%); `hzToNote(440)` → `{name:'A4', cents:0}`, `hzToNote(261.63)` → C4 ±1 cent, `hzToNote(41.2)` → E1; `dbToGain(-20) ≈ 0.1`, `gainToDb(0.5) ≈ -6.02`; perceptual volume mapping monotonic and 0→0, 1→1; `clampFrequency` respects sample rate (`48000 → max 23950`, `44100 → max 22000`); `sweepFrequencyAt(20, 20000, 20, t)` = 20 at t=0, 20000 at t=20, ≈ 632.46 at t=10 (geometric mean) for log mode, linear mode mid = 10010; `formatHz(17400)` → "17,400 Hz" / "17.4 kHz" per option |
| `noise.test.ts` | Seeded generator is deterministic; output within [-1, 1]; mean ≈ 0 (|mean| < 0.02 over 2 s @ 48 kHz); **spectral slope** via Welch-averaged FFT, linear fit of log10(PSD) vs log10(f) over 100 Hz–10 kHz: white ≈ 0 (±0.15), pink ≈ −1 (±0.2), brown ≈ −2 (±0.35); loop crossfade has no discontinuity (max |x[n]-x[n-1]| at the loop seam < 5× median step) |
| `scheduler.test.ts` | Pure "what to schedule" function returns correct times for given currentTime/lookahead/interval; no duplicates across consecutive calls; handles patterns (recall pattern timings), BPM changes |
| `latency.test.ts` | Median & MAD calculation; warm-up taps discarded; outlier rejection (±250 ms from median); nearest-beat matching with negative and positive offsets; requires ≥ 12 valid taps; synthetic data (beats every 600 ms, taps at +180 ms ± 10 ms noise) → result 180 ± 5 ms |
| `channels.test.ts` | Target → merger input mapping for 'left'/'right'/'both'/index; surround layouts produce correct channel indices/labels for 5.1 and 7.1; invalid index throws |
| `frequencies.test.ts` | 18 entries; unique `hz`; ascending; each has ≥ 3 uses, `intro` ≥ 25 words, ≥ 1 extraFaq; all `related` ids resolve; computed meta description length 140–160 for every entry; title ≤ 60 |
| `registry.test.ts` | Every registry entry has unique id/path; every `related` resolves; nav/footer groups cover all tool pages |
| `hearing.test.ts` | Step-up sequence starts at 8000, increments 1000, stops at `min(20000, maxFrequency)`; result recorded correctly |
| `result.test.ts` | Channel-test result logic (all combinations → ok/swapped/left-silent/right-silent/mono/other) |

Put pure logic in separate modules (no DOM, no AudioContext) so it's unit-testable. Test helpers: `tests/helpers/fft.ts` (radix-2 FFT + Welch PSD) and `goertzel.ts`.

### 17.3 Built-site QA (`tests/site`, Vitest, runs over `dist/` after `npm run build`)
Parse every `dist/**/index.html` (use a tiny HTML parser dependency such as `node-html-parser` as a devDependency, or regex-free DOM via `linkedom` — pick one, devDependency only).
For **every** page:
- Exactly one `<h1>`; `<title>` present, ≤ 60 chars, unique across site; meta description 140–160 chars, unique across site (legal pages: 70–160 allowed).
- `<link rel="canonical">` absolute, starts with `SITE_URL`, ends with `/`, equals the page's own URL.
- `og:title`, `og:description`, `og:url`, `og:image` present; `og:image` file exists in `dist`.
- All JSON-LD blocks parse as JSON; tool pages contain a `WebApplication`; non-home pages contain a `BreadcrumbList`; if a FAQ section is visible, a `FAQPage` exists and its question/answer texts exactly match the visible ones.
- **No broken internal links:** every `href` starting with `/` resolves to a file in `dist` (`/path/` → `dist/path/index.html`, assets direct). No links to `http://localhost`.
- No `<img>` without `alt`; all inline SVG icons used as content have `aria-label` or `aria-hidden="true"`.
- **Word count** of `<article>` text: home ≥ 1,100, left-right ≥ 1,200, other hand-written tool pages per §11, Hz pages ≥ 350, hub ≥ 400, legal ≥ 300 (privacy ≥ 500).
- **Primary keyword presence** (from `src/data/keywords.ts`): in title, H1 and first 100 words of the article.
- **Uniqueness:** pairwise Jaccard similarity of word 5-gram shingles between any two Hz pages' article text < 0.5; between any two hand-written pages < 0.3.
- **Budgets:** gzipped size of all JS referenced by the page ≤ 35 KB; HTML ≤ 60 KB; CSS ≤ 25 KB gz.
- **Ads:** when built without `PUBLIC_ADSENSE_CLIENT`, no page contains `adsbygoogle` or `googlesyndication`. Add a second build in the test (`SITE_URL=... PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000 PUBLIC_ADSENSE_SLOT_*=1234567890 astro build --outDir dist-ads` — or run build twice in a `globalSetup`) and assert: tool pages contain the script once and ≤ 4 `<ins class="adsbygoogle">`; legal pages and 404 contain none; `ads.txt` contains `pub-0000000000000000`. (If `--outDir` is unsupported by the Astro CLI version, set `outDir` from an env var in `astro.config.mjs`.)
- `sitemap-index.xml` exists, the sitemap lists every indexable page (all except 404) with absolute URLs; `robots.txt` references it.
- `ads.txt` exists.
- `_headers` copied to `dist`.

### 17.4 End-to-end (`tests/e2e`, Playwright, Chromium)
**Config:** `webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4321', reuseExistingServer: true }`; projects: `desktop-chromium` (1366×768) and `mobile-chromium` (Pixel 7 device descriptor). Launch args: `['--autoplay-policy=no-user-gesture-required']`. In the Claude Code cloud container use the pre-installed browsers (pin `@playwright/test@1.63.0`; if versions differ, set `launchOptions.executablePath: '/opt/pw-browsers/chromium'` — check the actual binary path inside that folder). Always run with `--trace off` unless debugging.

**Audio verification strategy (important):**
1. **Offline (deterministic, primary):** inside the page, use `window.soundTestHub.createEngine({ context: new OfflineAudioContext({ numberOfChannels: N, length: sampleRate * seconds, sampleRate: 48000 }) })`, start voices, `startRendering()`, then analyse the rendered `AudioBuffer` in `page.evaluate` with a Goertzel/FFT helper injected via `page.addInitScript` (bundle `tests/helpers/goertzel.ts` as a string or re-implement small JS inline).
2. **Live (smoke):** click real UI buttons, then poll `window.soundTestHub.getEngine().getChannelLevels()` / `peakFrequency()` for up to 2 s. In **Milestone 0**, verify that a live `AudioContext` reaches `'running'` and its analysers see signal in headless Chromium. If it does not (no audio sink), keep live tests limited to UI state (`aria-pressed`, status pill, `engine.isPlaying()`) and rely on offline tests for signal correctness; document this in DECISIONS.md.

**Tests (each a separate `test()`):**
- **All pages smoke** (loop over sitemap URLs): status 200; no console errors or page errors; exactly one H1; no horizontal overflow (`document.documentElement.scrollWidth <= innerWidth`) at 360 px width; tool card visible within first viewport on tool pages; axe-core: zero `serious`/`critical` violations.
- **Engine offline — tone frequency:** sine 1000 Hz for 1 s → Goertzel power at 1000 Hz ≥ 20 dB above power at 900 Hz and 1100 Hz; same for 60 Hz, 440 Hz, 17400 Hz.
- **Engine offline — routing:** target 'left' → right channel RMS < 1e-4 and left RMS > 0.05; 'right' inverse; 'both' both > 0.05.
- **Engine offline — polarity:** pink noise with `invertRight` → Pearson correlation(L, R) < −0.99; without → > 0.99.
- **Engine offline — surround:** 6-channel offline context, target index 3 (LFE) → only channel 3 has energy; 8-channel index 6 → only channel 6.
- **Engine offline — envelope:** first 5 ms after start and last samples after stop contain no sample-to-sample jump > 0.1 (click-free).
- **Engine offline — sweep:** 20→20000 Hz over 2 s log: dominant frequency in the window around t=1 s is within ±10% of 632 Hz.
- **Engine offline — noise colours:** slope test (same thresholds as unit) on rendered buffers.
- **Engine offline — kick:** energy below 150 Hz ≫ energy above 1 kHz (≥ 20 dB).
- **Engine offline — limiter:** two full-scale tones summed never exceed |1.0| in the stereo path.
- **UI — channel test:** on `/left-right-audio-test/` click `ch-left` → `aria-pressed=true`, status "Playing", engine `isPlaying()` true; (live, if available) left meter `data-level` > right; click `ch-right` → left button released; complete the result flow by clicking answers → `ch-result[data-result="ok"]`, then a swapped combination → `swapped`, and a "both/both" combination → `mono`.
- **UI — tone generator:** set `tone-freq` to 1000, play, (live) `peakFrequency()` within ±2 bins of 1000; press ↑ → 1001; ×2 → 2002; waveform switch keeps playing; URL `?f=523.25&w=square` preloads those values; Space toggles play when card focused.
- **UI — exclusivity:** start tone generator, then start a channel test on the same page (headphone test page has multiple tools) → tone generator UI resets to idle (release event).
- **UI — Esc stops all:** play something, press Escape → nothing playing, "Stop all" hidden.
- **UI — master volume:** change slider → `engine.masterVolume` updates and persists after reload (`localStorage`).
- **UI — sweep:** start full sweep → `sweep-freq` readout increases over 1 s; mark low/high buttons record values.
- **UI — bass:** `bass-tone-40` toggles; kick plays/stops.
- **UI — surround:** shows `sur-max` = reported channel count; with 2 channels the 5.1/7.1 options are disabled and the explanation callout is visible. (Optionally mock `maxChannelCount` via `addInitScript` overriding `AudioDestinationNode.prototype` getter to 8 → options enabled and `sur-ch-3` plays.)
- **UI — water eject:** start → `we-progress[data-progress]` increases; stop works; mode switch works.
- **UI — dog whistle:** slider clamps to `engine.maxFrequency`; patterns selectable; play/stop.
- **UI — hearing range:** step-up starts at 8000 Hz; clicking `hr-stop` shows `hr-result` with `data-hz`.
- **UI — noise:** each colour plays; timer option selectable; stop works.
- **UI — latency test:** start, then simulate taps: read the component's scheduled beat times (expose them on the root element as `data-beats` JSON or via `window.soundTestHub.latencyDebug`) and dispatch `Space` keydown at beat + 150 ms (`page.waitForTimeout` timed with performance clock) for 16 taps → `lat-result[data-ms]` between 120 and 200 (generous due to timer jitter).
- **UI — theme:** toggle switches `data-theme`, persists on reload, no flash (theme attribute present before first paint — check `document.documentElement.dataset.theme` in `addInitScript`-free load).
- **UI — no Web Audio:** with `addInitScript` deleting `window.AudioContext` and `webkitAudioContext`, the tool card shows the unsupported message and no page error is thrown.
- **Screenshots (not asserted):** save full-page screenshots of home, left-right, tone generator, `/hz/440/` at 390×844 and 1440×900 into `test-results/screenshots/` for human review.

### 17.5 Manual QA checklist (owner, before launch — include in README)
Real devices: iPhone (Safari, silent switch ON and OFF), Android Chrome, Windows Chrome/Edge (wired + Bluetooth headphones, 5.1 HDMI receiver if available), macOS Safari/Chrome. Check: audio starts on first tap; left/right correct with headphones; volume slider works; no clicks/pops; water eject audible; latency test sensible wired vs Bluetooth.

---

## 18. Content writing rules

1. **Audience:** everyday US users fixing a problem *right now* (speaker not working, one earbud silent), plus hobbyists (home theatre, audio). Write in plain, friendly US English. Short paragraphs, scannable lists, tables where they help.
2. **Lead with the answer.** First sentence of each section/FAQ answers directly.
3. **Original and specific.** Real menu paths (Windows 11, macOS, iOS, Android), real causes, real fixes. No generic filler ("In today's digital world…", "Whether you're a … or a …", "Look no further"). No AI-sounding padding.
4. **Honest limits everywhere:** browsers cap frequency at about half the sample rate; phone speakers can't reproduce deep bass or ultrasound; Dolby Atmos/Apple Spatial Audio can't be triggered by a website; latency test includes human timing error; the high-frequency check is not a hearing test.
5. **No medical or health claims.** Never claim a sound heals, treats, relieves or improves anything (tinnitus, sleep, anxiety, Alzheimer's, focus). You may say "some people find X helpful for masking background noise" or "research on 40 Hz stimulation is ongoing" — nothing more. Never call any tool a "hearing test". Always suggest a professional (audiologist/doctor) for concerns.
6. **Safety copy:** start low volume; avoid prolonged loud tones; protect small speakers from loud bass; keep high tones quiet; kind treatment of pets.
7. **Numbers:** only well-established figures (440 Hz ISO 16, 60 Hz US mains, 44.1 kHz CD sample rate, 41.2 Hz low E, 15.734 kHz NTSC line rate). Ranges for devices/ages are labelled "typical" or "approximate".
8. **Trademarks:** use brand names only descriptively (iPhone, AirPods, Windows, Dolby Atmos). Footer disclaimer of non-affiliation. Don't name competitor websites.
9. **E-E-A-T signals:** About page; "Last updated"; practical, first-hand tone ("When you press Left…"); clear explanations of how each tool generates sound.
10. **Formatting:** sentence-case headings; numbers as numerals; units with a space ("440 Hz", "17.4 kHz"); en dash for ranges ("20 Hz–20 kHz").

---

## 19. Build milestones

Each milestone ends with a commit. From M3 on, `npm test` must pass before committing.

| # | Milestone | Deliverables | Acceptance |
|---|---|---|---|
| **M0** | Setup & environment checks | Scaffold project (versions §4.1), configs, scripts, `.env.example`, README skeleton, DECISIONS.md. Install Playwright test runner per environment. **Spike:** tiny page that creates an AudioContext on click and reads an analyser in headless Chromium — record whether live audio works | `npm run build` + `npm run check` pass; spike result recorded in DECISIONS.md |
| **M1** | Audio engine core + unit tests | `math.ts`, `noise.ts`, `scheduler.ts`, `latency.ts`, channel mapping, `engine.ts`, `voices.ts`, `unlock.ts`, `index.ts`; all unit tests in §17.2 | Unit tests green; offline engine e2e tests (§17.4 "Engine offline") green using a minimal test page |
| **M2** | Layout, design system, SEO base, ads | tokens/base/components CSS, BaseLayout, ToolLayout, Header (nav, menu), Footer, Breadcrumbs, ThemeToggle, GlobalAudioBar, Seo, JsonLd, Faq, RelatedTests, TestGrid, Callout, AdSlot, AdSenseScript, ads.txt & robots endpoints, registry, favicon, OG image + apple-touch-icon via `scripts/generate-images.mjs`, voice clips via `scripts/generate-voices.sh` | Site QA tests that apply to layout pass on a placeholder page |
| **M3** | Tool components | All components in §10 with `data-testid`s; `LevelMeters`, `Visualizer` | Component UI e2e tests green |
| **M4** | Launch pages (12) | Pages §11.1–11.12 with full content, FAQs, links, ads positions | Site QA (word counts, SEO, links, uniqueness) + page smoke e2e green |
| **M5** | Hz pages | `frequencies.ts` (18 entries, unique copy), `[freq].astro`, `/hz/` hub, DeviceTable | Site QA for Hz pages green (length, uniqueness, meta lengths) |
| **M6** | Phase-2 pages | Pink noise, noise generator, latency test pages | Their e2e + site QA green |
| **M7** | Legal & polish | About, Privacy, Terms, Contact, 404; `_headers`; final sitemap/robots/ads.txt; README complete | All site QA green |
| **M8** | Full QA | Full `npm test`; axe zero serious/critical; budgets met; screenshots reviewed by the agent (look at them and fix visual issues: overflow, overlapping, contrast, broken layout) | Everything green; summary written |
| **M9** | Handoff | Final report (§0.8), optional CI workflow (§16.5), push branch | Pushed; report delivered |

---

## 20. Definition of done

- [ ] All pages in §11–13 exist with the specified titles, metas, H1s, tools, content outlines, FAQs and word counts.
- [ ] All tool components work on desktop and mobile Chromium in e2e; audio correctness verified by offline signal tests (frequency, routing, polarity, surround channel, envelopes, sweep, noise colour, kick, limiter).
- [ ] `npm test` passes end to end (check → unit → build → site QA → e2e), with the output summary pasted in the final report.
- [ ] Zero console errors on every page; zero serious/critical axe violations; no horizontal scroll at 360 px.
- [ ] Budgets met (JS ≤ 35 KB gz/page, CSS ≤ 25 KB gz, HTML ≤ 60 KB).
- [ ] With AdSense env set: ≤ 4 ad units on tool pages, none on legal/404, ads.txt correct. Without: zero ad code.
- [ ] Sitemap, robots, canonical, OG, JSON-LD validated by tests.
- [ ] README (dev, test, deploy, env, manual QA checklist) and DECISIONS.md complete.
- [ ] No medical/health claims anywhere (grep for "heal", "cure", "treat", "therapy", "tinnitus relief", "hearing test" (except in negations/disclaimers) — add a site QA test that fails on these terms outside an allow-list of disclaimer sentences).

---

## 21. Post-launch checklist (for the human owner)

1. Register the domain (`soundtesthub.com` or alternative) and connect it to Cloudflare Pages.
2. Set env vars in the host (SITE_URL, contact email). Deploy.
3. Google Search Console: verify (meta tag env var or DNS), submit `sitemap-index.xml`, request indexing for home + 11 launch pages.
4. Apply for AdSense once the 12 launch pages + legal pages are live; after approval set `PUBLIC_ADSENSE_CLIENT` and the 4 slot IDs, enable the EEA/UK consent message and US state regulations, redeploy, confirm `ads.txt`.
5. Link building (competitors gained ~60 referring domains in 3 months — match that pace): tool directories; genuinely helpful answers in r/headphones, r/hometheater, r/techsupport, r/audiophile (follow each subreddit's self-promotion rules); open-source the audio engine on GitHub with a link back; a "Show HN"-style launch post focused on privacy and zero dependencies; outreach to tech blogs that write "how to test your speakers/headphones" guides.
6. Track rankings for ~20 keywords (home terms + each page's primary) in OpenSEO (project "Micro-Tools Niche Research", saved cluster `cluster-sound-test`, 69 keywords).
7. Month-3 checkpoint: target ≥ 5 sub-pages in top 10 and home on page 1. Review Search Console queries (especially "mosquito sound" intent) and expand content where impressions are high but CTR is low.
8. Phase 3 candidates if growth is good: pitch detector, dB meter (microphone), more Hz pages only where Search Console shows impressions.

---

## 22. Known gotchas

1. **Astro 7 needs Node ≥ 22.23.4** — older Node versions fail to install/build; set it on the host too.
2. **TypeScript 7 is incompatible with `@astrojs/check` 0.9.12** — use TypeScript 6.0.x.
3. **Headless Chromium audio:** a live `AudioContext` may or may not render without an output device. Verify in M0; offline-rendering tests are the reliable path.
4. **Playwright in Claude Code cloud containers:** browsers are pre-installed at `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH` preset, Playwright 1.63.0). Don't run `playwright install`; pin `@playwright/test@1.63.0` or set `executablePath`.
5. **iOS Safari:** audio only starts inside a user gesture; the hardware silent switch mutes Web Audio unless `navigator.audioSession.type = 'playback'` (newer iOS) or the silent `<audio>` unlock trick is used; contexts can become `'interrupted'` (calls, Siri) — handle resume.
6. **DynamicsCompressorNode downmixes to 2 channels** (`channelCountMode: 'clamped-max'`) — bypass it for surround.
7. **Multichannel output** requires `destination.channelCount = N`, `channelCountMode = 'explicit'`, `channelInterpretation = 'discrete'`, and N ≤ `maxChannelCount` (usually 2 on laptops/phones).
8. **Max frequency = sampleRate / 2.** 44.1 kHz devices cannot play above 22.05 kHz; leave headroom (UI max 22 kHz, clamp to `sampleRate/2 − 50`).
9. **`outputLatency`** is not available in every browser (e.g. Safari); `getOutputTimestamp()` support varies — always feature-detect.
10. **Looped noise buffers click at the loop point** unless crossfaded.
11. **Changing oscillator frequency abruptly causes zipper noise** — use `setTargetAtTime`.
12. **Exponential ramps cannot target 0** — ramp to 0.0001 then stop, or use `setTargetAtTime`.
13. **AdSense in dev:** never load the real script on localhost; placeholders only.
14. **Trailing slashes:** with `trailingSlash: 'always'`, all internal links must end with `/` (site QA test catches mistakes).
15. **Voice clips:** espeak-ng may need `apt-get update && apt-get install -y espeak-ng` (worked in the Claude Code cloud container on 2026-11-14; `ffmpeg` with `libmp3lame` was already present). If unavailable, use the tone-cue fallback (§9.8) and note it in DECISIONS.md; the owner can replace clips with recorded voice later (same filenames).

---

## Appendix A — Full keyword data

US, 2026-11-14. KD = keyword difficulty (0–100). "—" = no CPC data.

### A.1 Head / home terms
| Keyword | Volume | KD | CPC |
|---|---|---|---|
| sound test | 33,100 | 8 | $4.03 |
| audio test | 14,800 | 10 | $2.98 |
| sound check | 8,100 | 10 | $7.24 |
| speaker test | 8,100 | 14 | $1.29 |
| test speakers | 8,100 | 0 | $1.29 |
| speaker check | 260 | 0 | — |
| sound test hz | 260 | 38 | $3.97 |

### A.2 Channel / headphone / stereo / surround
| Keyword | Volume | KD | CPC |
|---|---|---|---|
| headphone test | 8,100 | 3 | $0.90 |
| left right audio test | 3,600 | 5 | $15.10 |
| left right speaker test | 2,400 | 8 | $5.49 |
| stereo test | 2,400 | 0 | $0.11 |
| stereo sound test | 2,400 | 0 | $0.11 |
| surround sound test | 1,600 | 9 | — |
| headphone test left right | 1,300 | 20 | — |
| left right test | 1,000 | 10 | — |
| dolby atmos test | 590 | 17 | $1.25 |
| spatial audio test | 590 | 0 | $4.89 |
| iphone speaker test | 590 | 20 | $1.53 |
| 5.1 surround sound test | 480 | 0 | $4.37 |
| earbuds test | 480 | 14 | — |
| speaker polarity test | 480 | 0 | $1.18 |
| 7.1 surround sound test | 320 | 2 | — |
| airpods test | 210 | 17 | — |
| speaker phase test | 210 | 0 | $0.78 |
| car speaker test | 110 | 0 | $1.16 |
| laptop speaker test | 110 | 0 | — |

### A.3 Bass / sweep / tones
| Keyword | Volume | KD | CPC |
|---|---|---|---|
| tone generator | 22,200 | 30 | $1.06 |
| online tone generator | 18,100 | 28 | $1.43 |
| frequency generator | 14,800 | 46 | $1.65 |
| bass test | 4,400 | 0 | $2.00 |
| hz generator | 3,600 | 30 | $2.65 |
| sine wave generator | 2,900 | 18 | $1.75 |
| sound frequency generator | 2,400 | 22 | $1.71 |
| low frequency sound | 1,300 | 5 | — |
| subwoofer test | 720 | 0 | $3.09 |
| test tone | 590 | 45 | $2.56 |
| frequency sweep | 480 | 8 | — |
| 1khz test tone | 390 | 0 | — |
| subwoofer test tone | 260 | — | $9.02 |
| 1 khz tone | 260 | 9 | — |
| speaker frequency test | 90 | 0 | $1.25 |
| frequency response test | 50 | 0 | $0.49 |

### A.4 Hz pages
| Keyword | Volume | KD | CPC |
|---|---|---|---|
| 60 hz | 3,600 | 13 | — |
| 440 hz | 2,900 | 4 | — |
| 40 hz | 2,400 | 0 | $1.24 |
| 100 hz | 1,000 | 0 | — |
| 1000 hz | 1,000 | 1 | $1.38 |
| 165 hz | 1,000 | 0 | $0.09 |
| 10000 hz | 880 | 0 | — |
| 200 hz | 880 | 0 | $0.24 |
| 20 hz | 720 | 0 | — |
| 20000 hz | 720 | 10 | — |
| 30 hz | 480 | 0 | — |
| 50 hz | 480 | 0 | — |
| 15000 hz | 390 | 0 | — |
| 80 hz | 320 | 0 | — |
| 8000 hz | 320 | 0 | — |
| 17000 hz | 260 | 0 | — |
| 150 hz | 210 | 0 | — |
| 12000 hz | 170 | 0 | — |
| *(excluded)* 432 hz | 27,100 | 4 | $0.18 |
| *(excluded)* 528 hz | 9,900 | 12 | $0.19 |
| *(excluded)* 963 hz | 8,100 | 0 | $1.57 |
| *(excluded)* 852 hz | 6,600 | 0 | $0.29 |

### A.5 Water eject / high frequency / dog / mosquito
| Keyword | Volume | KD | CPC |
|---|---|---|---|
| dog whistle | 60,500 | 24 | $0.72 |
| water eject | 18,100 | 11 | — |
| dog whistle sound | 18,100 | 3 | $1.27 |
| high pitch sound | 12,100 | 0 | — |
| fix my speakers | 9,900 | 24 | $1.60 |
| high frequency sound | 4,400 | 9 | — |
| water eject sound | 3,600 | 2 | $1.47 |
| speaker cleaner | 3,600 | 0 | $1.18 |
| mosquito sound | 2,900 | 8 | $3.10 |
| phone speaker cleaner | 1,600 | 4 | $1.06 |
| mosquito ringtone | 720 | 1 | — |
| clean speaker sound | 590 | 0 | $0.79 |
| dog whistle online | 480 | 5 | $1.44 |
| hearing range test | 260 | 36 | $4.11 |
| 17.4 khz | 50 | 3 | — |

### A.6 Noise / latency / phase 3
| Keyword | Volume | KD | CPC |
|---|---|---|---|
| brown noise | 90,500 | 8 | $0.47 |
| pink noise | 33,100 | 27 | $0.42 |
| pitch detector *(phase 3)* | 12,100 | 0 | $1.86 |
| white noise generator | 4,400 | 54 | $2.43 |
| db meter online *(phase 3)* | 2,900 | 11 | $1.68 |
| sound meter online *(phase 3)* | 2,900 | 18 | $1.66 |
| audio latency test | 1,000 | 5 | — |
| brown noise generator | 1,000 | 12 | $2.03 |
| noise generator | 1,000 | 33 | $2.85 |
| pink noise generator | 880 | 30 | $1.80 |
| audio sync test | 390 | 0 | — |
| lip sync test | 30 | 0 | — |
| bluetooth audio delay test | 20 | — | — |

### A.7 Excluded high-volume terms (for reference)
mic test 135,000 (KD 36) · guitar tuner 301,000 (KD 32) · white noise 246,000 (KD 39) · decibel meter 60,500 (KD 27) · binaural beats 40,500 (KD 53) · online metronome 33,100 (KD 37) · hearing test 27,100 (KD 52, $7.58) · online hearing test 12,100 (KD 54) · solfeggio frequencies 14,800 (KD 35).

---

## Appendix B — Competitor data

### B.1 Backlink profiles (referring domains, measured 2026-11-14)
| Domain | Referring domains | Notes |
|---|---|---|
| onlinemictest.com | ~2,930 | Generalist mic/webcam/sound site; #1 for "sound test", "audio test", "sound check" |
| webcammictest.com | ~1,844 (rank 45) | Generalist; #1 for "headphone test" in one read |
| audiocheck.net | ~1,951 (declining) | 2000s-era static site; strong on polarity and L/R tests |
| soundtest.io | 81 (from 16 in Aug 2026; backlink spam score 60) | Focused competitor, aggressive link building |
| audiotest.io | 7 (first links Oct 2026) | Ranks #5–6 for "audio test", "bass test" |

### B.2 SERP observations (desktop, US)
| Keyword | What ranks | Takeaway |
|---|---|---|
| sound test | onlinemictest #1, 7 of top 10 YouTube/Spotify, audiocheck, swanspeakers, audiotest.io, a pages.dev tool, sound-tester.com | Few real tools; win with depth |
| audio test | onlinemictest #1, swanspeakers, audiocheck, Spotify, audiotest.io, sound-tester.com, soundtest.io | Same pattern |
| sound check | onlinemictest #1, audiocheck #3, soundtest.io #6; rest unrelated (Wikipedia, concert gear, Reddit r/livesound) | Mixed intent; home page targets it secondarily |
| speaker test | Mostly videos/Spotify, a Reddit r/audioengineering thread, a few small tools | Very weak |
| left right audio test | xbitlabs, audiocheck, soundtest.io, soundforgepro (days old), webcammictest, realtimesoundmeter, sound-tester, hardwaretest.org | Crowded with weak tools — quality wins |
| headphone test | webcammictest, small tools (soundandgo, fastkeyboardcheck, keyboardtester.click), audiocheck, headphonetest.net (#5) | Weak |
| bass test | Mostly YouTube; audiocheck; audiotest.io | Interactive tool gap |
| tone generator | szynalski.com #1, onlinetonegenerator.com #2, hzgenerator.com, tonal.fm | Entrenched (KD 30) — stretch target |
| water eject | Apps (Play/App Store), several exact-match domains (watereject.com, waterejectapp.com, phonewatereject.com, water-eject.com), shortcutsgallery, a GitHub Pages tool | Moderate; cheap page, still worth it |
| dog whistle sound | Articles, YouTube, sound-effect download sites, one tool (tonal.fm), Wikipedia | Weak |
| 432 hz | Spotify, YouTube, wellness articles, PubMed | Listening intent — excluded |
| high pitch sound | Pixabay SFX, Facebook/Reddit "I hear a high-pitched sound" threads | Mixed intent — secondary keyword only |
| brown noise | Spotify, YouTube, Wikipedia, Cleveland Clinic, brownnoise.com | Listening intent — generator page only |
| pitch detector | Many small tools (neocities, GitHub Pages), onlinemictest #4, app stores | Phase 3 option |

---

## Appendix C — Voice clip generation script

`scripts/generate-voices.sh` (requires `espeak-ng` and `ffmpeg` with libmp3lame):
```bash
#!/usr/bin/env bash
set -euo pipefail
OUT="public/audio/voice"
mkdir -p "$OUT"
TMP="$(mktemp -d)"
declare -A CLIPS=(
  [left]="Left" [right]="Right" [both]="Both sides" [center]="Center"
  [front-left]="Front left" [front-right]="Front right" [subwoofer]="Subwoofer"
  [surround-left]="Surround left" [surround-right]="Surround right"
  [rear-left]="Rear left" [rear-right]="Rear right"
)
for id in "${!CLIPS[@]}"; do
  espeak-ng -v en-us -s 150 -p 45 -w "$TMP/$id.wav" "${CLIPS[$id]}"
  ffmpeg -loglevel error -y -i "$TMP/$id.wav" \
    -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5" \
    -ac 1 -ar 48000 -c:a libmp3lame -b:a 48k "$OUT/$id.mp3"
done
rm -rf "$TMP"
ls -la "$OUT"
```
Verified on 2026-11-14 in a Claude Code cloud container: `espeak-ng -v en-us -s 150 -w left.wav "Left"` → MP3 of ~5.4 KB, ~0.86 s. Commit the generated MP3s (they are small) so builds don't need espeak-ng.

---

## Appendix D — Reference algorithms

### D.1 Log frequency slider and perceptual volume
```ts
const F_MIN = 20, F_MAX = 20000;            // slider range; numeric input allows 1..maxFrequency
export const sliderToHz = (s: number) => F_MIN * Math.pow(F_MAX / F_MIN, s);           // s in [0,1]
export const hzToSlider = (f: number) => Math.log(f / F_MIN) / Math.log(F_MAX / F_MIN);
// Perceptual master volume: UI 0..1 → gain (x^2 curve is simple and monotonic)
export const uiToGain = (v: number) => v * v;
export const dbToGain = (db: number) => Math.pow(10, db / 20);
export const gainToDb = (g: number) => 20 * Math.log10(g);
```

### D.2 Frequency → note name
```ts
const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export function hzToNote(f: number, a4 = 440) {
  const n = 12 * Math.log2(f / a4) + 69;     // MIDI note number (float)
  const midi = Math.round(n);
  const cents = Math.round((n - midi) * 100);
  return { name: NAMES[(midi % 12 + 12) % 12] + (Math.floor(midi / 12) - 1), midi, cents };
}
```

### D.3 Sweep frequency at time t
```ts
// log (exponential) sweep, matches AudioParam.exponentialRampToValueAtTime
export const sweepLog = (f0: number, f1: number, T: number, t: number) => f0 * Math.pow(f1 / f0, Math.min(Math.max(t / T, 0), 1));
export const sweepLinear = (f0: number, f1: number, T: number, t: number) => f0 + (f1 - f0) * Math.min(Math.max(t / T, 0), 1);
```

### D.4 Kick drum synthesis (per hit at context time `t`)
```ts
osc.type = 'sine';
osc.frequency.setValueAtTime(150, t);
osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
gain.gain.setValueAtTime(0.0001, t);
gain.gain.exponentialRampToValueAtTime(1.0, t + 0.005);
gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
osc.start(t); osc.stop(t + 0.5);
```

### D.5 Noise generators (seeded, pure)
```ts
export function mulberry32(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function white(n: number, rnd = mulberry32(1)) { const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = rnd() * 2 - 1; return o; }
// Paul Kellet's refined pink noise filter
export function pink(n: number, rnd = mulberry32(2)) {
  const o = new Float32Array(n); let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < n; i++) { const w = rnd() * 2 - 1;
    b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759; b2 = 0.96900*b2 + w*0.1538520;
    b3 = 0.86650*b3 + w*0.3104856; b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
    o[i] = (b0+b1+b2+b3+b4+b5+b6 + w*0.5362) * 0.11; b6 = w*0.115926; }
  return o;
}
// Brown (red) noise: leaky integrator of white noise
export function brown(n: number, rnd = mulberry32(3)) {
  const o = new Float32Array(n); let last = 0;
  for (let i = 0; i < n; i++) { const w = rnd() * 2 - 1; last = (last + 0.02 * w) / 1.02; o[i] = last * 3.5; }
  return o;
}
// Loop crossfade: blend the last `xf` samples into the first `xf` samples with an equal-power curve, then drop the tail.
```
After generation, normalise each buffer to peak 0.9 and clamp to [-1, 1].

### D.6 Latency tap test
```text
1. On Start (user gesture): ensureRunning(); beatInterval = 0.6 s; firstBeat = ctx.currentTime + 1.0.
2. Scheduler schedules clicks at firstBeat + k*beatInterval (k = 0..23). For each scheduled click compute its
   expected performance-clock time WITHOUT latency compensation:
       perfAtSchedule = performance.now() + (clickTime - ctx.currentTime) * 1000
   (sample ctx.currentTime and performance.now() together at scheduling time).
3. Each tap (pointerdown on the tap target or Space keydown) records event.timeStamp (performance clock).
4. For each tap find the nearest expected beat time; offset = tapTime - beatTime (ms).
   Discard taps whose nearest beat index < 4 (warm-up) and |offset - median| > 250 ms (outliers).
5. When ≥ 16 taps have been recorded (≥ 12 valid after filtering), result = median(offsets),
   spread = median absolute deviation. Display result, spread and interpretation.
6. The result = output latency (+ device/Bluetooth delay) + the listener's small anticipation error.
   Comparing two runs (wired vs Bluetooth) cancels most of the human error → difference ≈ Bluetooth delay.
7. Also display ctx.baseLatency + ctx.outputLatency (seconds → ms) when available.
```

### D.7 Goertzel (for tests)
```ts
export function goertzelPower(x: Float32Array, sampleRate: number, f: number) {
  const k = Math.round((x.length * f) / sampleRate), w = (2 * Math.PI * k) / x.length, c = 2 * Math.cos(w);
  let s0 = 0, s1 = 0, s2 = 0;
  for (let i = 0; i < x.length; i++) { s0 = x[i] + c * s1 - s2; s2 = s1; s1 = s0; }
  return s1 * s1 + s2 * s2 - c * s1 * s2;
}
```

---

*End of specification.*
