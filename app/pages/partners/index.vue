<script setup lang="ts">
const { t } = useI18n()
const { data: page } = await usePageContent('partners')
const { data: partners } = await usePartners()

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => page.value?.title, description: () => page.value?.description })

const intro = computed(() => findSection(page.value, 'intro'))
</script>

<template>
  <div v-if="page">
    <UiPageHero
      :eyebrow="page.hero.eyebrow"
      :title="page.hero.title"
      :lead="page.hero.lead"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: t('nav.partners') }]"
    />

    <section
      v-if="intro"
      class="section"
    >
      <div class="container split split--wide-start split--top">
        <UiSectionHeader
          :eyebrow="intro.eyebrow"
          :title="intro.title"
        />
        <UiRichText
          :text="intro.text"
          large
        />
      </div>
    </section>

    <section class="section">
      <div class="container grid grid--2">
        <BlocksPartnerCard
          v-for="(partner, i) in partners"
          :key="partner.path"
          v-reveal="(i % 2) * 100"
          :partner="partner"
        />
      </div>
    </section>

    <UiCtaBanner />
  </div>
</template>
