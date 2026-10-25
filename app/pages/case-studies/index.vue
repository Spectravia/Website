<script setup lang="ts">
import type { CaseStudySector, CaseStudyTag } from '../../../config/taxonomy.config'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { tags, sectors, tagLabel, sectorLabel } = useTaxonomy()

const { data: page } = await usePageContent('case-studies')
const { data: cases } = await useCaseStudies()

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => page.value?.title, description: () => page.value?.description })

/* Filters live in the query string (?sector=energy&tag=ai) so views are shareable. */
const activeSector = computed(() => (route.query.sector as CaseStudySector | undefined) ?? null)
const activeTag = computed(() => (route.query.tag as CaseStudyTag | undefined) ?? null)

function setFilter(name: 'sector' | 'tag', value: string | null) {
  const query = { ...route.query, [name]: value ?? undefined }
  router.replace({ query })
}

/** Only offer filters that match at least one case study. */
const usedSectors = computed(() => sectors.filter(s => cases.value?.some(c => c.sector === s.key)))
const usedTags = computed(() => tags.filter(tg => cases.value?.some(c => c.tags?.includes(tg.key))))

const filtered = computed(() =>
  (cases.value ?? []).filter(c =>
    (!activeSector.value || c.sector === activeSector.value)
    && (!activeTag.value || c.tags?.includes(activeTag.value)),
  ),
)
</script>

<template>
  <div v-if="page">
    <UiPageHero
      :eyebrow="page.hero.eyebrow"
      :title="page.hero.title"
      :lead="page.hero.lead"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: t('nav.caseStudies') }]"
    />

    <section class="section">
      <div class="container">
        <div
          class="filters"
          role="group"
          :aria-label="t('caseStudies.filters')"
        >
          <div class="filters__row">
            <span class="filters__label">{{ t('caseStudies.sector') }}</span>
            <button
              type="button"
              class="chip"
              :aria-pressed="!activeSector"
              @click="setFilter('sector', null)"
            >
              {{ t('caseStudies.all') }}
            </button>
            <button
              v-for="sector in usedSectors"
              :key="sector.key"
              type="button"
              class="chip"
              :aria-pressed="activeSector === sector.key"
              @click="setFilter('sector', activeSector === sector.key ? null : sector.key)"
            >
              {{ sectorLabel(sector.key) }}
            </button>
          </div>
          <div class="filters__row">
            <span class="filters__label">{{ t('caseStudies.capability') }}</span>
            <button
              type="button"
              class="chip"
              :aria-pressed="!activeTag"
              @click="setFilter('tag', null)"
            >
              {{ t('caseStudies.all') }}
            </button>
            <button
              v-for="tag in usedTags"
              :key="tag.key"
              type="button"
              class="chip"
              :class="{ 'chip--tech': tag.group === 'technology' }"
              :aria-pressed="activeTag === tag.key"
              @click="setFilter('tag', activeTag === tag.key ? null : tag.key)"
            >
              {{ tagLabel(tag.key) }}
            </button>
          </div>
        </div>

        <p
          class="filters__count"
          aria-live="polite"
        >
          {{ t('caseStudies.count', { count: filtered.length }, filtered.length) }}
        </p>

        <div
          v-if="filtered.length"
          class="grid grid--3"
        >
          <BlocksCaseStudyCard
            v-for="item in filtered"
            :key="item.path"
            :item="item"
          />
        </div>
        <p
          v-else
          class="text-muted"
        >
          {{ t('caseStudies.noResults') }}
        </p>

        <p class="case-nda">
          {{ t('caseStudies.nda') }}
        </p>
      </div>
    </section>

    <UiCtaBanner />
  </div>
</template>
