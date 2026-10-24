<script setup lang="ts">
definePageMeta({ key: route => route.fullPath })

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { tagLabel, sectorLabel, sectorIndustry } = useTaxonomy()

const slug = String(route.params.slug)
const { data: item } = await useCaseStudy(slug)
const { data: cases } = await useCaseStudies()
const { data: partners } = await usePartners()

if (!item.value) throw createError({ statusCode: 404, statusMessage: 'Case study not found', fatal: true })

usePageSeo({
  title: () => item.value?.title,
  description: () => item.value?.description,
  image: () => item.value?.cover,
})

const partner = computed(() =>
  item.value?.partner ? partners.value?.find(p => p.path === `/partners/${item.value?.partner}`) : undefined,
)
const industry = computed(() => (item.value ? sectorIndustry(item.value.sector) : null))

/** Up to 3 other case studies, ranked by shared tags (same sector counts double). */
const related = computed(() => {
  const current = item.value
  if (!current) return []
  return (cases.value ?? [])
    .filter(c => c.path !== current.path)
    .map(c => ({
      c,
      score: (c.tags ?? []).filter(tg => current.tags?.includes(tg)).length + (c.sector === current.sector ? 2 : 0),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.c)
})
</script>

<template>
  <div v-if="item">
    <UiPageHero
      :eyebrow="sectorLabel(item.sector)"
      :title="item.title"
      :lead="item.summary"
      :breadcrumbs="[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.caseStudies'), to: '/case-studies' },
        { label: item.title },
      ]"
    >
      <ul
        v-if="item.tags?.length"
        class="tag-list case-hero__tags"
        role="list"
      >
        <li
          v-for="tag in item.tags"
          :key="tag"
        >
          <NuxtLink
            :to="{ path: localePath('/case-studies'), query: { tag } }"
            class="tag"
          >
            {{ tagLabel(tag) }}
          </NuxtLink>
        </li>
      </ul>
    </UiPageHero>

    <!-- Overview: cover + key facts -->
    <section class="section">
      <div class="container case-overview">
        <BlocksCaseCover
          :cover="item.cover"
          :icon="item.icon"
          :alt="item.title"
          large
        />
        <dl class="facts">
          <div class="facts__item">
            <dt>{{ t('caseStudies.client') }}</dt>
            <dd>
              {{ item.client }}
              <span class="facts__note">{{ t('caseStudies.ndaShort') }}</span>
            </dd>
          </div>
          <div class="facts__item">
            <dt>{{ t('caseStudies.sector') }}</dt>
            <dd>
              <NuxtLink
                v-if="industry"
                :to="localePath(`/industries#${industry}`)"
              >
                {{ sectorLabel(item.sector) }}
              </NuxtLink>
              <template v-else>
                {{ sectorLabel(item.sector) }}
              </template>
            </dd>
          </div>
          <div class="facts__item">
            <dt>{{ t('caseStudies.solution') }}</dt>
            <dd>{{ item.solution }}</dd>
          </div>
          <div
            v-if="item.region"
            class="facts__item"
          >
            <dt>{{ t('caseStudies.region') }}</dt>
            <dd>{{ item.region }}</dd>
          </div>
          <div
            v-if="item.period"
            class="facts__item"
          >
            <dt>{{ t('caseStudies.period') }}</dt>
            <dd>{{ item.period }}</dd>
          </div>
          <div class="facts__item">
            <dt>{{ t('caseStudies.deliveredBy') }}</dt>
            <dd v-if="partner">
              {{ t('caseStudies.withPartnerPrefix') }}
              <NuxtLink :to="localePath(partner.path)">
                {{ partner.name }}
              </NuxtLink>
            </dd>
            <dd v-else>
              {{ t('caseStudies.inHouse') }}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Results -->
    <section
      v-if="item.results?.length"
      class="section"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="t('caseStudies.resultsEyebrow')"
          :title="t('caseStudies.results')"
        />
        <div class="results">
          <div
            v-for="result in item.results"
            :key="result.label"
            v-reveal
            class="result"
          >
            <p
              class="result__value text-gradient"
              :class="{ 'result__value--text': result.value.length > 6 }"
              dir="auto"
            >
              {{ result.value }}
            </p>
            <p class="result__label">
              {{ result.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Challenge & approach -->
    <section class="section section--spaced">
      <div class="container split split--top">
        <div v-if="item.challenge?.length">
          <UiSectionHeader
            :eyebrow="t('caseStudies.challengeEyebrow')"
            :title="t('caseStudies.challenge')"
          />
          <ul class="feature-list">
            <li
              v-for="point in item.challenge"
              :key="point"
            >
              {{ point }}
            </li>
          </ul>
        </div>
        <div v-if="item.approach?.length">
          <UiSectionHeader
            :eyebrow="t('caseStudies.approachEyebrow')"
            :title="t('caseStudies.approach')"
          />
          <ol class="steps">
            <li
              v-for="step in item.approach"
              :key="step.title"
              v-reveal
              class="steps__item"
            >
              <h3 class="steps__title">
                {{ step.title }}
              </h3>
              <p class="steps__text">
                {{ step.text }}
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- Insight -->
    <section
      v-if="item.insight"
      class="section"
    >
      <div class="container">
        <blockquote
          v-reveal
          class="statement"
        >
          {{ item.insight }}
        </blockquote>
      </div>
    </section>

    <!-- Optional long-form body -->
    <section
      v-if="item.body?.value?.length"
      class="section"
    >
      <div class="container container--narrow">
        <ContentRenderer
          :value="item"
          class="prose"
        />
      </div>
    </section>

    <!-- Gallery -->
    <section
      v-if="item.gallery?.length"
      class="section"
    >
      <div class="container grid grid--2">
        <figure
          v-for="image in item.gallery"
          :key="image.src"
          class="media-embed"
        >
          <div class="media-embed__frame">
            <img
              :src="image.src"
              :alt="image.caption ?? item.title"
              loading="lazy"
            >
          </div>
          <figcaption
            v-if="image.caption"
            class="media-embed__caption"
          >
            {{ image.caption }}
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Related -->
    <section
      v-if="related.length"
      class="section section--spaced"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="t('caseStudies.relatedEyebrow')"
          :title="t('caseStudies.related')"
        />
        <div class="grid grid--3">
          <BlocksCaseStudyCard
            v-for="other in related"
            :key="other.path"
            :item="other"
          />
        </div>
      </div>
    </section>

    <UiCtaBanner
      :title="t('caseStudies.ctaTitle')"
      :text="t('caseStudies.ctaText')"
    />
  </div>
</template>
