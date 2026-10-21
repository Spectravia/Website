/**
 * Contact form state, client-side validation (same schema as the server)
 * and submission to the contact endpoint (runtimeConfig.public.contactEndpoint).
 */
import { contactSchema } from '#shared/schemas/contact'
import type { ContactPayload } from '#shared/schemas/contact'

interface Grecaptcha {
  ready: (cb: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

let recaptchaScript: Promise<void> | undefined

/** Loads the reCAPTCHA v3 script on first use (only when a site key is set). */
function loadRecaptcha(siteKey: string): Promise<void> {
  recaptchaScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      recaptchaScript = undefined
      reject(new Error('reCAPTCHA failed to load'))
    }
    document.head.appendChild(script)
  })
  return recaptchaScript
}

async function getRecaptchaToken(siteKey: string): Promise<string> {
  if (!siteKey) return ''
  await loadRecaptcha(siteKey)
  const grecaptcha = (window as unknown as { grecaptcha: Grecaptcha }).grecaptcha
  await new Promise<void>(resolve => grecaptcha.ready(resolve))
  return grecaptcha.execute(siteKey, { action: 'contact' })
}

type Status = 'idle' | 'submitting' | 'success' | 'error'
type FieldErrors = Partial<Record<keyof ContactPayload, string>>

const emptyForm = (): ContactPayload => ({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  phone: '',
  topic: 'general',
  message: '',
  consent: false as unknown as true,
  website: '',
})

export function useContactForm() {
  const { locale } = useI18n()
  const { contactEndpoint: endpoint, recaptchaSiteKey } = useRuntimeConfig().public

  const form = reactive<ContactPayload>(emptyForm())
  const errors = ref<FieldErrors>({})
  const status = ref<Status>('idle')
  const errorKey = ref<string>('contact.status.error')

  function validate(): boolean {
    const result = contactSchema.safeParse({ ...form, locale: locale.value })
    errors.value = {}
    if (result.success) return true

    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ContactPayload
      errors.value[field] ??= issue.message
    }
    return false
  }

  async function submit() {
    if (status.value === 'submitting' || !validate()) return

    status.value = 'submitting'
    try {
      const recaptchaToken = await getRecaptchaToken(recaptchaSiteKey)
      await $fetch(endpoint, {
        method: 'POST',
        body: { ...form, locale: locale.value, recaptchaToken },
      })
      status.value = 'success'
      Object.assign(form, emptyForm())
    }
    catch (error: unknown) {
      const code = (error as { statusCode?: number }).statusCode
      errorKey.value = code === 429 ? 'contact.status.rateLimited' : 'contact.status.error'
      status.value = 'error'
    }
  }

  return { form, errors, status, errorKey, submit }
}
