/**
 * Locale-aware content queries.
 *
 * Collections are defined per locale (`team_en`, `team_ar`, ...). These
 * helpers resolve the right collection for the active locale and fall back
 * to the default locale when a translation does not exist yet.
 */
import type { Collections } from '@nuxt/content'
import { contentLocales, defaultLocale } from '../../config/i18n.config'
import type { ContentLocale } from '../../config/i18n.config'

export type CollectionBase = 'pages' | 'services' | 'industries' | 'team' | 'partners' | 'cases' | 'docs'
export type CollectionItem<N extends CollectionBase> = Collections[`${N}_en`]

/** Resolve the collection name for a locale (schemas are identical across locales). */
export function localizedCollection<N extends CollectionBase>(name: N, locale: ContentLocale) {
  return `${name}_${locale}` as `${N}_en`
}

function toContentLocale(locale: string): ContentLocale {
  return (contentLocales as readonly string[]).includes(locale) ? locale as ContentLocale : defaultLocale
}

const isEmpty = (value: unknown) => value == null || (Array.isArray(value) && value.length === 0)

/**
 * `useAsyncData` wrapper that re-runs on locale change and falls back to the
 * default locale when the localized result is empty.
 */
export function useLocalizedAsyncData<T>(key: string, handler: (locale: ContentLocale) => Promise<T>) {
  const { locale } = useI18n()

  return useAsyncData(
    () => `${key}:${locale.value}`,
    async () => {
      const current = toContentLocale(locale.value)
      const result = await handler(current)
      if (isEmpty(result) && current !== defaultLocale) return handler(defaultLocale)
      return result
    },
  )
}

/* ---------- collection-specific helpers ---------- */

export function usePageContent(slug: string) {
  return useLocalizedAsyncData(`page:${slug}`, locale =>
    queryCollection(localizedCollection('pages', locale))
      .where('stem', '=', `${locale}/pages/${slug}`)
      .first(),
  )
}

export function useServices() {
  return useLocalizedAsyncData('services', locale =>
    queryCollection(localizedCollection('services', locale)).order('order', 'ASC').all(),
  )
}

export function useIndustries() {
  return useLocalizedAsyncData('industries', locale =>
    queryCollection(localizedCollection('industries', locale)).order('order', 'ASC').all(),
  )
}

export function useTeam() {
  return useLocalizedAsyncData('team', locale =>
    queryCollection(localizedCollection('team', locale)).order('order', 'ASC').all(),
  )
}

export function usePartners() {
  return useLocalizedAsyncData('partners', locale =>
    queryCollection(localizedCollection('partners', locale)).order('order', 'ASC').all(),
  )
}

export function usePartner(slug: string) {
  return useLocalizedAsyncData(`partner:${slug}`, locale =>
    queryCollection(localizedCollection('partners', locale)).path(`/partners/${slug}`).first(),
  )
}

export function useCaseStudies() {
  return useLocalizedAsyncData('cases', locale =>
    queryCollection(localizedCollection('cases', locale)).order('order', 'ASC').all(),
  )
}

export function useCaseStudy(slug: string) {
  return useLocalizedAsyncData(`case:${slug}`, locale =>
    queryCollection(localizedCollection('cases', locale)).path(`/case-studies/${slug}`).first(),
  )
}

export function useDoc(path: string) {
  return useLocalizedAsyncData(`doc:${path}`, locale =>
    queryCollection(localizedCollection('docs', locale)).path(path).first(),
  )
}
