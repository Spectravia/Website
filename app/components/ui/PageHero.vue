<script setup lang="ts">
/** Header band for inner pages. */
export interface Crumb {
  label: string
  to?: string
}

defineProps<{
  eyebrow?: string
  title: string
  lead?: string
  breadcrumbs?: Crumb[]
}>()

const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <section class="page-hero">
    <div class="container">
      <nav
        v-if="breadcrumbs?.length"
        class="breadcrumbs"
        :aria-label="t('a11y.breadcrumbs')"
      >
        <template
          v-for="(crumb, i) in breadcrumbs"
          :key="i"
        >
          <NuxtLink
            v-if="crumb.to"
            :to="localePath(crumb.to)"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span
            v-else
            aria-current="page"
          >{{ crumb.label }}</span>
          <span
            v-if="i < breadcrumbs.length - 1"
            class="breadcrumbs__sep"
            aria-hidden="true"
          >/</span>
        </template>
      </nav>
      <p
        v-if="eyebrow"
        class="eyebrow"
      >
        {{ eyebrow }}
      </p>
      <h1 class="page-hero__title">
        {{ title }}
      </h1>
      <p
        v-if="lead"
        class="page-hero__lead"
      >
        {{ lead }}
      </p>
      <slot />
      <div
        class="page-hero__line"
        aria-hidden="true"
      />
    </div>
  </section>
</template>
