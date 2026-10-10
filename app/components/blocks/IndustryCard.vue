<script setup lang="ts">
import type { CollectionItem } from '~/composables/useLocalizedContent'

defineProps<{ industry: CollectionItem<'industries'>, linked?: boolean }>()

const localePath = useLocalePath()
</script>

<template>
  <article
    class="card"
    :class="{ 'card--interactive': linked }"
  >
    <span class="card__icon">
      <Icon
        :name="industry.icon"
        aria-hidden="true"
      />
    </span>
    <h3 class="card__title">
      <NuxtLink
        v-if="linked"
        :to="localePath(`/industries#${industry.slug}`)"
        class="card__link"
      >
        {{ industry.title }}
      </NuxtLink>
      <template v-else>
        {{ industry.title }}
      </template>
    </h3>
    <p class="card__text">
      {{ industry.summary }}
    </p>
  </article>
</template>
