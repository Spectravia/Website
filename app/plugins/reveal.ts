/**
 * `v-reveal` — fades elements in as they scroll into view.
 * Usage: `<div v-reveal>` or `<div v-reveal="120">` (delay in ms).
 *
 * Progressive enhancement: nothing is hidden on the server, and elements that
 * are already visible on mount are left alone (no flash).
 */
import type { Directive } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  const getObserver = () => {
    observer ??= new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        observer?.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    return observer
  }

  const reveal: Directive<HTMLElement, number | undefined> = {
    mounted(el, binding) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      if (el.getBoundingClientRect().top < window.innerHeight) return

      if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
      el.classList.add('reveal')
      getObserver().observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
    },
    getSSRProps: () => ({}),
  }

  nuxtApp.vueApp.directive('reveal', reveal)
})
