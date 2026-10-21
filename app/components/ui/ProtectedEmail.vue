<script setup lang="ts">
/**
 * Email address that is NOT in the page HTML: it is assembled in the browser
 * and only revealed after a real click, so scrapers cannot harvest it.
 * Extra classes fall through to the button / link; the default slot (e.g. an
 * icon) is rendered before the label in both states.
 */
const { t } = useI18n()
const { contactEmail } = useSite()

const address = ref('')

function reveal(event: MouseEvent) {
  if (!event.isTrusted) return // ignore scripted clicks
  address.value = contactEmail()
}
</script>

<template>
  <a
    v-if="address"
    :href="`mailto:${address}`"
    dir="ltr"
  >
    <slot />
    {{ address }}
  </a>
  <button
    v-else
    type="button"
    class="protected-email"
    @click="reveal"
  >
    <slot />
    {{ t('contact.showEmail') }}
  </button>
</template>
