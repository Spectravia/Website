<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  lead?: string
  center?: boolean
  as?: 'h1' | 'h2' | 'h3'
}>(), { as: 'h2' })
</script>

<template>
  <header
    v-reveal
    class="section__header"
    :class="{ 'section__header--center': center }"
  >
    <p
      v-if="eyebrow"
      class="eyebrow"
    >
      {{ eyebrow }}
    </p>
    <component
      :is="as"
      v-if="title"
      class="section__title"
    >
      {{ title }}
    </component>
    <p
      v-if="lead"
      class="section__lead"
    >
      {{ lead }}
    </p>
    <slot />
  </header>
</template>
