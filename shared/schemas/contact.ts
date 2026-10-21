/**
 * Contact form schema, shared by the client form and the server API so both
 * enforce exactly the same rules. Error messages are i18n keys.
 */
import { z } from 'zod'

export const CONTACT_LIMITS = {
  name: 100,
  company: 150,
  email: 254,
  phone: 40,
  message: 4000,
  messageMin: 10,
} as const

/** A required text field whose "missing" error is an i18n key, not zod's default text. */
const requiredText = () => z.string({ error: 'contact.errors.required' }).trim()

export const contactSchema = z.object({
  firstName: requiredText().min(1, 'contact.errors.required').max(CONTACT_LIMITS.name, 'contact.errors.tooLong'),
  lastName: requiredText().min(1, 'contact.errors.required').max(CONTACT_LIMITS.name, 'contact.errors.tooLong'),
  email: requiredText().max(CONTACT_LIMITS.email, 'contact.errors.tooLong').pipe(z.email('contact.errors.email')),
  company: z.string().trim().max(CONTACT_LIMITS.company, 'contact.errors.tooLong').optional().default(''),
  phone: z.string().trim().max(CONTACT_LIMITS.phone, 'contact.errors.tooLong').optional().default(''),
  topic: z.string().trim().max(50).optional().default('general'),
  message: requiredText().min(CONTACT_LIMITS.messageMin, 'contact.errors.tooShort').max(CONTACT_LIMITS.message, 'contact.errors.tooLong'),
  consent: z.literal(true, 'contact.errors.consent'),
  locale: z.string().max(10).optional().default('en'),
  /** Google reCAPTCHA v3 token (verified server-side when a secret key is configured) */
  recaptchaToken: z.string().max(4000).optional().default(''),
  /** Honeypot: hidden from humans, so any value means a bot. Checked by the API. */
  website: z.string().max(500).optional().default(''),
})

export type ContactPayload = z.input<typeof contactSchema>
export type ContactSubmission = z.output<typeof contactSchema>
