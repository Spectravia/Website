<script setup lang="ts">
/** Closing call-to-action band: book a call (primary) or send a message. Defaults to the generic copy. */
const props = defineProps<{
  title?: string
  text?: string
  label?: string
  to?: string
}>()

const { t } = useI18n()
const site = useSite()
</script>

<template>
  <section class="section">
    <div class="container">
      <div
        v-reveal
        class="cta-banner"
      >
        <div>
          <h2 class="cta-banner__title">
            {{ props.title ?? t('cta.title') }}
          </h2>
          <p class="cta-banner__text">
            {{ props.text ?? t('cta.text') }}
          </p>
        </div>
        <div class="cta-banner__actions">
          <UiButton
            :to="props.to ?? '/contact?topic=call'"
            variant="primary"
            size="lg"
            icon="lucide:arrow-right"
          >
            {{ props.label ?? t('cta.button') }}
          </UiButton>
          <UiButton
            :to="site.headerCta.to"
            size="lg"
          >
            {{ t('cta.secondary') }}
          </UiButton>
        </div>
      </div>
    </div>
  </section>
</template>
