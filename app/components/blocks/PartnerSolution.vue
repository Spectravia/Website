<script setup lang="ts">
import type { CollectionItem } from '~/composables/useLocalizedContent'

type Solution = NonNullable<CollectionItem<'partners'>['solutions']>[number]

defineProps<{ solution: Solution }>()
const { t } = useI18n()
</script>

<template>
  <article
    v-reveal
    class="solution"
  >
    <div>
      <img
        v-if="solution.logo"
        :src="solution.logo"
        :alt="solution.name"
        class="solution__logo"
        loading="lazy"
      >
      <p
        v-if="solution.audience"
        class="solution__audience"
      >
        {{ solution.audience }}
      </p>
      <h3 class="solution__title">
        {{ solution.name }}
      </h3>
      <UiRichText :text="solution.text" />
      <ul
        v-if="solution.features?.length"
        class="feature-list solution__features"
      >
        <li
          v-for="feature in solution.features"
          :key="feature"
        >
          {{ feature }}
        </li>
      </ul>
      <div
        v-if="solution.link"
        class="solution__actions"
      >
        <UiButton
          :href="solution.link"
          icon="lucide:external-link"
        >
          {{ t('partners.visitSolution', { name: solution.name }) }}
        </UiButton>
      </div>
    </div>
    <div
      v-if="solution.image"
      class="solution__media"
    >
      <img
        :src="solution.image"
        :alt="solution.name"
        loading="lazy"
      >
    </div>
    <div
      v-else-if="solution.icon"
      class="solution__media logo-tile"
    >
      <Icon
        :name="solution.icon"
        class="solution__icon"
        aria-hidden="true"
      />
    </div>
  </article>
</template>
