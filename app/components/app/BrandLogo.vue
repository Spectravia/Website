<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'compact' | 'full' }>(), { variant: 'compact' })

const site = useSite()
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <NuxtLink
    :to="localePath('/')"
    class="brand-logo"
    :aria-label="t('a11y.home', { name: site.name })"
  >
    <img
      :src="variant === 'full' ? site.brand.logo : site.brand.logoCompact"
      :alt="site.name"
      width="200"
      height="44"
    >
  </NuxtLink>
</template>
