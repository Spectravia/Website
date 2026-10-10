import type { CollectionItem } from '~/composables/useLocalizedContent'

type Page = CollectionItem<'pages'>
export type PageSection = NonNullable<Page['sections']>[number]

/** Look up a named section of a page's structured content. */
export function findSection(page: Page | null | undefined, id: string): PageSection | undefined {
  return page?.sections?.find(section => section.id === id)
}
