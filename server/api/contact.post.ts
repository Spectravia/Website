/**
 * POST /api/contact
 * Validates a contact form submission and forwards it by email.
 */
import { contactSchema } from '#shared/schemas/contact'
import { buildContactEmail } from '../utils/templates/contact-email'

export default defineEventHandler(async (event) => {
  const { contact } = useRuntimeConfig(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  if (!checkRateLimit(`contact:${ip}`, Number(contact.rateLimitMax), Number(contact.rateLimitWindowMinutes) * 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const result = await readValidatedBody(event, body => contactSchema.safeParse(body))
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid submission',
      data: { issues: result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
    })
  }

  const data = result.data

  // Honeypot filled → silently accept so bots don't learn anything.
  if (data.website) return { ok: true }

  if (!(await verifyRecaptcha(data.recaptchaToken, ip))) {
    throw createError({ statusCode: 403, statusMessage: 'Captcha verification failed' })
  }

  const email = buildContactEmail(data, { ip, receivedAt: new Date() })

  try {
    await sendMail({ ...email, replyTo: `${data.firstName} ${data.lastName} <${data.email}>` })
  }
  catch (error) {
    console.error('[contact] mail delivery failed:', error)
    throw createError({ statusCode: 502, statusMessage: 'Message could not be delivered' })
  }

  return { ok: true }
})
