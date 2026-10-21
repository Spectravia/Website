/**
 * Create the local, git-ignored config files from their committed templates.
 * Existing files are never overwritten.   npm run setup
 */
import { copyFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const files = [
  ['.env.example', '.env'],
  ['.env.static.example', '.env.static'],
  ['.env.deploy.example', '.env.deploy'],
  ['php/config.example.php', 'php/config.php'],
]

for (const [from, to] of files) {
  if (existsSync(join(root, to))) console.log(`  kept     ${to}`)
  else {
    copyFileSync(join(root, from), join(root, to))
    console.log(`  created  ${to}  ← fill it in`)
  }
}
