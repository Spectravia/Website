<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="app">
    <a
      class="skip-link"
      href="#main"
    >{{ t('a11y.skipToContent') }}</a>
    <div
      class="app__backdrop"
      aria-hidden="true"
    />
    <AppHeader />
    <main
      id="main"
      class="app__main"
    >
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
