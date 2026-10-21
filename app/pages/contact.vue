<script setup lang="ts">
const { t } = useI18n()
const site = useSite()
const { data: page } = await usePageContent('contact')

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => page.value?.title, description: () => page.value?.description })

const aside = computed(() => findSection(page.value, 'aside'))
</script>

<template>
  <div v-if="page">
    <UiPageHero
      :eyebrow="page.hero.eyebrow"
      :title="page.hero.title"
      :lead="page.hero.lead"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: t('nav.contact') }]"
    />

    <section class="section">
      <div class="container split split--top">
        <aside class="contact-card">
          <h2
            v-if="aside?.title"
            class="section__title"
          >
            {{ aside.title }}
          </h2>
          <UiRichText :text="aside?.text" />

          <div class="contact-card__item">
            <span class="card__icon">
              <Icon
                name="lucide:mail"
                aria-hidden="true"
              />
            </span>
            <div>
              <p class="contact-card__label">
                {{ t('contact.emailLabel') }}
              </p>
              <UiProtectedEmail class="contact-card__value" />
            </div>
          </div>

          <div
            v-if="site.contact.phone"
            class="contact-card__item"
          >
            <span class="card__icon">
              <Icon
                name="lucide:phone"
                aria-hidden="true"
              />
            </span>
            <div>
              <p class="contact-card__label">
                {{ t('contact.phoneLabel') }}
              </p>
              <a
                :href="`tel:${site.contact.phone}`"
                class="contact-card__value"
                dir="ltr"
              >{{ site.contact.phone }}</a>
            </div>
          </div>

          <div class="contact-card__item">
            <span class="card__icon">
              <Icon
                name="lucide:globe"
                aria-hidden="true"
              />
            </span>
            <div>
              <p class="contact-card__label">
                {{ t('contact.regionLabel') }}
              </p>
              <p class="contact-card__value">
                {{ t(site.contact.region) }}
              </p>
            </div>
          </div>
        </aside>

        <BlocksContactForm />
      </div>
    </section>
  </div>
</template>
