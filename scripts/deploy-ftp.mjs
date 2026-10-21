/**
 * Build the static site (HTML) and upload it, plus the PHP contact endpoint,
 * to the hosting over FTP/FTPS.
 *
 *   npm run deploy                  build + upload
 *   npm run deploy -- --dry-run     build + list what would be uploaded
 *   npm run deploy -- --skip-build  upload the existing .output/public
 *   npm run deploy -- --allow-dirty deploy even with uncommitted changes
 *
 * Rule: only committed work is deployed, so the live site always matches git.
 *
 * Credentials: .env.deploy (git-ignored, see .env.deploy.example).
 * Build settings (contact endpoint, reCAPTCHA site key): .env.static (git-ignored).
 * SMTP/reCAPTCHA secrets for PHP: php/config.php (git-ignored), uploaded to api/.
 * First time on a machine: `npm run setup`.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { Client } from 'basic-ftp'

const root = resolve(import.meta.dirname, '..')
const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')

function loadEnv(file) {
  const path = join(root, file)
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return env
}

function fail(message) {
  console.error(`\nERROR: ${message}`)
  process.exit(1)
}

const cfg = { ...loadEnv('.env.deploy'), ...process.env }
for (const key of ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD']) {
  if (!cfg[key]) fail(`Missing ${key}. Run "npm run setup", then fill in .env.deploy.`)
}
const secure = (cfg.FTP_SECURE ?? 'true') !== 'false'
const remoteRoot = cfg.FTP_REMOTE_DIR || '/public_html'

/* ---------- 1. only deploy committed work ---------- */
if (!args.has('--allow-dirty')) {
  const status = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' })
  if (status.status === 0 && status.stdout.trim()) {
    fail(`Uncommitted changes - commit them first so the live site matches git:\n\n${status.stdout}`)
  }
}

/* ---------- 2. build ---------- */
const publicDir = join(root, '.output', 'public')
if (!args.has('--skip-build')) {
  if (!existsSync(join(root, '.env.static'))) {
    fail('Missing .env.static. Run "npm run setup" first.')
  }
  console.log('> Building static site...')
  const build = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true })
  if (build.status !== 0) fail('Build failed.')
}
if (!existsSync(join(publicDir, 'index.html'))) fail('.output/public/index.html not found - build first.')

/* ---------- 2b. SEO gate ---------- */
const seo = spawnSync('node', [join(root, 'scripts', 'seo-check.mjs')], { stdio: 'inherit' })
if (seo.status !== 0) fail('SEO check failed - fix the errors above (or run "npm run seo:check").')

/* ---------- 3. collect files: [localPath, remotePath] ---------- */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}
const toRemote = (base, file, prefix = '') =>
  `${remoteRoot}/${prefix}${relative(base, file).split(sep).join('/')}`.replace(/\/+/g, '/')

const uploads = walk(publicDir).map(f => [f, toRemote(publicDir, f)])

const phpDir = join(root, 'php')
for (const f of walk(phpDir)) {
  if (relative(phpDir, f) !== 'config.example.php') uploads.push([f, toRemote(phpDir, f, 'api/')])
}
if (!existsSync(join(phpDir, 'config.php'))) {
  console.warn('WARNING: php/config.php not found - the contact form will return 500 until SMTP config exists on the server.')
}

console.log(`> ${uploads.length} files -> ${cfg.FTP_HOST}:${remoteRoot}`)
if (dryRun) {
  for (const [, remote] of uploads) console.log('  ' + remote)
  console.log('\nDry run: nothing uploaded.')
  process.exit(0)
}

/* ---------- 4. upload ---------- */
const client = new Client(60_000)
try {
  await client.access({
    host: cfg.FTP_HOST,
    port: Number(cfg.FTP_PORT || 21),
    user: cfg.FTP_USER,
    password: cfg.FTP_PASSWORD,
    secure,
    secureOptions: { rejectUnauthorized: false }, // shared hosting certs often name the server, not your domain
  })
  const made = new Set()
  let done = 0
  for (const [local, remote] of uploads) {
    const dir = remote.slice(0, remote.lastIndexOf('/')) || '/'
    if (!made.has(dir)) {
      await client.ensureDir(dir)
      made.add(dir)
    }
    await client.uploadFrom(local, remote)
    if (++done % 25 === 0 || done === uploads.length) console.log(`  ${done}/${uploads.length}`)
  }
  console.log('\nDeployed.')
}
catch (error) {
  fail(`FTP error: ${error.message}`)
}
finally {
  client.close()
}
