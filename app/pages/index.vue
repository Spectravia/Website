<script setup lang="ts">
const { data: page } = await usePageContent('home')
const { data: services } = await useServices()
const { data: industries } = await useIndustries()
const { data: partners } = await usePartners()
const { data: cases } = await useCaseStudies()

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => page.value?.title, description: () => page.value?.description })

const intro = computed(() => findSection(page.value, 'intro'))
const pillars = computed(() => findSection(page.value, 'pillars'))
const servicesSection = computed(() => findSection(page.value, 'services'))
const industriesSection = computed(() => findSection(page.value, 'industries'))
const partnersSection = computed(() => findSection(page.value, 'partners'))
const casesSection = computed(() => findSection(page.value, 'cases'))
const featuredCases = computed(() => (cases.value ?? []).filter(c => c.featured).slice(0, 3))
</script>

<template>
  <div v-if="page">
    <BlocksHomeHero :hero="page.hero" />

    <!-- Intro -->
    <section
      v-if="intro"
      class="section section--spaced"
    >
      <div class="container split">
        <div>
          <UiSectionHeader
            :eyebrow="intro.eyebrow"
            :title="intro.title"
          />
          <UiRichText
            v-reveal="100"
            :text="intro.text"
            large
          />
        </div>
        <figure
          v-if="intro.image"
          v-reveal="200"
          class="media-frame"
        >
          <img
            :src="intro.image"
            alt=""
            width="1600"
            height="873"
            loading="lazy"
          >
        </figure>
      </div>
    </section>

    <!-- Pillars: mission / team / services -->
    <section
      v-if="pillars?.items?.length"
      class="section"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="pillars.eyebrow"
          :title="pillars.title"
        />
        <div class="grid grid--3">
          <article
            v-for="(item, i) in pillars.items"
            :key="item.title"
            v-reveal="i * 100"
            class="pillar"
          >
            <span class="pillar__index">0{{ i + 1 }}</span>
            <h3 class="pillar__title">
              {{ item.title }}
            </h3>
            <p class="pillar__text">
              {{ item.text }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section
      v-if="servicesSection"
      class="section section--spaced"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="servicesSection.eyebrow"
          :title="servicesSection.title"
          :lead="servicesSection.lead"
        />
        <div class="grid grid--3">
          <BlocksServiceCard
            v-for="(service, i) in services"
            :key="service.slug"
            v-reveal="i * 100"
            :service="service"
            linked
          />
        </div>
      </div>
    </section>

    <!-- Industries -->
    <section
      v-if="industriesSection"
      class="section"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="industriesSection.eyebrow"
          :title="industriesSection.title"
          :lead="industriesSection.lead"
        />
        <div class="grid grid--3">
          <BlocksIndustryCard
            v-for="(industry, i) in industries"
            :key="industry.slug"
            v-reveal="(i % 3) * 100"
            :industry="industry"
            linked
          />
        </div>
      </div>
    </section>

    <!-- Featured case studies -->
    <section
      v-if="casesSection && featuredCases.length"
      class="section section--spaced"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="casesSection.eyebrow"
          :title="casesSection.title"
          :lead="casesSection.lead"
        />
        <div class="grid grid--3">
          <BlocksCaseStudyCard
            v-for="(item, i) in featuredCases"
            :key="item.path"
            v-reveal="i * 100"
            :item="item"
          />
        </div>
        <div
          v-if="casesSection.cta"
          class="section__more"
        >
          <UiButton
            :to="casesSection.cta.to"
            icon="lucide:arrow-right"
          >
            {{ casesSection.cta.label }}
          </UiButton>
        </div>
      </div>
    </section>

    <!-- Partners -->
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
            v-for="(partner, i) in partners"
            :key="partner.path"
            v-reveal="i * 100"
            :partner="partner"
            compact
          />
        </div>
      </div>
    </section>

    <UiCtaBanner />
  </div>
</template>
