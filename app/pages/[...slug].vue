<script setup lang="ts">
definePageMeta({ key: route => route.fullPath })

/**
 * Catch-all for free-form Markdown pages in `content/<locale>/docs/`.
 * e.g. content/en/docs/privacy.md → /privacy and /ar/privacy
 */
const route = useRoute()
const { t, locale } = useI18n()

const slug = ([] as string[]).concat(route.params.slug ?? []).join('/')
const { data: doc } = await useDoc(`/${slug}`)

if (!doc.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => doc.value?.title, description: () => doc.value?.description })

const updated = computed(() =>
  doc.value?.updated
    ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(new Date(doc.value.updated))
    : null,
)
</script>

<template>
  <div v-if="doc">
    <UiPageHero
      :title="doc.title"
      :lead="doc.description"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: doc.title }]"
    >
      <p
        v-if="updated"
        class="text-muted"
      >
        {{ t('docs.updated', { date: updated }) }}
      </p>
    </UiPageHero>
    <section class="section">
      <div class="container container--narrow">
        <ContentRenderer
          :value="doc"
          class="prose"
        />
      </div>
    </section>
  </div>
</template>
