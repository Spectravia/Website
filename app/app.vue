<script setup lang="ts">
const site = useSite()
const head = useLocaleHead({ dir: true, lang: true, seo: true })

useHead({
  titleTemplate: title => (title ? `${title} · ${site.name}` : site.name),
  htmlAttrs: {
    lang: () => head.value.htmlAttrs?.lang,
    dir: () => head.value.htmlAttrs?.dir,
  },
  link: () => head.value.link ?? [],
  meta: () => head.value.meta ?? [],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
