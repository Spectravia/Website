/**
 * Contact form state, client-side validation (same schema as the server)
 * and submission to POST /api/contact.
 */
import { contactSchema } from '#shared/schemas/contact'
import type { ContactPayload } from '#shared/schemas/contact'

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
      await $fetch('/api/contact', {
        method: 'POST',
        body: { ...form, locale: locale.value },
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
