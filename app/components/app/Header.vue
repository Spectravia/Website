<script setup lang="ts">
const site = useSite()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const isOpen = ref(false)
const isScrolled = ref(false)

const isActive = (to: string) => {
  const target = localePath(to)
  return to === '/' ? route.path === target : route.path.startsWith(target)
}

watch(() => route.fullPath, () => (isOpen.value = false))

const onScroll = () => (isScrolled.value = window.scrollY > 12)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

useHead({ bodyAttrs: { style: () => (isOpen.value ? 'overflow:hidden' : '') } })
</script>

<template>
  <header
    class="site-header"
    :class="{ 'is-scrolled': isScrolled, 'is-open': isOpen }"
  >
    <div class="container site-header__inner">
      <AppBrandLogo />

      <nav
        class="site-nav"
        :aria-label="t('a11y.mainNav')"
      >
        <ul
          class="site-nav__list"
          role="list"
        >
          <li
            v-for="item in site.nav"
            :key="item.to"
          >
            <NuxtLink
              :to="localePath(item.to)"
              class="site-nav__link"
              :class="{ 'is-active': isActive(item.to) }"
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              {{ t(item.label) }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="site-header__actions">
        <AppLangSwitcher />
        <UiButton
          class="site-header__cta"
          :to="site.headerCta.to"
          variant="primary"
          size="sm"
        >
          {{ t(site.headerCta.label) }}
        </UiButton>
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="isOpen"
          aria-controls="mobile-nav"
          :aria-label="isOpen ? t('a11y.closeMenu') : t('a11y.openMenu')"
          @click="isOpen = !isOpen"
        >
          <Icon
            :name="isOpen ? 'lucide:x' : 'lucide:menu'"
            class="menu-toggle__icon"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <Transition name="mobile-nav">
      <nav
        v-show="isOpen"
        id="mobile-nav"
        class="mobile-nav"
        :aria-label="t('a11y.mainNav')"
      >
        <ul
          class="mobile-nav__list"
          role="list"
        >
          <li
            v-for="item in [...site.nav, site.headerCta]"
            :key="item.to"
          >
            <NuxtLink
              :to="localePath(item.to)"
              class="mobile-nav__link"
              :class="{ 'is-active': isActive(item.to) }"
            >
              {{ t(item.label) }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </Transition>
  </header>
</template>
