<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()

const is404 = computed(() => props.error.statusCode === 404)

useHead({ title: () => (is404.value ? t('error.notFoundTitle') : t('error.genericTitle')) })
</script>

<template>
  <NuxtLayout>
    <UiPageHero
      :eyebrow="String(error.statusCode)"
      :title="is404 ? t('error.notFoundTitle') : t('error.genericTitle')"
      :lead="is404 ? t('error.notFoundText') : t('error.genericText')"
    >
      <div class="cluster hero__actions">
        <UiButton
          to="/"
          variant="primary"
          icon="lucide:arrow-right"
          @click="clearError()"
        >
          {{ t('error.backHome') }}
        </UiButton>
      </div>
    </UiPageHero>
  </NuxtLayout>
</template>
