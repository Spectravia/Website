/**
 * Pitch deck shown full-screen on /deck (shareable, not linked from the site,
 * kept out of search engines).
 *
 * To replace the deck: `npm run deck -- path/to/deck.pptx`, then list one
 * entry per slide below (the slide's title, used as image alt text).
 * Page title/description and the viewer's buttons are in `i18n/locales/*.json` (`deck.*`).
 */

export const deckConfig = {
  /** Folder under public/ holding slide-01.webp, slide-02.webp, ... */
  imagesDir: 'images/deck',
  /** PDF copy under public/ (offered as a download when `showDownload` is true) */
  pdf: 'deck/spectravia-pitch-deck.pdf',
  showDownload: false,
  /** Slide size in pixels (16:9) */
  width: 1920,
  height: 1080,
  slides: [
    'Making AI work: practical adoption for your businesses',
    'The founder: 20+ years of frontier tech adoption in MEA',
    '01 · The market need',
    'The region is building for AI at scale',
    'The gap: access to AI is not the same as value from AI',
    'Five problems on the SME AI journey',
    'Why SMEs are underserved',
    '02 · Our answer',
    'Our approach: Train, Advise, Deploy, Sustain',
    'Service catalogue: six pillars, one lifecycle',
    'Signature offer: AI token economics',
    '03 · Case studies',
    'Case study: an AI voice agent for collections',
    'Case study: AI bag scanning for an airline',
    'Case study: AI upskilling for a bank',
    'How value is measured at the bank',
    'Case study: AI call-center agent',
    'The voice standard behind the AI call-center agent',
    '04 · Working with us',
    'Extending your capacity: a specialised AI services partner',
    'Next 90 days: from first conversation to first result',
    'Let us start with one conversation',
  ],
}
