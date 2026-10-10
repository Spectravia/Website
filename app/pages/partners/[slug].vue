<script setup lang="ts">
definePageMeta({ key: route => route.fullPath })

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const slug = String(route.params.slug)
const { data: partner } = await usePartner(slug)
const { data: industries } = await useIndustries()

if (!partner.value) throw createError({ statusCode: 404, statusMessage: 'Partner not found', fatal: true })

usePageSeo({
  title: () => partner.value?.name,
  description: () => partner.value?.summary,
})

const partnerIndustries = computed(() =>
  (industries.value ?? []).filter(i => partner.value?.industries?.includes(i.slug)),
)
</script>

<template>
  <div v-if="partner">
    <UiPageHero
      :eyebrow="t('partners.eyebrow')"
      :title="partner.name"
      :lead="partner.tagline"
      :breadcrumbs="[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.partners'), to: '/partners' },
        { label: partner.name },
      ]"
    />

    <!-- Overview -->
    <section class="section">
      <div class="container partner-hero">
        <div>
          <ContentRenderer
            :value="partner"
            class="prose"
          />
          <div class="cluster partner-hero__meta">
            <UiButton
              :href="partner.website"
              icon="lucide:external-link"
            >
              {{ t('partners.visitWebsite') }}
            </UiButton>
            <UiButton
              to="/contact"
              variant="primary"
              icon="lucide:arrow-right"
            >
              {{ t('partners.talkToUs') }}
            </UiButton>
          </div>
        </div>
        <div class="stack">
          <div
            class="logo-tile logo-tile--lg"
            :class="{ 'logo-tile--light': partner.logoOnLight }"
          >
            <img
              :src="partner.logo"
              :alt="partner.name"
              width="320"
              height="110"
            >
          </div>
          <ul
            v-if="partnerIndustries.length"
            class="tag-list"
            role="list"
          >
            <li
              v-for="industry in partnerIndustries"
              :key="industry.slug"
            >
              <NuxtLink
                :to="localePath(`/industries#${industry.slug}`)"
                class="tag"
              >
                <Icon
                  :name="industry.icon"
                  aria-hidden="true"
                />
                {{ industry.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Highlights -->
    <section
      v-if="partner.highlights?.length"
      class="section"
    >
      <div class="container">
        <div class="statement stats">
          <div
            v-for="item in partner.highlights"
            :key="item.label"
          >
            <p class="stat__value text-gradient">
              {{ item.value }}
            </p>
            <p class="stat__label">
              {{ item.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Solutions -->
    <section
      v-if="partner.solutions?.length"
      class="section section--spaced"
    >
      <div class="container stack">
        <UiSectionHeader
          :eyebrow="t('partners.solutionsEyebrow')"
          :title="t('partners.solutionsTitle', { name: partner.name })"
        />
        <BlocksPartnerSolution
          v-for="solution in partner.solutions"
          :key="solution.name"
          :solution="solution"
        />
      </div>
    </section>

    <!-- Media -->
    <section
      v-if="partner.media?.length"
      class="section"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="t('partners.mediaEyebrow')"
          :title="t('partners.mediaTitle')"
        />
        <div class="grid grid--2">
          <BlocksMediaEmbed
            v-for="item in partner.media"
            :key="item.title"
            :media="item"
          />
        </div>
      </div>
    </section>

    <UiCtaBanner
      :title="t('partners.ctaTitle', { name: partner.name })"
      :text="t('partners.ctaText', { name: partner.name })"
    />
  </div>
</template>
