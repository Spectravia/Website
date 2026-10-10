<script setup lang="ts">
import type { CollectionItem } from '~/composables/useLocalizedContent'

const props = defineProps<{ member: CollectionItem<'team'> }>()

const initials = computed(() =>
  props.member.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase(),
)
</script>

<template>
  <article
    v-reveal
    class="team-member"
  >
    <div class="team-member__aside">
      <div class="avatar">
        <img
          v-if="member.photo"
          :src="member.photo"
          :alt="member.name"
          loading="lazy"
          width="240"
          height="240"
        >
        <span
          v-else
          class="avatar__initials"
          aria-hidden="true"
        >{{ initials }}</span>
      </div>
      <a
        v-if="member.linkedin"
        :href="member.linkedin"
        class="team-member__social"
        target="_blank"
        rel="noopener"
      >
        <Icon
          name="lucide:linkedin"
          aria-hidden="true"
        />
        LinkedIn
      </a>
    </div>
    <div class="stack">
      <h3 class="team-member__name">
        {{ member.name }}
      </h3>
      <ul
        class="team-member__roles"
        role="list"
      >
        <li
          v-for="role in member.roles"
          :key="role"
        >
          {{ role }}
        </li>
      </ul>
      <UiRichText :text="member.bio" />
    </div>
  </article>
</template>
