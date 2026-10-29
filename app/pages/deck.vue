<script setup lang="ts">
import { deckConfig } from '~~/config/deck.config'

/*
 * Full-screen pitch deck viewer. Shared by link only: not in the navigation
 * or the sitemap, and marked noindex. Slides and settings: config/deck.config.ts.
 */
definePageMeta({ layout: false })

const { t } = useI18n()
const site = useSite()
const localePath = useLocalePath()

usePageSeo({
  title: () => t('deck.title'),
  description: () => t('deck.description'),
  image: `/${deckConfig.imagesDir}/og.jpg`,
})
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const slides = deckConfig.slides.map((alt, i) => ({
  alt,
  src: `/${deckConfig.imagesDir}/slide-${String(i + 1).padStart(2, '0')}.webp`,
}))
const total = slides.length

const current = ref(0)
const overviewOpen = ref(false)
const isFullscreen = ref(false)
const canFullscreen = ref(false)
const idle = ref(false)

function go(index: number) {
  current.value = Math.min(Math.max(index, 0), total - 1)
  overviewOpen.value = false
  // Keep the slide number in the address so a link can open on a given slide
  history.replaceState(history.state, '', `#${current.value + 1}`)
}
const next = () => go(current.value + 1)
const prev = () => go(current.value - 1)

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen()
}

function onKey(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  if (event.key === 'Escape' && overviewOpen.value) {
    overviewOpen.value = false
    return
  }
  if (overviewOpen.value) return
  const actions: Record<string, () => void> = {
    'ArrowRight': next,
    'ArrowDown': next,
    'PageDown': next,
    ' ': next,
    'ArrowLeft': prev,
    'ArrowUp': prev,
    'PageUp': prev,
    'Home': () => go(0),
    'End': () => go(total - 1),
    'f': toggleFullscreen,
  }
  const action = actions[event.key]
  if (!action) return
  // Let Space/arrows act on a focused button as usual
  if ((event.target as HTMLElement).closest('button, a') && [' ', 'Enter'].includes(event.key)) return
  event.preventDefault()
  action()
}

// Swipe left/right on touch screens
let touchX: number | null = null
function onTouchStart(event: TouchEvent) {
  touchX = event.touches.length === 1 ? event.touches[0]!.clientX : null
}
function onTouchEnd(event: TouchEvent) {
  if (touchX === null) return
  const dx = event.changedTouches[0]!.clientX - touchX
  touchX = null
  if (Math.abs(dx) > 50) {
    if (dx < 0) next()
    else prev()
  }
}

// In full screen, the controls fade out after a few seconds without mouse movement
let idleTimer: ReturnType<typeof setTimeout> | undefined
function wake() {
  idle.value = false
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => (idle.value = true), 3000)
}

const onFullscreenChange = () => (isFullscreen.value = Boolean(document.fullscreenElement))

onMounted(() => {
  canFullscreen.value = Boolean(document.fullscreenEnabled)
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointermove', wake)
  window.addEventListener('pointerdown', wake)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  wake()
})

// Open on the slide in the address (#5), once the app has finished loading
onNuxtReady(() => {
  const fromHash = Number.parseInt(location.hash.slice(1), 10)
  if (fromHash) current.value = Math.min(Math.max(fromHash - 1, 0), total - 1)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointermove', wake)
  window.removeEventListener('pointerdown', wake)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  clearTimeout(idleTimer)
})
</script>

<template>
  <div
    class="deck"
    :class="{ 'deck--idle': idle && isFullscreen && !overviewOpen }"
    dir="ltr"
  >
    <h1 class="sr-only">
      {{ t('deck.title') }}
    </h1>

    <div
      class="deck__stage"
      @touchstart.passive="onTouchStart"
      @touchend="onTouchEnd"
    >
      <img
        v-for="(slide, i) in slides"
        v-show="i === current"
        :key="slide.src"
        class="deck__slide"
        :src="slide.src"
        :alt="slide.alt"
        :width="deckConfig.width"
        :height="deckConfig.height"
        :loading="Math.abs(i - current) <= 1 ? 'eager' : 'lazy'"
        decoding="async"
      >
      <p
        class="sr-only"
        aria-live="polite"
      >
        {{ t('deck.counter', { current: current + 1, total }) }}
      </p>
    </div>

    <div class="deck__bar">
      <NuxtLink
        :to="localePath('/')"
        class="deck__logo"
        :aria-label="t('a11y.home', { name: site.name })"
      >
        <img
          :src="site.brand.logoCompact"
          :alt="site.name"
          width="136"
          height="56"
        >
      </NuxtLink>

      <div class="deck__nav">
        <button
          type="button"
          class="deck__btn"
          :disabled="current === 0"
          :aria-label="t('deck.previous')"
          :title="t('deck.previous')"
          @click="prev"
        >
          <Icon
            name="lucide:chevron-left"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="deck__counter"
          :aria-label="t('deck.overview')"
          :title="t('deck.overview')"
          :aria-expanded="overviewOpen"
          @click="overviewOpen = !overviewOpen"
        >
          {{ current + 1 }} / {{ total }}
        </button>
        <button
          type="button"
          class="deck__btn"
          :disabled="current === total - 1"
          :aria-label="t('deck.next')"
          :title="t('deck.next')"
          @click="next"
        >
          <Icon
            name="lucide:chevron-right"
            aria-hidden="true"
          />
        </button>
      </div>

      <div class="deck__tools">
        <a
          v-if="deckConfig.showDownload"
          class="deck__btn"
          :href="`/${deckConfig.pdf}`"
          download
          :aria-label="t('deck.download')"
          :title="t('deck.download')"
        >
          <Icon
            name="lucide:download"
            aria-hidden="true"
          />
        </a>
        <button
          v-if="canFullscreen"
          type="button"
          class="deck__btn"
          :aria-label="isFullscreen ? t('deck.exitFullscreen') : t('deck.fullscreen')"
          :title="isFullscreen ? t('deck.exitFullscreen') : t('deck.fullscreen')"
          @click="toggleFullscreen"
        >
          <Icon
            :name="isFullscreen ? 'lucide:minimize' : 'lucide:maximize'"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <div
      v-if="overviewOpen"
      class="deck__overview"
      role="dialog"
      :aria-label="t('deck.overview')"
    >
      <button
        type="button"
        class="deck__btn deck__overview-close"
        :aria-label="t('deck.closeOverview')"
        :title="t('deck.closeOverview')"
        @click="overviewOpen = false"
      >
        <Icon
          name="lucide:x"
          aria-hidden="true"
        />
      </button>
      <ol class="deck__grid">
        <li
          v-for="(slide, i) in slides"
          :key="slide.src"
        >
          <button
            type="button"
            class="deck__thumb"
            :class="{ 'deck__thumb--current': i === current }"
            :aria-label="t('deck.goTo', { n: i + 1 })"
            :aria-current="i === current ? 'true' : undefined"
            @click="go(i)"
          >
            <img
              :src="slide.src"
              :alt="slide.alt"
              :width="deckConfig.width"
              :height="deckConfig.height"
              loading="lazy"
            >
            <span>{{ i + 1 }}</span>
          </button>
        </li>
      </ol>
    </div>
  </div>
</template>
