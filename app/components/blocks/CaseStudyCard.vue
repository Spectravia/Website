<script setup lang="ts">
import type { CollectionItem } from '~/composables/useLocalizedContent'

defineProps<{ item: CollectionItem<'cases'> }>()

const localePath = useLocalePath()
const { t } = useI18n()
const { tagLabel, sectorLabel } = useTaxonomy()
</script>

<template>
  <article class="card card--interactive case-card">
    <BlocksCaseCover
      class="card__media"
      :cover="item.cover"
      :icon="item.icon"
      :alt="item.title"
    />
    <p class="case-card__sector">
      {{ sectorLabel(item.sector) }}
    </p>
    <h3 class="card__title">
      <NuxtLink
        :to="localePath(item.path)"
        class="card__link"
      >
        {{ item.title }}
      </NuxtLink>
    </h3>
    <p
      v-if="item.highlight"
      class="case-card__highlight"
    >
      <span
        class="case-card__value text-gradient"
        dir="auto"
      >{{ item.highlight.value }}</span>
      <span class="case-card__label">{{ item.highlight.label }}</span>
    </p>
    <ul
      v-if="item.tags?.length"
      class="tag-list"
      role="list"
    >
      <li
        v-for="tag in item.tags"
        :key="tag"
        class="tag"
      >
        {{ tagLabel(tag) }}
      </li>
    </ul>
    <div class="card__footer">
      <span class="link-arrow">
        {{ t('caseStudies.readCase') }}
        <Icon
          name="lucide:arrow-right"
          class="flip-rtl"
          aria-hidden="true"
        />
      </span>
    </div>
  </article>
</template>
