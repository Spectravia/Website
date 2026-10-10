<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { data: page } = await usePageContent('industries')
const { data: industries } = await useIndustries()
const { data: partners } = await usePartners()

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => page.value?.title, description: () => page.value?.description })

const partnersOf = (slugs: string[]) =>
  (partners.value ?? []).filter(p => slugs.some(slug => p.path === `/partners/${slug}`))
</script>

<template>
  <div v-if="page">
    <UiPageHero
      :eyebrow="page.hero.eyebrow"
      :title="page.hero.title"
      :lead="page.hero.lead"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: t('nav.industries') }]"
    />

    <section
      v-for="industry in industries"
      :id="industry.slug"
      :key="industry.slug"
      class="section"
    >
      <div class="container">
        <article
          v-reveal
          class="solution"
        >
          <div>
            <span class="card__icon">
              <Icon
                :name="industry.icon"
                aria-hidden="true"
              />
            </span>
            <h2 class="solution__title solution__title--spaced">
              {{ industry.title }}
            </h2>
            <p class="section__lead">
              {{ industry.summary }}
            </p>
            <div
              v-if="industry.partners?.length"
              class="solution__actions"
            >
              <p class="eyebrow">
                {{ t('industries.partners') }}
              </p>
              <ul
                class="tag-list"
                role="list"
              >
                <li
                  v-for="partner in partnersOf(industry.partners ?? [])"
                  :key="partner.path"
                >
                  <NuxtLink
                    :to="localePath(partner.path)"
                    class="tag"
                  >
                    {{ partner.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
          <div class="stack">
            <template v-if="industry.challenges?.length">
              <h3 class="eyebrow">
                {{ t('industries.challenges') }}
              </h3>
              <ul class="feature-list">
                <li
                  v-for="item in industry.challenges"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
            </template>
            <template v-if="industry.solutions?.length">
              <h3 class="eyebrow solution__features">
                {{ t('industries.solutions') }}
              </h3>
              <ul class="feature-list">
                <li
                  v-for="item in industry.solutions"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
            </template>
          </div>
        </article>
      </div>
    </section>

    <UiCtaBanner />
  </div>
</template>
