/**
 * Content model.
 *
 * Every collection exists once per locale (`<name>_<locale>`), sourced from
 * `content/<locale>/<folder>/`. Pages query them through
 * `useLocalizedCollection()` which falls back to English when a translation
 * is missing.
 */
import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { contentLocales } from './config/i18n.config'

/* ---------- shared schema pieces ---------- */

const link = z.object({
  label: z.string(),
  to: z.string(),
})

const item = z.object({
  title: z.string(),
  text: z.string().optional(),
  icon: z.string().optional(),
  to: z.string().optional(),
})

const section = z.object({
  id: z.string(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  lead: z.string().optional(),
  /** Paragraphs separated by a blank line */
  text: z.string().optional(),
  image: z.string().optional(),
  items: z.array(item).optional(),
  cta: link.optional(),
})

const media = z.object({
  type: z.enum(['video', 'image']),
  /** `vimeo` | `youtube` embed by id, `file` for a self-hosted url, `placeholder` until provided */
  provider: z.enum(['vimeo', 'youtube', 'file', 'placeholder']).default('placeholder'),
  id: z.string().optional(),
  src: z.string().optional(),
  title: z.string(),
  caption: z.string().optional(),
})

/* ---------- collection definitions ---------- */

const definitions = (locale: string) => ({
  /** Structured copy for the main pages (home, services, about, ...) */
  [`pages_${locale}`]: defineCollection({
    type: 'data',
    source: `${locale}/pages/*.yml`,
    schema: z.object({
      title: z.string(),
      description: z.string(),
      hero: z.object({
        eyebrow: z.string().optional(),
        title: z.string(),
        highlight: z.string().optional(),
        lead: z.string().optional(),
        primaryCta: link.optional(),
        secondaryCta: link.optional(),
      }),
      sections: z.array(section).default([]),
    }),
  }),

  /** Service lines */
  [`services_${locale}`]: defineCollection({
    type: 'data',
    source: `${locale}/services/*.yml`,
    schema: z.object({
      slug: z.string(),
      order: z.number().default(100),
      icon: z.string(),
      title: z.string(),
      summary: z.string(),
      text: z.string(),
      features: z.array(z.string()).default([]),
      image: z.string().optional(),
      partners: z.array(z.string()).default([]),
    }),
  }),

  /** Industries / sectors */
  [`industries_${locale}`]: defineCollection({
    type: 'data',
    source: `${locale}/industries/*.yml`,
    schema: z.object({
      slug: z.string(),
      order: z.number().default(100),
      icon: z.string(),
      title: z.string(),
      summary: z.string(),
      challenges: z.array(z.string()).default([]),
      solutions: z.array(z.string()).default([]),
      partners: z.array(z.string()).default([]),
    }),
  }),

  /** Team members */
  [`team_${locale}`]: defineCollection({
    type: 'data',
    source: `${locale}/team/*.yml`,
    schema: z.object({
      name: z.string(),
      order: z.number().default(100),
      roles: z.array(z.string()),
      /** Path under /public; leave empty to show the initials placeholder */
      photo: z.string().optional(),
      linkedin: z.string().optional(),
      bio: z.string(),
    }),
  }),

  /** Partner detail pages (Markdown body + structured frontmatter) */
  [`partners_${locale}`]: defineCollection({
    type: 'page',
    source: { include: `${locale}/partners/*.md`, prefix: '/partners' },
    schema: z.object({
      name: z.string(),
      order: z.number().default(100),
      tagline: z.string(),
      summary: z.string(),
      logo: z.string(),
      /** Logo artwork is dark-on-light: render it on a light tile */
      logoOnLight: z.boolean().default(false),
      website: z.string(),
      industries: z.array(z.string()).default([]),
      highlights: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      solutions: z.array(z.object({
        name: z.string(),
        audience: z.string().optional(),
        icon: z.string().optional(),
        logo: z.string().optional(),
        image: z.string().optional(),
        text: z.string(),
        features: z.array(z.string()).default([]),
        link: z.string().optional(),
      })).default([]),
      media: z.array(media).default([]),
    }),
  }),

  /** Free-form Markdown pages served by the catch-all route (privacy, ...) */
  [`docs_${locale}`]: defineCollection({
    type: 'page',
    source: { include: `${locale}/docs/*.md`, prefix: '/' },
    schema: z.object({
      updated: z.string().optional(),
    }),
  }),
})

export default defineContentConfig({
  collections: Object.assign({}, ...contentLocales.map(definitions)),
})
