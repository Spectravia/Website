<script setup lang="ts">
import { CONTACT_LIMITS } from '#shared/schemas/contact'

const { t } = useI18n()
const localePath = useLocalePath()
const site = useSite()
const { form, errors, status, errorKey, submit } = useContactForm()

const fieldId = (name: string) => `contact-${name}`
const errorId = (name: string) => `contact-${name}-error`
</script>

<template>
  <form
    class="form"
    novalidate
    @submit.prevent="submit"
  >
    <!-- First name -->
    <div class="form__field">
      <label
        :for="fieldId('firstName')"
        class="form__label"
      >{{ t('contact.fields.firstName') }} <span class="form__required">*</span></label>
      <input
        :id="fieldId('firstName')"
        v-model="form.firstName"
        class="form__control"
        type="text"
        autocomplete="given-name"
        :maxlength="CONTACT_LIMITS.name"
        required
        :aria-invalid="!!errors.firstName"
        :aria-describedby="errors.firstName ? errorId('firstName') : undefined"
      >
      <p
        v-if="errors.firstName"
        :id="errorId('firstName')"
        class="form__error"
      >
        {{ t(errors.firstName) }}
      </p>
    </div>

    <!-- Last name -->
    <div class="form__field">
      <label
        :for="fieldId('lastName')"
        class="form__label"
      >{{ t('contact.fields.lastName') }} <span class="form__required">*</span></label>
      <input
        :id="fieldId('lastName')"
        v-model="form.lastName"
        class="form__control"
        type="text"
        autocomplete="family-name"
        :maxlength="CONTACT_LIMITS.name"
        required
        :aria-invalid="!!errors.lastName"
        :aria-describedby="errors.lastName ? errorId('lastName') : undefined"
      >
      <p
        v-if="errors.lastName"
        :id="errorId('lastName')"
        class="form__error"
      >
        {{ t(errors.lastName) }}
      </p>
    </div>

    <!-- Email -->
    <div class="form__field">
      <label
        :for="fieldId('email')"
        class="form__label"
      >{{ t('contact.fields.email') }} <span class="form__required">*</span></label>
      <input
        :id="fieldId('email')"
        v-model="form.email"
        class="form__control"
        type="email"
        dir="ltr"
        autocomplete="email"
        :maxlength="CONTACT_LIMITS.email"
        required
        :aria-invalid="!!errors.email"
        :aria-describedby="errors.email ? errorId('email') : undefined"
      >
      <p
        v-if="errors.email"
        :id="errorId('email')"
        class="form__error"
      >
        {{ t(errors.email) }}
      </p>
    </div>

    <!-- Company -->
    <div class="form__field">
      <label
        :for="fieldId('company')"
        class="form__label"
      >{{ t('contact.fields.company') }}</label>
      <input
        :id="fieldId('company')"
        v-model="form.company"
        class="form__control"
        type="text"
        autocomplete="organization"
        :maxlength="CONTACT_LIMITS.company"
      >
    </div>

    <!-- Phone -->
    <div class="form__field">
      <label
        :for="fieldId('phone')"
        class="form__label"
      >{{ t('contact.fields.phone') }}</label>
      <input
        :id="fieldId('phone')"
        v-model="form.phone"
        class="form__control"
        type="tel"
        dir="ltr"
        autocomplete="tel"
        :maxlength="CONTACT_LIMITS.phone"
      >
    </div>

    <!-- Topic -->
    <div class="form__field">
      <label
        :for="fieldId('topic')"
        class="form__label"
      >{{ t('contact.fields.topic') }}</label>
      <select
        :id="fieldId('topic')"
        v-model="form.topic"
        class="form__control"
      >
        <option
          v-for="topic in site.contactForm.topics"
          :key="topic"
          :value="topic"
        >
          {{ t(`contact.topics.${topic}`) }}
        </option>
      </select>
    </div>

    <!-- Message -->
    <div class="form__field form__field--full">
      <label
        :for="fieldId('message')"
        class="form__label"
      >{{ t('contact.fields.message') }} <span class="form__required">*</span></label>
      <textarea
        :id="fieldId('message')"
        v-model="form.message"
        class="form__control"
        :maxlength="CONTACT_LIMITS.message"
        :placeholder="t('contact.fields.messagePlaceholder')"
        required
        :aria-invalid="!!errors.message"
        :aria-describedby="errors.message ? errorId('message') : undefined"
      />
      <p
        v-if="errors.message"
        :id="errorId('message')"
        class="form__error"
      >
        {{ t(errors.message) }}
      </p>
    </div>

    <!-- Honeypot (hidden from people, tempting for bots) -->
    <div
      class="form__honeypot"
      aria-hidden="true"
    >
      <label :for="fieldId('website')">Website</label>
      <input
        :id="fieldId('website')"
        v-model="form.website"
        type="text"
        tabindex="-1"
        autocomplete="off"
      >
    </div>

    <!-- Consent -->
    <div class="form__field form__field--full">
      <label class="form__check">
        <input
          v-model="form.consent"
          type="checkbox"
          required
          :aria-invalid="!!errors.consent"
          :aria-describedby="errors.consent ? errorId('consent') : undefined"
        >
        <i18n-t
          keypath="contact.fields.consent"
          tag="span"
          scope="global"
        >
          <template #policy>
            <NuxtLink :to="localePath('/privacy')">{{ t('nav.privacy') }}</NuxtLink>
          </template>
        </i18n-t>
      </label>
      <p
        v-if="errors.consent"
        :id="errorId('consent')"
        class="form__error"
      >
        {{ t(errors.consent) }}
      </p>
    </div>

    <div
      class="form__field form__field--full"
      aria-live="polite"
    >
      <p
        v-if="status === 'success'"
        class="alert alert--success"
        role="status"
      >
        <Icon
          name="lucide:circle-check"
          class="alert__icon"
          aria-hidden="true"
        />
        {{ t('contact.status.success') }}
      </p>
      <p
        v-else-if="status === 'error'"
        class="alert alert--error"
        role="alert"
      >
        <Icon
          name="lucide:circle-alert"
          class="alert__icon"
          aria-hidden="true"
        />
        {{ t(errorKey, { email: site.contact.email }) }}
      </p>
    </div>

    <div class="form__footer form__field--full">
      <p class="form__hint">
        {{ t('contact.requiredHint') }}
      </p>
      <UiButton
        type="submit"
        variant="primary"
        size="lg"
        icon="lucide:send"
        :disabled="status === 'submitting'"
      >
        {{ status === 'submitting' ? t('contact.sending') : t('contact.submit') }}
      </UiButton>
    </div>
  </form>
</template>
