<script setup lang="ts">
/**
 * Video / image slot for partner pages.
 * - `placeholder`: styled box until the real asset is provided
 * - `vimeo` / `youtube`: privacy-friendly facade, iframe loads on click
 * - `file`: self-hosted video or image
 */
import type { CollectionItem } from '~/composables/useLocalizedContent'

type Media = NonNullable<CollectionItem<'partners'>['media']>[number]

const props = defineProps<{ media: Media }>()
const { t } = useI18n()

const isPlaying = ref(false)

const embedUrl = computed(() => {
  const { provider, id } = props.media
  if (!id) return null
  if (provider === 'vimeo') {
    const [videoId, hash] = id.split(':')
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&dnt=1${hash ? `&h=${hash}` : ''}`
  }
  if (provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
  return null
})
</script>

<template>
  <figure class="media-embed">
    <div class="media-embed__frame">
      <!-- Remote video, click to load -->
      <template v-if="embedUrl">
        <iframe
          v-if="isPlaying"
          :src="embedUrl"
          :title="media.title"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        />
        <button
          v-else
          type="button"
          class="media-facade"
          @click="isPlaying = true"
        >
          <span class="media-facade__play">
            <Icon
              name="lucide:play"
              aria-hidden="true"
            />
          </span>
          <span class="media-facade__label">{{ t('media.play', { title: media.title }) }}</span>
        </button>
      </template>

      <!-- Self-hosted file -->
      <template v-else-if="media.provider === 'file' && media.src">
        <video
          v-if="media.type === 'video'"
          :src="media.src"
          controls
          preload="metadata"
        />
        <img
          v-else
          :src="media.src"
          :alt="media.title"
          loading="lazy"
        >
      </template>

      <!-- Placeholder -->
      <div
        v-else
        class="media-placeholder"
      >
        <Icon
          :name="media.type === 'video' ? 'lucide:clapperboard' : 'lucide:image'"
          class="media-placeholder__icon"
          aria-hidden="true"
        />
        <span class="media-placeholder__title">{{ media.title }}</span>
        <span class="media-placeholder__note">{{ t('media.comingSoon') }}</span>
      </div>
    </div>
    <figcaption
      v-if="media.caption"
      class="media-embed__caption"
    >
      {{ media.caption }}
    </figcaption>
  </figure>
</template>
