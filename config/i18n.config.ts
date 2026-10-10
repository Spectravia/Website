/**
 * Locale definitions. To add a language:
 *  1. add an entry here,
 *  2. add `i18n/locales/<code>.json`,
 *  3. add `content/<code>/` mirroring `content/en/`,
 *  4. add the code to `contentLocales` below.
 */
import type { LocaleObject } from '@nuxtjs/i18n'

export const defaultLocale = 'en'

export const locales = [
  { code: 'en', language: 'en-US', name: 'English', dir: 'ltr', file: 'en.json' },
  { code: 'ar', language: 'ar-AE', name: 'العربية', dir: 'rtl', file: 'ar.json' },
] satisfies LocaleObject[]

export const contentLocales = ['en', 'ar'] as const
export type ContentLocale = (typeof contentLocales)[number]
