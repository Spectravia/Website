import { siteConfig } from './config/site.config'
import { defaultLocale, locales } from './config/i18n.config'

export default defineNuxtConfig({

  modules: [
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: defaultLocale },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: siteConfig.brand.themeColor },
        { name: 'color-scheme', content: 'dark' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: siteConfig.brand.mark },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      // Uses Node's built-in `node:sqlite` (Node >= 22.5): no native addon to
      // compile on the hosting server.
      sqliteConnector: 'native',
    },
  },

  /**
   * Server-only values (secrets) are read from env vars at runtime:
   *   NUXT_MAIL_SMTP_HOST, NUXT_MAIL_SMTP_PORT, NUXT_MAIL_SMTP_SECURE,
   *   NUXT_MAIL_SMTP_USER, NUXT_MAIL_SMTP_PASS, NUXT_MAIL_FROM, NUXT_MAIL_TO, ...
   */
  runtimeConfig: {
    mail: {
      smtpHost: '',
      smtpPort: 465,
      smtpSecure: true,
      smtpUser: '',
      smtpPass: '',
      /** Sender shown on forwarded emails, e.g. "Spectravia Website <hi@spectravia.net>" */
      from: '',
      /** Comma-separated recipients of contact form submissions */
      to: siteConfig.contact.email,
      subjectPrefix: '[Spectravia website]',
    },
    contact: {
      /** Max submissions per IP within the window */
      rateLimitMax: 5,
      rateLimitWindowMinutes: 15,
    },
    public: {
      siteUrl: siteConfig.url,
    },
  },

  routeRules: {
    '/api/**': { prerender: false, cors: false },
  },
  compatibilityDate: '2026-10-01',

  nitro: {
    // Static pages are rendered at build time (fast, resilient); the Node
    // server still handles /api/* (contact form).
    prerender: {
      crawlLinks: true,
      routes: ['/', '/ar', '/sitemap.xml'],
      failOnError: false,
    },
  },

  typescript: {
    strict: true,
  },

  eslint: {
    config: { stylistic: true },
  },

  fonts: {
    defaults: { weights: [300, 400, 500, 600, 700], styles: ['normal'] },
    families: [
      { name: 'Sora', provider: 'google' },
      { name: 'IBM Plex Sans', provider: 'google' },
      { name: 'IBM Plex Sans Arabic', provider: 'google' },
    ],
  },

  i18n: {
    defaultLocale,
    locales,
    strategy: 'prefix_except_default',
    langDir: 'locales',
    baseUrl: siteConfig.url,
    detectBrowserLanguage: false,
  },

  icon: {
    serverBundle: { collections: ['lucide'] },
    clientBundle: { scan: true },
  },
})
