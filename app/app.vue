<script setup lang="ts">
const site = useSite()
const head = useLocaleHead({ dir: true, lang: true, seo: true })
const { public: { siteUrl } } = useRuntimeConfig()

// Structured data (Organization + WebSite) for search engines, on every page.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      'name': site.name,
      'url': siteUrl,
      'logo': `${siteUrl}${site.brand.mark}`,
      ...(site.social.length ? { sameAs: site.social.map(s => s.href) } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      'url': siteUrl,
      'name': site.name,
      'publisher': { '@id': `${siteUrl}/#organization` },
      'inLanguage': ['en', 'ar'],
    },
  ],
}

useHead({
  titleTemplate: title => (title ? `${title} · ${site.name}` : site.name),
  htmlAttrs: {
    lang: () => head.value.htmlAttrs?.lang,
    dir: () => head.value.htmlAttrs?.dir,
  },
  link: () => head.value.link ?? [],
  meta: () => head.value.meta ?? [],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(structuredData) }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
