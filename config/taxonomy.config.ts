/**
 * Controlled vocabularies used to classify case studies.
 *
 * Content files may only use the keys below (enforced by the schema in
 * content.config.ts). Labels are translated in `i18n/locales/*.json` under
 * `taxonomy.tags.<key>` and `taxonomy.sectors.<key>`.
 */

/** Technology / capability tags. `group` drives how chips are grouped in filters. */
export const caseStudyTags = [
  { key: 'ai', group: 'technology' },
  { key: 'xr', group: 'technology' },
  { key: 'computer-vision', group: 'technology' },
  { key: 'voice-ai', group: 'technology' },
  { key: 'training', group: 'use-case' },
  { key: 'operations', group: 'use-case' },
  { key: 'automation', group: 'use-case' },
  { key: 'remote-assistance', group: 'use-case' },
  { key: 'hse', group: 'use-case' },
  { key: 'customer-experience', group: 'use-case' },
] as const

/**
 * Sectors. `industry` links to an entry of the Industries page when one exists
 * (slug of a file in content/<locale>/industries/).
 */
export const caseStudySectors = [
  { key: 'energy', industry: 'energy' },
  { key: 'real-estate', industry: null },
  { key: 'aviation', industry: null },
  { key: 'banking', industry: 'corporate' },
  { key: 'education', industry: 'education' },
] as const

export type CaseStudyTag = (typeof caseStudyTags)[number]['key']
export type CaseStudySector = (typeof caseStudySectors)[number]['key']

export const caseStudyTagKeys = caseStudyTags.map(t => t.key) as [CaseStudyTag, ...CaseStudyTag[]]
export const caseStudySectorKeys = caseStudySectors.map(s => s.key) as [CaseStudySector, ...CaseStudySector[]]
