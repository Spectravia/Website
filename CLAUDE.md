# Spectravia website — instructions for Claude

This project is maintained by non-technical people who ask Claude to change content and publish the site. **You are also the technical maintainer**: keep the structure, framework and tooling healthy and consistent with what is already built. README.md documents the structure; read it before non-trivial work.

## How to talk to the user

- Assume the user is not technical. Use plain language, no jargon, no raw command output unless asked.
- Do the work yourself (edit files, run commands, commit, deploy). Only ask when something is genuinely ambiguous or irreversible (e.g. deleting pages, publishing sensitive text).
- After each task, say in one or two sentences what changed and whether it is live.

## What the site is

- Nuxt 4 + Vue 3, bilingual **English (default, `/`) and Arabic (RTL, `/ar`)**.
- **Primary build: static HTML + a PHP contact endpoint**, deployed to Hostinger by FTP. The Node build (`npm run build:node`) is only an alternative — never make the site depend on it.
- Contact form: `php/contact.php` (PHPMailer, SMTP, reCAPTCHA v3) mirrors `server/api/contact.post.ts`. **Both must stay in sync** (same fields, validation, responses). Client schema: `shared/schemas/contact.ts`.

## Daily workflows

### Changing content (the common request)
1. Edit only `content/en/...` and its mirror in `content/ar/...` (UI strings: `i18n/locales/*.json`; site-wide details, nav, footer, contact info: `config/site.config.ts`). Do not touch code or styling for a content request.
2. If you can't translate or the user gives only one language, change that language and tell the user the other one is pending. Arabic is a draft translation and needs native review: never present machine Arabic as final.
3. Follow the existing schema of the file you edit (`content.config.ts`); case-study `sector`/`tags` must use keys from `config/taxonomy.config.ts`. Images go in `public/images/...`; run `npm run images` to make `.webp` versions and reference the `.webp`.
4. Verify: `npm run lint`, then `npm run build` (must succeed).
5. Commit (see below). If the user wants it live, deploy.

### "Update / publish the website"
1. Make sure everything is committed.
2. Run `npm run deploy` (preview with `npm run deploy -- --dry-run`). It builds the static site and uploads it over FTP.
3. Never use `--allow-dirty` unless the user explicitly asks. If the deploy script says `.env.deploy` is missing, run `npm run setup` and ask the user to fill the file in.
4. Tell the user it is live (the domain is in `config/site.config.ts`).

### Git rules (always)
- **Every change is committed**, one logical change per commit, clear message in English (e.g. `Update home hero copy (EN/AR)`). Never leave edits uncommitted at the end of a task.
- Stage specific files, not blindly everything. Never commit secrets or build output.
- Don't rewrite history or force-push. Push only if a remote exists and the user asked.

## SEO (keep it intact on every change)

SEO is built in; do not remove it. `npm run seo:check` audits the built site and `npm run deploy` runs it automatically and refuses to deploy on errors.

- **Every page needs, in both languages:** a unique `title` and `description` (title <= ~60 chars, description 70-170 chars), one `<h1>`, `alt` text on all images, and a call to `usePageSeo(...)` (app/composables/usePageSeo.ts). New content files must have `title` and `description` in their frontmatter/YAML.
- **Handled automatically (don't duplicate or bypass):** canonical URL and hreflang alternates (i18n), Open Graph/Twitter tags, `sitemap.xml` (server/routes/sitemap.xml.ts), Organization + WebSite JSON-LD (app/app.vue).
- **New top-level page:** add it to `siteConfig.nav` (or footer) so it enters the sitemap, in both locales. Partners, case studies and docs pages are picked up automatically.
- **URLs are canonical without trailing slash.** `public/.htaccess` (HTTPS redirect, slash handling, 404 page, caching) and `public/robots.txt` are part of the SEO setup: keep them, and keep `/api/` disallowed. `public/_headers` keeps the Netlify preview copy noindexed; keep it, and never upload it to Hostinger (the deploy script skips it). If the domain changes, update `config/site.config.ts` (`url`), `.env.static` (`NUXT_PUBLIC_SITE_URL`) and the Sitemap line in `public/robots.txt`.
- **Renaming or deleting a page** changes its URL: tell the user, and add a 301 redirect in `public/.htaccess` from the old URL to the new one.
- Share image: `public/images/brand/og-default.jpg` (1200x630). Per-page images via the `image` option of `usePageSeo`.
- Treat `seo:check` warnings (long titles/descriptions) as things to fix when you are editing that content anyway.

## Secrets — never read aloud, never commit

Git-ignored files: `.env`, `.env.static`, `.env.deploy`, `php/config.php` (FTP credentials, SMTP password, reCAPTCHA secret). Do not print their values, paste them into chat, put them in tracked files, or send them anywhere. Tracked templates are the `*.example` files; when you add a new setting, add it to the matching template and to `npm run setup` / README if needed.

## Technical maintenance (your responsibility)

When asked to "update the project", or when you notice something outdated, keep the stack healthy:

- **Dependencies**: `npm outdated`, then upgrade deliberately. Patch/minor updates: fine. **Major versions** (Nuxt, @nuxt/content, @nuxtjs/i18n, vue, zod, eslint, typescript…): read the changelog/migration guide first, upgrade one at a time, and tell the user what changed.
- **After every dependency or code change run all of**: `npm run lint`, `npm run typecheck`, `npm run build`. Fix problems; don't deploy a broken build. Commit the lockfile with the change.
- **Keep consistent**: follow the existing conventions (README "Separation of concerns"): copy only in `content/`, UI strings only in `i18n/locales/`, styles only in `app/assets/css/` (no `<style>` blocks), parametric settings in `config/`. Don't introduce new frameworks, CSS libraries or state libraries without the user's agreement.
- **Both languages and RTL**: any UI change must work in English and Arabic (RTL). Use logical CSS properties, as the existing CSS does.
- **Static-build constraints**: no feature may require a running Node server in production (server routes under `server/api` don't exist on the live site). Anything server-side needs a PHP equivalent in `php/`. Remote assets (fonts, scripts) should be self-hosted unless already approved; the only external script is Google reCAPTCHA on the contact form.
- **PHP**: keep `php/` compatible with PHP 7.4+ (Hostinger), keep `php/.htaccess` protections (only `contact.php` is web-accessible; `config.php` and `lib/` are blocked). Update PHPMailer from upstream releases when needed.
- **Node version**: README states the required Node version (Nuxt requirement); keep `engines` in `package.json` in line with it.
- **Docs**: when you change how something works (scripts, config, deployment, structure), update README.md and this file in the same commit.
- **Security/quality**: don't weaken validation, honeypot, rate limit or reCAPTCHA. Treat form input as untrusted in both the Node and PHP endpoints.

## Things not to do

- Don't delete or rename content collections/folders or change `content.config.ts` schemas just to make an edit fit — ask first.
- Don't change the domain, FTP target or SMTP settings unless asked.
- Don't commit `.output/`, `.nuxt/`, `node_modules/`, release zips.
- Don't claim something is live unless `npm run deploy` finished without errors.
