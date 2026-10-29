/**
 * Pitch deck helper: turns a PowerPoint file into the slide images shown on
 * /deck, plus a PDF copy for download.
 *
 * Needs LibreOffice (`soffice`) and Poppler (`pdftoppm`) on the machine.
 * Animations and transitions are not kept: each slide is its final state.
 *
 * Usage: npm run deck -- path/to/deck.pptx
 *
 * Writes public/images/deck/slide-01.webp ..., a share image (og.jpg) and
 * public/deck/<pdf name>.
 * Then update `slides` (one alt text per slide) in config/deck.config.ts.
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import sharp from 'sharp'
import { deckConfig } from '../config/deck.config.ts'

const WIDTH = 1920
const QUALITY = 86

const input = process.argv[2]
if (!input) {
  console.error('Usage: npm run deck -- path/to/deck.pptx')
  process.exit(1)
}

const root = join(import.meta.dirname, '..', 'public')
const imagesDir = join(root, deckConfig.imagesDir)
const pdfOut = join(root, deckConfig.pdf)
const work = mkdtempSync(join(tmpdir(), 'deck-'))

try {
  execFileSync('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', work, resolve(input)], { stdio: 'ignore' })
  const pdf = join(work, basename(input).replace(/\.[^.]+$/, '.pdf'))
  execFileSync('pdftoppm', ['-png', '-scale-to-x', String(WIDTH), '-scale-to-y', '-1', pdf, join(work, 'slide')])

  rmSync(imagesDir, { recursive: true, force: true })
  mkdirSync(imagesDir, { recursive: true })
  const pngs = readdirSync(work).filter(f => f.startsWith('slide') && f.endsWith('.png')).sort()
  for (const [i, png] of pngs.entries()) {
    const out = join(imagesDir, `slide-${String(i + 1).padStart(2, '0')}.webp`)
    await sharp(join(work, png)).webp({ quality: QUALITY }).toFile(out)
  }
  // Link preview image (WhatsApp, LinkedIn, email) from the first slide
  await sharp(join(work, pngs[0])).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(join(imagesDir, 'og.jpg'))

  mkdirSync(join(pdfOut, '..'), { recursive: true })
  copyFileSync(pdf, pdfOut)

  console.log(`${pngs.length} slides written to public/${deckConfig.imagesDir}, PDF to public/${deckConfig.pdf}`)
  if (pngs.length !== deckConfig.slides.length) {
    console.warn(`Update config/deck.config.ts: it lists ${deckConfig.slides.length} slides, the deck has ${pngs.length}.`)
  }
}
finally {
  rmSync(work, { recursive: true, force: true })
}
