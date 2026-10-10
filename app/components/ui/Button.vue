<script setup lang="ts">
/**
 * Button / link-button. Renders a NuxtLink (locale-aware) when `to` is set,
 * an <a> for external `href`, otherwise a <button>.
 */
const props = withDefaults(defineProps<{
  to?: string
  href?: string
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}>(), {
  variant: 'ghost',
  size: 'md',
  type: 'button',
})

const localePath = useLocalePath()

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  props.size !== 'md' && `btn--${props.size}`,
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="localePath(to)"
    :class="classes"
  >
    <slot />
    <Icon
      v-if="icon"
      :name="icon"
      class="btn__icon btn__icon--trail flip-rtl"
      aria-hidden="true"
    />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="classes"
    target="_blank"
    rel="noopener"
  >
    <slot />
    <Icon
      v-if="icon"
      :name="icon"
      class="btn__icon"
      aria-hidden="true"
    />
  </a>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="disabled"
  >
    <slot />
    <Icon
      v-if="icon"
      :name="icon"
      class="btn__icon btn__icon--trail flip-rtl"
      aria-hidden="true"
    />
  </button>
</template>
