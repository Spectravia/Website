/**
 * Case-study taxonomy helpers: translated labels and links for tags/sectors
 * defined in `config/taxonomy.config.ts`.
 */
import { caseStudySectors, caseStudyTags } from '../../config/taxonomy.config'
import type { CaseStudySector, CaseStudyTag } from '../../config/taxonomy.config'

export function useTaxonomy() {
  const { t } = useI18n()

  const tagLabel = (key: CaseStudyTag) => t(`taxonomy.tags.${key}`)
  const sectorLabel = (key: CaseStudySector) => t(`taxonomy.sectors.${key}`)

  /** Industries-page anchor for a sector, when the sector maps to an industry. */
  const sectorIndustry = (key: CaseStudySector) =>
    caseStudySectors.find(s => s.key === key)?.industry ?? null

  return { tags: caseStudyTags, sectors: caseStudySectors, tagLabel, sectorLabel, sectorIndustry }
}
