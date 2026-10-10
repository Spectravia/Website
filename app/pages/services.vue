<script setup lang="ts">
const { t } = useI18n()
const { data: page } = await usePageContent('services')
const { data: services } = await useServices()
const { data: partners } = await usePartners()

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => page.value?.title, description: () => page.value?.description })

const partnersSection = computed(() => findSection(page.value, 'partners'))
const localePath = useLocalePath()

/** Partners referenced by a service, resolved to their content entries. */
const partnersOf = (slugs: string[]) =>
  (partners.value ?? []).filter(p => slugs.some(slug => p.path === `/partners/${slug}`))
</script>

<template>
  <div v-if="page">
    <UiPageHero
      :eyebrow="page.hero.eyebrow"
      :title="page.hero.title"
      :lead="page.hero.lead"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: t('nav.services') }]"
    />

    <section
      v-for="service in services"
      :id="service.slug"
      :key="service.slug"
      class="section"
    >
      <div class="container">
        <article
          v-reveal
          class="solution"
        >
          <div>
            <span class="card__icon">
              <Icon
                :name="service.icon"
                aria-hidden="true"
              />
            </span>
            <h2 class="solution__title solution__title--spaced">
              {{ service.title }}
            </h2>
            <UiRichText :text="service.text" />
            <div
              v-if="service.partners?.length"
              class="solution__actions"
            >
              <p class="eyebrow">
                {{ t('services.deliveredWith') }}
              </p>
              <ul
                class="tag-list"
                role="list"
              >
                <li
                  v-for="partner in partnersOf(service.partners ?? [])"
                  :key="partner.path"
                >
                  <NuxtLink
                    :to="localePath(partner.path)"
                    class="tag"
                  >
                    {{ partner.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <ul class="feature-list">
              <li
                v-for="feature in service.features"
                :key="feature"
              >
                {{ feature }}
              </li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <section
      v-if="partnersSection"
      class="section section--spaced"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="partnersSection.eyebrow"
          :title="partnersSection.title"
          :lead="partnersSection.lead"
        />
        <div class="grid grid--4">
          <BlocksPartnerCard
            v-for="partner in partners"
            :key="partner.path"
            :partner="partner"
            compact
          />
        </div>
      </div>
    </section>

    <UiCtaBanner />
  </div>
</template>
