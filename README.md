# Spectravia — website

Corporate website for [Spectravia](https://spectravia.net), built with **Nuxt 4** (SSR + prerendering), bilingual **English / Arabic (RTL)**, with a server-side contact form that forwards submissions by email over SMTP.

## Stack

| Concern | Choice |
|---|---|
| Framework | Nuxt 4 (Vue 3, Nitro node server) |
| Content | `@nuxt/content` v3 — YAML / Markdown files per locale |
| i18n | `@nuxtjs/i18n` — `en` default at `/`, Arabic at `/ar/...` |
| Styling | Plain modern CSS with design tokens and cascade layers (no framework) |
| Icons | `@nuxt/icon` + Lucide (bundled, no runtime CDN) |
| Fonts | `@nuxt/fonts` — Sora, IBM Plex Sans, IBM Plex Sans Arabic (self-hosted) |
| Email | `nodemailer` over SMTP |
| Validation | `zod` schema shared by client and server |

## Getting started

Requires **Node.js 22.21+ or 24 LTS** (Nuxt 4.6 requirement; the built-in `node:sqlite` is used by Nuxt Content).

```bash
npm install
cp .env.example .env    # fill in SMTP settings to test the contact form
npm run dev             # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `.output/` (prerenders all pages) |
| `npm run start` | Run the production build (`node .output/server/index.mjs`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` / `lint:fix` | ESLint (incl. stylistic rules) |
| `npm run typecheck` | Type-check app and server with `vue-tsc` |
| `npm run images [-- <folder>]` | Convert PNG/JPG under `public/images` to optimized WebP |

## Project structure

```
config/                 ← everything "parametric" (non-secret)
  site.config.ts          brand assets, contact details, navigation, footer, social links, form topics
  i18n.config.ts          locales (code, language, direction)
  taxonomy.config.ts      case-study tags and sectors (controlled vocabulary)
content/                ← all page copy, one folder per locale (mirrored)
  en/ | ar/
    pages/*.yml           structured copy for home, services, industries, partners, about, contact
    services/*.yml        service lines
    industries/*.yml      sectors
    team/*.yml            leadership team
    partners/*.md         partner pages (frontmatter + Markdown body)
    case-studies/*.md     case studies (structured frontmatter)
    docs/*.md             free-form pages (e.g. privacy) → served at /<file-name>
i18n/locales/           ← UI strings (navigation, buttons, form labels, errors)
app/
  assets/css/             tokens.css · reset · base · layout · components/* · utilities
  components/
    app/                  Header, Footer, BrandLogo, LangSwitcher
    ui/                   Button, SectionHeader, PageHero, RichText, CtaBanner (generic)
    blocks/               HomeHero, HeroPrism, cards, TeamMember, PartnerSolution, MediaEmbed, ContactForm
  composables/            useSite, useLocalizedContent, usePageSeo, useContactForm
  pages/                  routes (index, services, industries, partners/, about, contact, [...slug])
  plugins/reveal.ts       v-reveal scroll animation directive
shared/schemas/         ← contact form schema (used by both client and server)
server/
  api/contact.post.ts     contact form endpoint (validation, honeypot, rate limit, email)
  routes/sitemap.xml.ts   sitemap with hreflang alternates
  utils/                  mailer, rate limiter, email template
public/images/          ← brand, partner and team images
content.config.ts       ← content schemas (one collection per type per locale)
nuxt.config.ts
```

**Separation of concerns**

- **Copy** lives only in `content/`; **UI strings** only in `i18n/locales/`.
- **Styling** lives only in `app/assets/css/`. Vue components contain markup and logic, no `<style>` blocks. To restyle the site start from `tokens.css`.
- **Configuration** lives in `config/` (public) and environment variables (secrets).

## Editing content

- **Change text** — edit the YAML/Markdown file in `content/en/...` and its mirror in `content/ar/...`. Paragraphs in `text:` / `bio:` fields are separated by a blank line.
- **Add a team member** — add `content/<locale>/team/<name>.yml` (copy an existing one). Put a square photo in `public/images/team/` and set `photo: /images/team/<file>.webp`; leave it empty to show the initials placeholder.
- **Add a partner** — add `content/<locale>/partners/<slug>.md` and its images under `public/images/partners/<slug>/`. The page is served at `/partners/<slug>` automatically. Optionally add it to the footer in `config/site.config.ts` and to `partners:` lists in services/industries.
- **Add a case study** — add `content/<locale>/case-studies/<slug>.md` (copy an existing one) → `/case-studies/<slug>`. `sector` and `tags` must use the keys defined in `config/taxonomy.config.ts` (the build fails otherwise); add new keys there and their labels under `taxonomy` in `i18n/locales/*.json`. Set `featured: true` to show it on the home page and `partner: <slug>` to list it on that partner's page. Without a `cover` image, a branded icon cover (`icon:`) is shown.
- **Add an industry or service** — add a YAML file to `industries/` or `services/` (`order` controls sorting).
- **Add a simple page** (legal, etc.) — add `content/<locale>/docs/<name>.md` → `/<name>`.
- **Videos** — in a partner's `media:` list, switch an entry from `provider: placeholder` to `provider: vimeo` (`id: "<videoId>"` or `"<videoId>:<hash>"` for unlisted videos) or `provider: youtube` (`id: "<videoId>"`). Self-hosted files use `provider: file` with `src:`. Embeds only load when the visitor clicks play.
- **Images** — drop originals into `public/images/...` and run `npm run images` to generate `.webp` versions; reference the `.webp` in content.

If an Arabic file is missing, the English version is shown as a fallback.

## Adding a language

1. Add the locale to `config/i18n.config.ts` (`locales` and `contentLocales`).
2. Add `i18n/locales/<code>.json`.
3. Add `content/<code>/` mirroring `content/en/`.

## Configuration

Non-secret settings: `config/site.config.ts`.

Secrets and environment-specific values are environment variables (see `.env.example`):

| Variable | Purpose |
|---|---|
| `NUXT_MAIL_SMTP_HOST` / `_PORT` / `_SECURE` | SMTP server (465 + `true` for TLS, 587 + `false` for STARTTLS) |
| `NUXT_MAIL_SMTP_USER` / `_PASS` | Mailbox credentials |
| `NUXT_MAIL_FROM` | Sender name/address on notifications |
| `NUXT_MAIL_TO` | Recipient(s), comma-separated |
| `NUXT_MAIL_SUBJECT_PREFIX` | Subject prefix |
| `NUXT_CONTACT_RATE_LIMIT_MAX` / `_WINDOW_MINUTES` | Per-IP submission limit |
| `NUXT_PUBLIC_SITE_URL` | Canonical URL (SEO, sitemap) |
| `PORT` / `HOST` | Port and interface the Node server listens on |

## Deployment (Node.js hosting, no Docker)

1. Build (locally or on the server): `npm ci && npm run build`.
2. Upload / keep the **`.output/`** folder — it is self-contained (no `node_modules` required at runtime).
3. Configure the environment variables above in the hosting panel.
4. Start command / application startup file: **`node .output/server/index.mjs`** (in cPanel "Setup Node.js App", set the startup file to `.output/server/index.mjs`).
5. Point the domain to the app and enable HTTPS.

All pages are prerendered at build time and served as static HTML by the Node server; the server only does work for `/api/contact` (and any non-prerendered route). If running behind a reverse proxy, make sure it forwards `X-Forwarded-For` so rate limiting sees real client IPs.

## Content review notes

- Arabic copy is a **draft translation** (marked at the top of each file) and needs native-speaker review.
- The **privacy policy** is a draft and should be reviewed by legal counsel.
- Partner content was compiled from the partners' public websites and Fifth Ingenium's knowledge base; partner case-study figures are intentionally omitted until approved by the partners.
