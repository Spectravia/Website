/**
 * Google reCAPTCHA v3 verification. Disabled (always passes) when no secret
 * key is configured, so local development works without keys.
 */
interface SiteVerifyResponse {
  'success': boolean
  'score'?: number
  'action'?: string
  'error-codes'?: string[]
}

export async function verifyRecaptcha(token: string, ip?: string): Promise<boolean> {
  const { recaptcha } = useRuntimeConfig()
  if (!recaptcha.secretKey) return true
  if (!token) return false

  try {
    const result = await $fetch<SiteVerifyResponse>('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: recaptcha.secretKey, response: token, ...(ip ? { remoteip: ip } : {}) }),
      timeout: 10_000,
    })
    if (!result.success) return false
    if (result.action && result.action !== 'contact') return false
    return result.score === undefined || result.score >= Number(recaptcha.minScore)
  }
  catch (error) {
    console.error('[contact] reCAPTCHA verification failed:', error)
    return false
  }
}
