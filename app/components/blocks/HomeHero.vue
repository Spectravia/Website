<script setup lang="ts">
import type { CollectionItem } from '~/composables/useLocalizedContent'

defineProps<{ hero: CollectionItem<'pages'>['hero'] }>()
</script>

<template>
  <section class="hero">
    <div
      class="hero__visual"
      aria-hidden="true"
    >
      <BlocksHeroPrism />
    </div>
    <div class="container">
      <div class="hero__content">
        <p
          v-if="hero.eyebrow"
          class="eyebrow hero__eyebrow"
        >
          {{ hero.eyebrow }}
        </p>
        <h1 class="hero__title">
          {{ hero.title }}
          <span
            v-if="hero.highlight"
            class="hero__title-highlight text-gradient"
          >{{ hero.highlight }}</span>
        </h1>
        <p
          v-if="hero.lead"
          class="hero__lead"
        >
          {{ hero.lead }}
        </p>
        <div class="cluster hero__actions">
          <UiButton
            v-if="hero.primaryCta"
            :to="hero.primaryCta.to"
            variant="primary"
            size="lg"
            icon="lucide:arrow-right"
          >
            {{ hero.primaryCta.label }}
          </UiButton>
          <UiButton
            v-if="hero.secondaryCta"
            :to="hero.secondaryCta.to"
            size="lg"
          >
            {{ hero.secondaryCta.label }}
          </UiButton>
        </div>
      </div>
    </div>
    <div
      class="hero__scroll"
      aria-hidden="true"
    />
  </section>
</template>
