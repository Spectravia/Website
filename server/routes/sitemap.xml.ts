/**
 * GET /sitemap.xml — built from the site navigation and content collections,
 * with hreflang alternates for every locale. Prerendered at build time.
 */
import { queryCollection } from '@nuxt/content/server'
import { siteConfig } from '../../config/site.config'
import { defaultLocale, locales } from '../../config/i18n.config'

const localized = (path: string, code: string) =>
  code === defaultLocale ? path : `/${code}${path === '/' ? '' : path}`

export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig(event)

  const [partners, cases, docs] = await Promise.all([
    queryCollection(event, 'partners_en').select('path').all(),
    queryCollection(event, 'cases_en').select('path').all(),
    queryCollection(event, 'docs_en').select('path').all(),
  ])

  const paths = [
    ...siteConfig.nav.map(item => item.to),
    siteConfig.headerCta.to,
    ...partners.map(p => p.path),
    ...cases.map(c => c.path),
    ...docs.map(d => d.path),
  ]

  const urls = [...new Set(paths)].flatMap(path =>
    locales.map((locale) => {
      const alternates = locales
        .map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.language}" href="${siteUrl}${localized(path, alt.code)}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${localized(path, defaultLocale)}"/>`)
        .join('\n')
      return `  <url>\n    <loc>${siteUrl}${localized(path, locale.code)}</loc>\n${alternates}\n  </url>`
    }),
  )

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`
})
