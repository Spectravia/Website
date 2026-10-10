<script setup lang="ts">
import type { CollectionItem } from '~/composables/useLocalizedContent'

defineProps<{ service: CollectionItem<'services'>, linked?: boolean }>()

const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <article
    class="card"
    :class="{ 'card--interactive': linked }"
  >
    <span class="card__icon">
      <Icon
        :name="service.icon"
        aria-hidden="true"
      />
    </span>
    <h3 class="card__title">
      <NuxtLink
        v-if="linked"
        :to="localePath(`/services#${service.slug}`)"
        class="card__link"
      >
        {{ service.title }}
      </NuxtLink>
      <template v-else>
        {{ service.title }}
      </template>
    </h3>
    <p class="card__text">
      {{ service.summary }}
    </p>
    <div
      v-if="linked"
      class="card__footer"
    >
      <span class="link-arrow">
        {{ t('common.learnMore') }}
        <Icon
          name="lucide:arrow-right"
          class="flip-rtl"
          aria-hidden="true"
        />
      </span>
    </div>
  </article>
</template>
