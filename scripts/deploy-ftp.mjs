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
// Tolerate pasted values like "ftp://host:21/"
const hostMatch = String(cfg.FTP_HOST).trim().match(/^(?:[a-z]+:\/\/)?([^/:]+)(?::(\d+))?\/?$/i)
if (!hostMatch) fail('FTP_HOST looks invalid. Use just the host name or IP, e.g. ftp.example.com')
const ftpHost = hostMatch[1]
const ftpPort = Number(cfg.FTP_PORT || hostMatch[2] || 21)
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

// _headers is Netlify-only (noindex for the preview copy); never upload it to the live site
const uploads = walk(publicDir)
  .filter(f => relative(publicDir, f) !== '_headers')
  .map(f => [f, toRemote(publicDir, f)])

const phpDir = join(root, 'php')
for (const f of walk(phpDir)) {
  if (relative(phpDir, f) !== 'config.example.php') uploads.push([f, toRemote(phpDir, f, 'api/')])
}
if (!existsSync(join(phpDir, 'config.php'))) {
  console.warn('WARNING: php/config.php not found - the contact form will return 500 until SMTP config exists on the server.')
}

console.log(`> ${uploads.length} files -> ${ftpHost}:${remoteRoot}`)
if (dryRun) {
  for (const [, remote] of uploads) console.log('  ' + remote)
  console.log('\nDry run: nothing uploaded.')
  process.exit(0)
}

/* ---------- 4. upload (reconnects and resumes if the server drops the connection) ---------- */
const MAX_RECONNECTS = 8
let next = 0
let reconnects = 0
const madeDirs = new Set()

async function connect() {
  const client = new Client(60_000)
  await client.access({
    host: ftpHost,
    port: ftpPort,
    user: cfg.FTP_USER,
    password: cfg.FTP_PASSWORD,
    secure,
    secureOptions: { rejectUnauthorized: false }, // shared hosting certs often name the server, not your domain
  })
  madeDirs.clear() // a new session starts in the login folder
  return client
}

while (next < uploads.length) {
  let client
  try {
    client = await connect()
    while (next < uploads.length) {
      const [local, remote] = uploads[next]
      const dir = remote.slice(0, remote.lastIndexOf('/')) || '/'
      if (!madeDirs.has(dir)) {
        await client.ensureDir(dir)
        madeDirs.add(dir)
      }
      await client.uploadFrom(local, remote)
      next++
      if (next % 25 === 0 || next === uploads.length) console.log(`  ${next}/${uploads.length}`)
    }
  }
  catch (error) {
    if (error.code === 530 || /login|530/i.test(error.message) || ++reconnects > MAX_RECONNECTS) {
      fail(`FTP error: ${error.message}`)
    }
    console.warn(`  connection lost (${error.message}) - reconnecting and resuming at file ${next + 1}/${uploads.length}...`)
    await new Promise(r => setTimeout(r, 2000))
  }
  finally {
    client?.close()
  }
}
console.log('\nDeployed.')
