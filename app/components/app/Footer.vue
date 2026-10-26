<script setup lang="ts">
const site = useSite()
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <img
            :src="site.brand.logo"
            :alt="site.name"
            width="180"
            height="83"
            loading="lazy"
          >
          <p class="site-footer__tagline">
            {{ t('footer.tagline') }}
          </p>
        </div>

        <div
          v-for="column in site.footer.columns"
          :key="column.title"
        >
          <h2 class="site-footer__title">
            {{ t(column.title) }}
          </h2>
          <ul
            class="site-footer__links"
            role="list"
          >
            <li
              v-for="link in column.links"
              :key="link.to"
            >
              <NuxtLink :to="localePath(link.to)">
                {{ t(link.label) }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="site-footer__title">
            {{ t('footer.contact') }}
          </h2>
          <ul
            class="site-footer__links"
            role="list"
          >
            <li>
              <UiProtectedEmail class="site-footer__contact">
                <Icon
                  name="lucide:mail"
                  aria-hidden="true"
                />
              </UiProtectedEmail>
            </li>
            <li v-if="site.contact.phone">
              <a
                :href="`tel:${site.contact.phone}`"
                class="site-footer__contact"
                dir="ltr"
              >
                <Icon
                  name="lucide:phone"
                  aria-hidden="true"
                />
                {{ site.contact.phone }}
              </a>
            </li>
            <li class="text-muted">
              {{ t(site.contact.region) }}
            </li>
            <li
              v-for="social in site.social"
              :key="social.href"
            >
              <a
                :href="social.href"
                class="site-footer__contact"
                target="_blank"
                rel="noopener"
              >
                <Icon
                  :name="social.icon"
                  aria-hidden="true"
                />
                {{ social.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p>{{ t('footer.copyright', { year, name: site.name }) }}</p>
        <div class="cluster">
          <NuxtLink
            v-for="link in site.footer.legal"
            :key="link.to"
            :to="localePath(link.to)"
          >
            {{ t(link.label) }}
          </NuxtLink>
          <span class="site-footer__motto">{{ t('footer.motto') }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
