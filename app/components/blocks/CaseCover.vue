<script setup lang="ts">
/** Case-study cover: the photo when provided, otherwise a branded icon visual. */
defineProps<{ cover?: string, icon: string, alt: string, large?: boolean }>()
</script>

<template>
  <div
    class="case-cover"
    :class="{ 'case-cover--large': large }"
  >
    <img
      v-if="cover"
      :src="cover"
      :alt="alt"
      loading="lazy"
    >
    <div
      v-else
      class="case-cover__visual"
      aria-hidden="true"
    >
      <Icon
        :name="icon"
        class="case-cover__icon"
      />
    </div>
  </div>
</template>
