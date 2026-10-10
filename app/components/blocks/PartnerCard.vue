<script setup lang="ts">
import type { CollectionItem } from '~/composables/useLocalizedContent'

defineProps<{ partner: CollectionItem<'partners'>, compact?: boolean }>()

const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <article class="card card--interactive">
    <div
      class="logo-tile"
      :class="{ 'logo-tile--light': partner.logoOnLight }"
    >
      <img
        :src="partner.logo"
        :alt="partner.name"
        loading="lazy"
        width="240"
        height="72"
      >
    </div>
    <div class="stack">
      <h3 class="partner-card__name">
        <NuxtLink
          :to="localePath(partner.path)"
          class="card__link"
        >
          {{ partner.name }}
        </NuxtLink>
      </h3>
      <p class="partner-card__tagline">
        {{ partner.tagline }}
      </p>
      <p
        v-if="!compact"
        class="card__text"
      >
        {{ partner.summary }}
      </p>
    </div>
    <div class="card__footer">
      <span class="link-arrow">
        {{ t('partners.discover', { name: partner.name }) }}
        <Icon
          name="lucide:arrow-right"
          class="flip-rtl"
          aria-hidden="true"
        />
      </span>
    </div>
  </article>
</template>
