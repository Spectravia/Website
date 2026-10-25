<script setup lang="ts">
const localePath = useLocalePath()
const { data: page } = await usePageContent('home')
const { data: services } = await useServices()
const { data: industries } = await useIndustries()
const { data: partners } = await usePartners()
const { data: cases } = await useCaseStudies()
const { data: team } = await useTeam()

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => page.value?.title, description: () => page.value?.description })

const proof = computed(() => findSection(page.value, 'proof'))
const how = computed(() => findSection(page.value, 'how'))
const about = computed(() => findSection(page.value, 'about'))
const servicesSection = computed(() => findSection(page.value, 'services'))
const industriesSection = computed(() => findSection(page.value, 'industries'))
const partnersSection = computed(() => findSection(page.value, 'partners'))
const casesSection = computed(() => findSection(page.value, 'cases'))
const featuredCases = computed(() => (cases.value ?? []).filter(c => c.featured).slice(0, 3))
</script>

<template>
  <div v-if="page">
    <BlocksHomeHero :hero="page.hero" />

    <!-- Proof strip: headline results -->
    <section
      v-if="proof?.items?.length"
      class="section proof-section"
    >
      <div class="container">
        <ul
          class="proof-strip"
          role="list"
        >
          <li
            v-for="(stat, i) in proof.items"
            :key="stat.title + i"
            v-reveal="i * 80"
          >
            <NuxtLink
              v-if="stat.to"
              :to="localePath(stat.to)"
              class="proof-strip__item"
            >
              <span class="proof-strip__value text-gradient">{{ stat.title }}</span>
              <span class="proof-strip__label">{{ stat.text }}</span>
            </NuxtLink>
          </li>
        </ul>
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

    <!-- How we work -->
    <section
      v-if="how?.items?.length"
      class="section section--spaced"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="how.eyebrow"
          :title="how.title"
          :lead="how.lead"
        />
        <ol class="process">
          <li
            v-for="(step, i) in how.items"
            :key="step.title"
            v-reveal="i * 100"
            class="process__item"
          >
            <span
              class="process__icon"
              aria-hidden="true"
            >
              <Icon :name="step.icon ?? 'lucide:circle'" />
            </span>
            <span class="process__index">0{{ i + 1 }}</span>
            <h3 class="process__title">
              {{ step.title }}
            </h3>
            <p class="process__text">
              {{ step.text }}
            </p>
          </li>
        </ol>
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

    <!-- About teaser with leadership -->
    <section
      v-if="about"
      class="section section--spaced"
    >
      <div class="container about-teaser">
        <div>
          <UiSectionHeader
            :eyebrow="about.eyebrow"
            :title="about.title"
          />
          <UiRichText
            v-reveal="100"
            :text="about.text"
            large
          />
          <UiButton
            v-if="about.cta"
            :to="about.cta.to"
            icon="lucide:arrow-right"
            class="about-teaser__cta"
          >
            {{ about.cta.label }}
          </UiButton>
        </div>
        <ul
          class="leaders"
          role="list"
        >
          <li
            v-for="(member, i) in team"
            :key="member.name"
            v-reveal="i * 100"
            class="leaders__item"
          >
            <span class="leaders__avatar">
              <img
                v-if="member.photo"
                :src="member.photo"
                :alt="member.name"
                width="96"
                height="96"
                loading="lazy"
              >
              <span
                v-else
                aria-hidden="true"
              >{{ member.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('') }}</span>
            </span>
            <span>
              <span class="leaders__name">{{ member.name }}</span>
              <span class="leaders__role">{{ member.roles?.[0] }}</span>
            </span>
          </li>
        </ul>
      </div>
    </section>

    <UiCtaBanner />
  </div>
</template>
