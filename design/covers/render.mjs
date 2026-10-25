/**
 * Renders branded case-study covers (1600x900, 16:9) to design/covers/out/*.png.
 * Usage: node design/covers/render.mjs [slug ...]
 * Copy the PNGs to public/images/case-studies/, then run `npm run images -- images/case-studies`
 * and set `cover:` in the case study's EN and AR files.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
// Playwright is a local design tool, not a project dependency
const { chromium } = require('playwright')
const lucide = require('@iconify-json/lucide/icons.json')

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'out')

function icon(name, size, stroke = 1.5) {
  const body = lucide.icons[name].body.replaceAll('stroke-width="2"', `stroke-width="${stroke}"`).replaceAll('currentColor', 'url(#ink)')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="url(#ink)" stroke-linecap="round" stroke-linejoin="round">${defs}${body}</svg>`
}

const defs = `<defs><linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e4dcff"/><stop offset="1" stop-color="#a5f3fc"/></linearGradient></defs>`

/** Each cover: main icon, an accent hue pair and a motif drawn on the right. */
const covers = {
  'ai-call-center-agent': {
    icon: 'headset',
    hues: ['#7b3eec', '#22d3ee'],
    motif: 'wave',
  },
  'ai-bag-scanning-airline': {
    icon: 'plane',
    hues: ['#3b5bdb', '#34d399'],
    motif: 'scan',
  },
  'ai-upskilling-bank': {
    icon: 'landmark',
    hues: ['#7b3eec', '#ffb57f'],
    motif: 'tracks',
  },
  'ai-voice-agent-collections': {
    icon: 'phone-call',
    hues: ['#0891b2', '#facc15'],
    motif: 'queue',
  },
}

function waveMotif() {
  // Voice waveform: symmetric bars with a spectrum gradient
  const bars = Array.from({ length: 34 }, (_, i) => {
    const t = i / 33
    const h = 40 + 300 * Math.abs(Math.sin(t * Math.PI * 3.2) * Math.sin(t * Math.PI)) + 30 * Math.sin(i * 1.7) ** 2
    return `<rect x="${i * 18}" y="${(420 - h) / 2}" width="8" height="${h}" rx="4"/>`
  }).join('')
  return `<svg class="motif" width="620" height="420" viewBox="0 0 620 420">
    <defs><linearGradient id="bars" gradientUnits="userSpaceOnUse" x1="0" x2="600">
      <stop offset="0" stop-color="#a78bfa"/><stop offset="0.35" stop-color="#60a5fa"/>
      <stop offset="0.65" stop-color="#22d3ee"/><stop offset="1" stop-color="#34d399"/></linearGradient>
      <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.15"/>
      <stop offset="0.3" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0.35"/></linearGradient>
      <mask id="m"><rect width="620" height="420" fill="url(#fade)"/></mask></defs>
    <g fill="url(#bars)" mask="url(#m)">${bars}</g></svg>`
}

function scanMotif() {
  // Viewfinder over a bag: spectrum corner brackets, a glowing scan line and a measured bounding box
  const bag = lucide.icons.luggage.body
    .replaceAll('currentColor', 'rgb(255 255 255 / .55)')
    .replaceAll('stroke-width="2"', 'stroke-width="0.6"')
  const corner = (x, y, sx, sy) => `<path d="M${x} ${y + sy * 70} V${y} H${x + sx * 70}"/>`
  const ticks = Array.from({ length: 9 }, (_, i) => `<line x1="${150 + i * 40}" y1="452" x2="${150 + i * 40}" y2="${i % 2 ? 460 : 466}"/>`).join('')
  return `<svg class="motif" width="620" height="480" viewBox="0 0 620 480">
    <defs>
      <linearGradient id="spec" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="560" y2="480">
        <stop offset="0" stop-color="#a78bfa"/><stop offset="0.4" stop-color="#60a5fa"/>
        <stop offset="0.7" stop-color="#22d3ee"/><stop offset="1" stop-color="#34d399"/></linearGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#34d399" stop-opacity="0"/><stop offset="1" stop-color="#34d399" stop-opacity=".35"/></linearGradient>
    </defs>
    <g fill="none" stroke="url(#spec)" stroke-width="5" stroke-linecap="round">
      ${corner(60, 20, 1, 1)}${corner(560, 20, -1, 1)}${corner(60, 420, 1, -1)}${corner(560, 420, -1, -1)}
    </g>
    <svg x="170" y="60" width="280" height="320" viewBox="2 1 20 22" fill="none" stroke-linecap="round" stroke-linejoin="round">${bag}</svg>
    <rect x="150" y="70" width="320" height="330" rx="10" fill="none" stroke="#34d399" stroke-opacity=".7" stroke-width="2" stroke-dasharray="10 8"/>
    <circle cx="150" cy="70" r="6" fill="#34d399"/><circle cx="470" cy="400" r="6" fill="#34d399"/>
    <rect x="60" y="170" width="500" height="90" fill="url(#beam)"/>
    <line x1="40" y1="260" x2="580" y2="260" stroke="#a7f3d0" stroke-width="3" style="filter: drop-shadow(0 0 10px #34d399)"/>
    <g stroke="rgb(255 255 255 / .35)" stroke-width="2">${ticks}</g>
  </svg>`
}

function tracksMotif() {
  // Two learning tracks rising towards a shared goal, with milestone nodes
  const a = [[40, 400], [180, 330], [320, 250], [450, 150]]
  const b = [[40, 250], [170, 300], [310, 230], [450, 150]]
  const path = pts => `M${pts[0].join(' ')} ` + pts.slice(1).map(([x, y], i) => {
    const [px, py] = pts[i]
    return `C${px + 60} ${py} ${x - 60} ${y} ${x} ${y}`
  }).join(' ')
  const nodes = (pts, c) => pts.slice(0, -1).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#0b0a1a" stroke="${c}" stroke-width="3"/>`).join('')
  return `<svg class="motif" width="760" height="588" viewBox="0 0 620 480" style="left: 720px; top: 170px">
    <defs>
      <linearGradient id="ta" gradientUnits="userSpaceOnUse" x1="40" x2="450"><stop offset="0" stop-color="#a78bfa" stop-opacity=".45"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
      <linearGradient id="tb" gradientUnits="userSpaceOnUse" x1="40" x2="450"><stop offset="0" stop-color="#ffb57f" stop-opacity=".45"/><stop offset="1" stop-color="#ffb57f"/></linearGradient>
      <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset=".5" stop-color="#60a5fa"/><stop offset="1" stop-color="#ffb57f"/></linearGradient>
    </defs>
    <g stroke="rgb(255 255 255 / .07)" stroke-width="1">${[150, 250, 350].map(y => `<line x1="20" y1="${y}" x2="600" y2="${y}"/>`).join('')}</g>
    <path d="${path(a)}" fill="none" stroke="url(#ta)" stroke-width="5" stroke-linecap="round"/>
    <path d="${path(b)}" fill="none" stroke="url(#tb)" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 11"/>
    ${nodes(a, '#a78bfa')}${nodes(b, '#ffb57f')}
    <circle cx="450" cy="150" r="58" fill="none" stroke="rgb(255 255 255 / .08)" stroke-width="10"/>
    <circle cx="450" cy="150" r="58" fill="none" stroke="url(#ring)" stroke-width="10" stroke-linecap="round"
      stroke-dasharray="${(2 * Math.PI * 58 * 0.97).toFixed(1)} 400" transform="rotate(-90 450 150)" style="filter: drop-shadow(0 0 14px rgb(167 139 250 / .6))"/>
    <circle cx="450" cy="150" r="22" fill="#fff" style="filter: drop-shadow(0 0 18px #ffb57f)"/>
  </svg>`
}

function queueMotif() {
  // Outbound call queue: glass rows, each a call the agent works through (done, live, queued)
  const states = ['done', 'done', 'live', 'queued', 'queued']
  const rows = states.map((st, i) => {
    const y = i * 92
    const live = st === 'live'
    const wave = Array.from({ length: 22 }, (_, j) => {
      const h = live ? 8 + 30 * Math.abs(Math.sin(j * 0.9) * Math.sin(j * 0.31 + 1)) : 6
      return `<rect x="${180 + j * 12}" y="${y + 40 - h / 2}" width="5" height="${h}" rx="2.5"/>`
    }).join('')
    const status = st === 'done'
      ? `<path d="M${520} ${y + 40} l9 9 l17 -18" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
      : live
        ? `<circle cx="532" cy="${y + 40}" r="9" fill="#facc15" style="filter: drop-shadow(0 0 12px #facc15)"/>`
        : `<circle cx="532" cy="${y + 40}" r="8" fill="none" stroke="rgb(255 255 255 / .3)" stroke-width="3"/>`
    return `<g opacity="${st === 'queued' ? 0.55 - (i - 3) * 0.2 : 1}" ${live ? 'transform="translate(-16 0) scale(1)"' : ''}>
      <rect x="${live ? 0 : 20}" y="${y}" width="${live ? 600 : 560}" height="80" rx="24"
        fill="rgb(255 255 255 / ${live ? 0.1 : 0.045})" stroke="rgb(255 255 255 / ${live ? 0.3 : 0.12})"/>
      <circle cx="${live ? 60 : 70}" cy="${y + 40}" r="22" fill="${live ? 'url(#av)' : 'rgb(255 255 255 / .12)'}"/>
      <rect x="${live ? 100 : 108}" y="${y + 30}" width="54" height="8" rx="4" fill="rgb(255 255 255 / .35)"/>
      <rect x="${live ? 100 : 108}" y="${y + 44}" width="36" height="6" rx="3" fill="rgb(255 255 255 / .18)"/>
      <g fill="${live ? 'url(#qw)' : 'rgb(255 255 255 / .16)'}">${wave}</g>
      ${status}
    </g>`
  }).join('')
  return `<svg class="motif" width="640" height="460" viewBox="-20 0 640 460" style="left: 760px; top: 222px">
    <defs>
      <linearGradient id="qw" gradientUnits="userSpaceOnUse" x1="180" x2="450"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#facc15"/></linearGradient>
      <linearGradient id="av" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#facc15"/></linearGradient>
    </defs>${rows}</svg>`
}

const motifs = { wave: waveMotif, scan: scanMotif, tracks: tracksMotif, queue: queueMotif }

function page({ icon: name, hues: [a, b], motif }) {
  return `<!doctype html><html><head><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1600px; height: 900px; overflow: hidden; background: #0b0a1a; position: relative; }
  .aurora { position: absolute; inset: -20%; filter: blur(90px); opacity: .9;
    background:
      radial-gradient(38% 45% at 22% 35%, ${a}cc, transparent 70%),
      radial-gradient(30% 40% at 78% 70%, ${b}88, transparent 70%),
      radial-gradient(25% 30% at 60% 15%, #ffb57f33, transparent 70%); }
  .grid { position: absolute; inset: 0;
    background-image: radial-gradient(rgb(255 255 255 / .09) 1.2px, transparent 1.3px);
    background-size: 32px 32px;
    mask-image: radial-gradient(70% 80% at 50% 50%, #000, transparent); }
  .grain { position: absolute; inset: 0; opacity: .18; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .rings { position: absolute; left: 470px; top: 450px; }
  .rings span { position: absolute; border-radius: 50%; translate: -50% -50%;
    border: 1.5px solid rgb(167 139 250 / var(--o)); width: var(--s); height: var(--s); }
  .tile { position: absolute; left: 330px; top: 310px; width: 280px; height: 280px; border-radius: 64px;
    display: grid; place-items: center;
    background: linear-gradient(145deg, rgb(255 255 255 / .16), rgb(255 255 255 / .03));
    border: 1px solid rgb(255 255 255 / .22);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / .35), 0 40px 120px -20px ${a}aa, 0 0 0 12px rgb(255 255 255 / .02);
    backdrop-filter: blur(24px); }
  .motif { position: absolute; left: 760px; top: 240px; }
  .mark { position: absolute; right: 64px; top: 56px; width: 64px; height: 64px; opacity: .9; }
  .prism { position: absolute; inset-inline: 0; bottom: 0; height: 6px;
    background: linear-gradient(90deg, #a78bfa, #60a5fa, #22d3ee, #34d399, #facc15, #f87171); }
  </style></head><body>
  <div class="aurora"></div><div class="grid"></div>
  <div class="rings">${[380, 520, 680, 860].map((s, i) => `<span style="--s:${s}px;--o:${0.32 - i * 0.07}"></span>`).join('')}</div>
  <div class="tile">${icon(name, 150)}</div>
  ${motifs[motif]()}
  <div class="grain"></div>
  </body></html>`
}

mkdirSync(out, { recursive: true })
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(covers)
const browser = await chromium.launch()
const tab = await browser.newPage({ viewport: { width: 1600, height: 900 } })
for (const slug of slugs) {
  const html = page(covers[slug])
  writeFileSync(join(out, `${slug}.html`), html)
  await tab.setContent(html)
  await tab.screenshot({ path: join(out, `${slug}.png`) })
  console.log(`rendered ${slug}`)
}
await browser.close()
