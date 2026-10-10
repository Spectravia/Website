/**
 * Image optimisation helper.
 *
 * Converts raster images under public/images to WebP (max width 1600px),
 * writing `<name>.webp` next to the source. Sources are kept so they can be
 * re-processed; reference the .webp files from content.
 *
 * Usage: npm run images            (all images)
 *        npm run images -- <dir>   (only a sub-folder of public/images)
 */
import { readdir, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import sharp from 'sharp'

const ROOT = join(import.meta.dirname, '..', 'public', 'images')
const MAX_WIDTH = 1600
const QUALITY = 80
const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg'])

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (SOURCE_EXT.has(extname(entry.name).toLowerCase())) yield path
  }
}

const target = process.argv[2] ? join(ROOT, process.argv[2]) : ROOT

for await (const file of walk(target)) {
  const out = file.slice(0, -extname(file).length) + '.webp'
  const before = (await stat(file)).size
  await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out)
  const after = (await stat(out)).size
  console.log(`${relative(ROOT, out)}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
}
