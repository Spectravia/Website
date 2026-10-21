/**
 * SEO audit of the built static site (.output/public).   npm run seo:check
 *
 * Errors (exit 1, block `npm run deploy`): missing/duplicate title or description,
 * missing canonical / H1 / hreflang / og:image / structured data, images without
 * alt, pages missing from the sitemap or sitemap URLs without a page.
 * Warnings: titles > 65 or descriptions outside 70-170 characters.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

const dir = resolve(import.meta.dirname, '..', '.output', 'public')
if (!existsSync(join(dir, 'index.html'))) {
  console.error('ERROR: .output/public not found. Run "npm run build" first.')
  process.exit(1)
}

const walk = d => readdirSync(d).flatMap((n) => {
  const f = join(d, n)
  return statSync(f).isDirectory() ? walk(f) : [f]
})
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const pick = (html, re) => decode((html.match(re) || [])[1] ?? '').trim()

const errors = []
const warnings = []
const titles = new Map()
const descriptions = new Map()
const pagePaths = new Set()

const pages = walk(dir).filter(f => f.endsWith('index.html'))
const siteUrl = pick(readFileSync(join(dir, 'index.html'), 'utf8'), /rel="canonical" href="(https?:\/\/[^/"]+)/)

for (const file of pages) {
  const url = '/' + relative(dir, file).split(sep).join('/').replace(/index\.html$/, '').replace(/\/$/, '')
  const html = readFileSync(file, 'utf8')
  pagePaths.add(url)
  const err = msg => errors.push(`${url}: ${msg}`)
  const warn = msg => warnings.push(`${url}: ${msg}`)

  const title = pick(html, /<title>([\s\S]*?)<\/title>/)
  const desc = pick(html, /<meta name="description" content="([^"]*)"/)
  if (!title) err('missing <title>')
  if (!desc) err('missing meta description')
  // duplicates are only a problem within the same language
  const lang = pick(html, /<html[^>]*\slang="([^"]+)"/)
  if (title) titles.set(`${lang}|${title}`, [...(titles.get(`${lang}|${title}`) ?? []), url])
  if (desc) descriptions.set(`${lang}|${desc}`, [...(descriptions.get(`${lang}|${desc}`) ?? []), url])
  if (title.length > 65) warn(`title is ${title.length} chars (aim for <= 65): "${title}"`)
  if (desc && (desc.length < 70 || desc.length > 170)) warn(`description is ${desc.length} chars (aim for 70-170)`)

  const canonical = pick(html, /rel="canonical" href="([^"]*)"/)
  if (!canonical) err('missing canonical')
  else if (canonical !== `${siteUrl}${url === '/' ? '' : url}`) err(`canonical "${canonical}" does not match the page URL`)
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) err('page must have exactly one <h1>')
  if (!/hreflang="en/.test(html) || !/hreflang="ar/.test(html)) err('missing hreflang alternates (en + ar)')
  if (!/property="og:image"/.test(html)) err('missing og:image')
  if (!/<html[^>]*\blang="[^"]+"/.test(html)) err('missing <html lang>')
  if (!/application\/ld\+json/.test(html)) err('missing structured data (JSON-LD)')
  const noAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/g) ?? []).length
  if (noAlt) err(`${noAlt} image(s) without alt text`)
}

for (const [label, map] of [['title', titles], ['description', descriptions]]) {
  for (const [text, where] of map) {
    if (where.length > 1) errors.push(`duplicate ${label} on ${where.join(', ')}: "${text.split('|')[1].slice(0, 70)}"`)
  }
}

// sitemap <-> pages
const sitemapFile = join(dir, 'sitemap.xml')
if (!existsSync(sitemapFile)) errors.push('sitemap.xml missing')
else {
  const locs = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1].replace(siteUrl, '') || '/')
  for (const p of pagePaths) if (!locs.includes(p)) errors.push(`${p}: page is not in sitemap.xml`)
  for (const l of locs) if (!pagePaths.has(l)) errors.push(`sitemap.xml lists ${l} but no such page was built`)
}
if (!existsSync(join(dir, 'robots.txt'))) errors.push('robots.txt missing')
if (!existsSync(join(dir, '.htaccess'))) errors.push('.htaccess missing (redirects, 404, caching)')

console.log(`SEO check: ${pages.length} pages`)
for (const w of warnings) console.log(`  warning  ${w}`)
for (const e of errors) console.log(`  ERROR    ${e}`)
console.log(errors.length ? `\n${errors.length} error(s).` : `\nNo errors${warnings.length ? `, ${warnings.length} warning(s)` : ''}.`)
process.exit(errors.length ? 1 : 0)
