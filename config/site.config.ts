/**
 * Central, non-secret site configuration.
 *
 * Everything that is "parametric" about the site (brand, contact details,
 * navigation, social links, SEO defaults) lives here. Secrets (SMTP
 * credentials, recipients) live in environment variables — see `.env.example`.
 *
 * Labels are i18n keys (see `i18n/locales/*.json`), never hard-coded text.
 */

export interface NavItem {
  /** i18n key for the label */
  label: string
  /** Route path without locale prefix */
  to: string
}

export interface SocialLink {
  label: string
  /** Any lucide icon name, e.g. `lucide:linkedin` */
  icon: string
  href: string
}

export const siteConfig = {
  name: 'Spectravia',
  /** Canonical production URL, no trailing slash (overridable via NUXT_PUBLIC_SITE_URL) */
  url: 'https://spectravia.net',

  brand: {
    /** Full logo (mark + wordmark + tagline). Replace the file to rebrand. */
    logo: '/images/brand/spectravia-logo.svg',
    /** Compact horizontal logo used in the header */
    logoCompact: '/images/brand/spectravia-logo-compact.svg',
    /** Square mark used for favicon / social cards */
    mark: '/images/brand/spectravia-mark.svg',
    /** Default social share image (1200x630 recommended) */
    ogImage: '/images/brand/og-default.jpg',
    themeColor: '#0B0A1A',
  },

  contact: {
    email: 'hi@spectravia.net',
    phone: '',
    /** i18n key for the address / region line */
    region: 'footer.region',
  },

  /** Primary navigation (header) */
  nav: [
    { label: 'nav.home', to: '/' },
    { label: 'nav.services', to: '/services' },
    { label: 'nav.industries', to: '/industries' },
    { label: 'nav.partners', to: '/partners' },
    { label: 'nav.about', to: '/about' },
  ] satisfies NavItem[],

  /** Call-to-action shown in the header */
  headerCta: { label: 'nav.contact', to: '/contact' } satisfies NavItem,

  /** Footer link columns */
  footer: {
    columns: [
      {
        title: 'footer.company',
        links: [
          { label: 'nav.about', to: '/about' },
          { label: 'nav.services', to: '/services' },
          { label: 'nav.industries', to: '/industries' },
          { label: 'nav.contact', to: '/contact' },
        ],
      },
      {
        title: 'footer.partners',
        links: [
          { label: 'partners.fifthingenium', to: '/partners/fifthingenium' },
          { label: 'partners.blippar', to: '/partners/blippar' },
          { label: 'partners.nextworld', to: '/partners/nextworld' },
          { label: 'partners.rpm', to: '/partners/rpm' },
        ],
      },
    ] satisfies { title: string, links: NavItem[] }[],
    legal: [
      { label: 'nav.privacy', to: '/privacy' },
    ] satisfies NavItem[],
  },

  social: [
    // { label: 'LinkedIn', icon: 'lucide:linkedin', href: 'https://www.linkedin.com/company/spectravia' },
  ] as SocialLink[],

  /** Contact form behaviour (client side). Server limits are in runtimeConfig. */
  contactForm: {
    messageMaxLength: 4000,
    /** Topics offered in the form; values are i18n keys under `contact.topics` */
    topics: ['general', 'xr', 'ai', 'platforms', 'partnership'],
  },
} as const

export type SiteConfig = typeof siteConfig
