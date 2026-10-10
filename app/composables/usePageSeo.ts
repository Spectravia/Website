/**
 * Per-page SEO: title, description and Open Graph / Twitter tags.
 * Locale alternates (hreflang), `lang` and `dir` are handled in app.vue.
 */
interface PageSeoInput {
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
}

export function usePageSeo(input: PageSeoInput) {
  const site = useSite()
  const { public: { siteUrl } } = useRuntimeConfig()

  const title = computed(() => toValue(input.title))
  const description = computed(() => toValue(input.description))
  const image = computed(() => `${siteUrl}${toValue(input.image) ?? site.brand.ogImage}`)

  useSeoMeta({
    title,
    description,
    ogTitle: () => title.value ? `${title.value} · ${site.name}` : site.name,
    ogDescription: description,
    ogImage: image,
    ogType: 'website',
    ogSiteName: site.name,
    twitterCard: 'summary_large_image',
  })
}
