<script setup lang="ts">
const { t } = useI18n()
const { data: page } = await usePageContent('about')
const { data: team } = await useTeam()

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

usePageSeo({ title: () => page.value?.title, description: () => page.value?.description })

const mission = computed(() => findSection(page.value, 'mission'))
const values = computed(() => findSection(page.value, 'values'))
const teamSection = computed(() => findSection(page.value, 'team'))
const statement = computed(() => findSection(page.value, 'statement'))
</script>

<template>
  <div v-if="page">
    <UiPageHero
      :eyebrow="page.hero.eyebrow"
      :title="page.hero.title"
      :lead="page.hero.lead"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: t('nav.about') }]"
    />

    <!-- Mission -->
    <section
      v-if="mission"
      class="section"
    >
      <div class="container split split--wide-start split--top">
        <UiSectionHeader
          :eyebrow="mission.eyebrow"
          :title="mission.title"
        />
        <UiRichText
          :text="mission.text"
          large
        />
      </div>
    </section>

    <!-- Values -->
    <section
      v-if="values?.items?.length"
      class="section"
    >
      <div class="container">
        <UiSectionHeader
          :eyebrow="values.eyebrow"
          :title="values.title"
        />
        <div class="grid grid--4">
          <article
            v-for="(item, i) in values.items"
            :key="item.title"
            v-reveal="i * 80"
            class="card"
          >
            <span
              v-if="item.icon"
              class="card__icon"
            >
              <Icon
                :name="item.icon"
                aria-hidden="true"
              />
            </span>
            <h3 class="card__title">
              {{ item.title }}
            </h3>
            <p class="card__text">
              {{ item.text }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section
      v-if="teamSection"
      id="team"
      class="section section--spaced"
    >
      <div class="container stack">
        <UiSectionHeader
          :eyebrow="teamSection.eyebrow"
          :title="teamSection.title"
          :lead="teamSection.lead"
        />
        <BlocksTeamMember
          v-for="member in team"
          :key="member.name"
          :member="member"
        />
      </div>
    </section>

    <section
      v-if="statement"
      class="section"
    >
      <div class="container">
        <p
          v-reveal
          class="statement"
        >
          {{ statement.text }}
        </p>
      </div>
    </section>

    <UiCtaBanner />
  </div>
</template>
