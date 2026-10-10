<script setup lang="ts">
/** Renders plain text with blank-line-separated paragraphs. */
const props = defineProps<{ text?: string, large?: boolean }>()

const paragraphs = computed(() =>
  (props.text ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean),
)
</script>

<template>
  <div
    v-if="paragraphs.length"
    class="rich-text"
    :class="{ 'rich-text--lg': large }"
  >
    <p
      v-for="(paragraph, i) in paragraphs"
      :key="i"
    >
      {{ paragraph }}
    </p>
  </div>
</template>
