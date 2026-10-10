<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

/** With two locales this is a toggle; with more it lists every other locale. */
const targets = computed(() => locales.value.filter(l => l.code !== locale.value))
</script>

<template>
  <div class="cluster">
    <NuxtLink
      v-for="target in targets"
      :key="target.code"
      :to="switchLocalePath(target.code)"
      :lang="target.language"
      :hreflang="target.language"
      class="lang-switch"
    >
      <Icon
        name="lucide:globe"
        class="lang-switch__icon"
        aria-hidden="true"
      />
      <span class="lang-switch__label">{{ target.name }}</span>
    </NuxtLink>
  </div>
</template>
