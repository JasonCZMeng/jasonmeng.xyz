// North Shore parallax scene. Scrolling moves the sun from midday through sunset to dusk while an
// airliner climbs across the sky, then the layers drift apart as the scene leaves the screen.
//
// Performance: every layer is pre-drawn once per keyframe colour and the copies are crossfaded,
// so scrolling only changes transform and opacity. Nothing is re-rasterised per frame; the
// compositor does the blending.

const W = 1600, H = 900

// Keyframes for the time of day, sampled by scroll progress (0 → 1).
// plane: [brightness, sepia] for the sunlit fuselage; trail: contrail colour and opacity.
const KEYS = [
  { at: 0, skyTop: '#5fb3e8', skyBot: '#d5ecf5', far: '#9fc3d3', near: '#173a2e', sun: '#fffdf2', glow: '#ffffff', sunX: 1400, sunY: 130, sunR: 54, stars: 0, plane: [1, 0], trail: '#ffffff', trailA: 0.85 },
  { at: 0.3, skyTop: '#8fc4e6', skyBot: '#fbe1a8', far: '#d7b08a', near: '#2e2a1f', sun: '#fff6d8', glow: '#ffe7a8', sunX: 1330, sunY: 215, sunR: 62, stars: 0, plane: [1, 0.25], trail: '#fff4dc', trailA: 0.85 },
  { at: 0.6, skyTop: '#ffd796', skyBot: '#f9935b', far: '#f2794f', near: '#2b0d1e', sun: '#fff3cf', glow: '#ffd59a', sunX: 1010, sunY: 300, sunR: 72, stars: 0, plane: [0.92, 0.5], trail: '#ffd9c2', trailA: 0.8 },
  { at: 1, skyTop: '#2e2f66', skyBot: '#f0958a', far: '#a8708f', near: '#140c26', sun: '#ffe0bd', glow: '#f0958a', sunX: 960, sunY: 420, sunR: 76, stars: 0.9, plane: [0.42, 0.2], trail: '#f6b8b2', trailA: 0.5 },
]
const COLORS = ['far', 'near', 'sun', 'glow', 'trail']

const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const RGB = KEYS.map((k) => Object.fromEntries(COLORS.map((c) => [c, hex(k[c])])))
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v) => Math.min(1, Math.max(0, v))
const span = (p, a, b) => clamp((p - a) / (b - a))
const mixA = (a, b, t) => a.map((v, i) => lerp(v, b[i], t))
const rgb = (a, b, t) => `rgb(${mixA(a, b, t).map(Math.round).join(',')})`

// Which keyframe segment p falls in, and how far along it.
function segment(p) {
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++
  return [i, clamp((p - KEYS[i].at) / (KEYS[i + 1].at - KEYS[i].at))]
}

// --- Silhouettes -------------------------------------------------------------------------------

function ridgeLine(seed, base, peaks, rough = 14, step = 8) {
  const r = rng(seed)
  const pts = []
  let n = 0
  for (let x = -40; x <= W + 40; x += step) {
    n += (r() - 0.5) * rough * 0.6; n *= 0.9
    let y = base + n
    for (const p of peaks) y -= p.h * Math.exp(-((x - p.x) ** 2) / (2 * p.w ** 2))
    pts.push([x, y])
  }
  return pts
}
const ridgePath = (pts) => `<path d="M${pts.map(([x, y]) => x + ' ' + y.toFixed(1)).join('L')}L${W + 40} ${H + 40}L-40 ${H + 40}Z"/>`
function ridgeAt(pts, x) {
  const i = Math.min(pts.length - 2, Math.max(0, Math.floor((x - pts[0][0]) / (pts[1][0] - pts[0][0]))))
  const [[x0, y0], [x1, y1]] = [pts[i], pts[i + 1]]
  return lerp(y0, y1, (x - x0) / (x1 - x0))
}
function fir(x, y, h) {
  const w = h * 0.36, tiers = 4
  const pt = (px, py) => `L${px.toFixed(1)} ${py.toFixed(1)}`
  let d = `M${x.toFixed(1)} ${(y - h).toFixed(1)}`
  for (let i = 1; i <= tiers; i++) {
    const ty = y - h + (h * i) / tiers, tw = (w * i) / tiers
    d += pt(x + tw, ty) + pt(x + tw * 0.45, ty)
  }
  d += pt(x + w * 0.1, y) + pt(x - w * 0.1, y)
  for (let i = tiers; i >= 1; i--) {
    const ty = y - h + (h * i) / tiers, tw = (w * i) / tiers
    d += pt(x - tw * 0.45, ty) + pt(x - tw, ty)
  }
  return d + 'Z'
}
function firs(seed, base, { from = -20, to = W + 20, hMin = 40, hMax = 90, gap = 18 } = {}) {
  const r = rng(seed)
  let d = ''
  for (let x = from; x < to; x += gap * (0.6 + r() * 0.8)) d += fir(x, base + 4, hMin + r() * (hMax - hMin))
  return `<rect x="-40" y="${base}" width="${W + 80}" height="${H}"/><path d="${d}"/>`
}

// Lights, collected while drawing; each switches on at its own point in dusk.
const LIGHTS = { city: [], hills: [] }
const WARM = ['#ffd27a', '#ffc867', '#ffe3a6', '#fff0cf', '#cfe0ff']

// Towers return their outline plus `roof(x)`, the roof height at x, so windows stay inside.
function tower(x, base, w, h, kind) {
  const t = base - h
  if (kind === 'harbour') {
    const cx = x + w / 2
    return {
      svg: `<rect x="${x}" y="${t}" width="${w}" height="${h + 10}"/>
        <path d="M${cx - w * 1.4} ${t - 4}Q${cx} ${t - 26} ${cx + w * 1.4} ${t - 4}L${cx + w * 1.1} ${t + 6}H${cx - w * 1.1}Z"/>
        <rect x="${cx - 1.5}" y="${t - 62}" width="3" height="40"/>`,
      roof: () => t + 8, beacon: [cx, t - 62],
    }
  }
  if (kind === 'shangri') return {
    svg: `<path d="M${x} ${base + 10}V${t + 30}L${x + w * 0.3} ${t + 18}V${t}H${x + w * 0.55}V${t + 12}L${x + w} ${t + 26}V${base + 10}Z"/>`,
    roof: (px) => { const u = (px - x) / w; return u < 0.3 ? t + 30 - 40 * u : u < 0.55 ? t : t + 12 + (14 * (u - 0.55)) / 0.45 },
    beacon: [x + w * 0.42, t],
  }
  if (kind === 'slant') return { svg: `<path d="M${x} ${base + 10}V${t + 12}L${x + w} ${t}V${base + 10}Z"/>`, roof: (px) => t + 12 - (12 * (px - x)) / w }
  return { svg: `<rect x="${x}" y="${t}" width="${w}" height="${h + 10}"/>`, roof: () => t }
}
// A window is lit only if its whole rectangle sits under the roof line, clear of the walls.
function windows(seed, x, base, w, tw) {
  const r = rng(seed)
  for (let wx = x + 3; wx + 2 <= x + w - 3; wx += 5)
    for (let wy = base - 9; wy > base - 400; wy -= 7) {
      if (wy < Math.max(tw.roof(wx), tw.roof(wx + 2)) + 5) break
      if (r() < 0.4) LIGHTS.city.push({ x: wx, y: wy, w: 2, h: 3, c: WARM[Math.floor(r() * WARM.length)], at: 0.7 + r() * 0.26 })
    }
}
function skyline(seed, base) {
  const r = rng(seed)
  const towers = []
  for (let x = 640; x < 900; ) {
    const w = 18 + r() * 24, h = 30 + r() * 70
    towers.push([x, w, tower(x, base, w, h, r() < 0.3 ? 'slant' : 'box')])
    x += w + r() * 4
  }
  towers.push([700, 22, tower(700, base, 22, 120, 'harbour')], [790, 26, tower(790, base, 26, 160, 'shangri')])
  for (const [x, w, tw] of towers) {
    windows(Math.round(x * 13), x, base, w, tw)
    if (tw.beacon) LIGHTS.city.push({ x: tw.beacon[0] - 1.5, y: tw.beacon[1] - 2, w: 3, h: 3, c: '#ff4a3d', at: 0.66 })
  }
  return towers.map(([, , tw]) => tw.svg).join('')
}
function bridge(x1, x2, deck, towerH) {
  const t1 = x1 + (x2 - x1) * 0.22, t2 = x1 + (x2 - x1) * 0.78, top = deck - towerH
  for (let x = x1; x <= x2; x += 14) LIGHTS.city.push({ x, y: deck + 1, w: 2, h: 2, c: '#fff0c2', at: 0.7 + ((x - x1) / (x2 - x1)) * 0.12 })
  for (const tx of [t1, t2]) LIGHTS.city.push({ x: tx - 1.5, y: top + 1, w: 3, h: 3, c: '#ff4a3d', at: 0.66 })
  // Main cable: anchored at each end of the deck, over both tower tops, sagging to just above mid-deck.
  return `<path fill="none" stroke="currentColor" stroke-width="2.5" d="M${x1} ${deck}Q${t1 - (t1 - x1) * 0.25} ${deck - towerH * 0.35} ${t1} ${top + 4}Q${(t1 + t2) / 2} ${deck + towerH * 0.55} ${t2} ${top + 4}Q${t2 + (x2 - t2) * 0.25} ${deck - towerH * 0.35} ${x2} ${deck}"/>
    <rect x="${x1 - 14}" y="${deck}" width="${x2 - x1 + 28}" height="7"/>
    <rect x="${t1 - 5}" y="${top}" width="10" height="${towerH + 40}"/><rect x="${t2 - 5}" y="${top}" width="10" height="${towerH + 40}"/>`
}
// North Shore homes: scattered on the lower slopes of the nearest ridge, below its skyline.
function hillLights(seed, n, pts, x1, x2) {
  const r = rng(seed)
  for (let i = 0; i < n; i++) {
    const x = x1 + r() * (x2 - x1)
    LIGHTS.hills.push({ x, y: ridgeAt(pts, x) + 14 + r() * 50, w: 2, h: 2, c: WARM[Math.floor(r() * 4)], at: 0.74 + r() * 0.22 })
  }
}
// The Lions: twin rounded granite peaks on a shared shoulder.
const lions = (x, s = 1) => [{ x: x + 45 * s, h: 70 * s, w: 70 * s }, { x, h: 120 * s, w: 18 * s }, { x: x + 95 * s, h: 108 * s, w: 16 * s }]

const shore = ridgeLine(13, 620, [{ x: 400, h: 120, w: 240 }, { x: 1100, h: 100, w: 260 }], 18)
hillLights(77, 60, shore, 60, 1540)

// Far → near. `lag` is how much a layer trails the page as the scene scrolls away (1 = stays put).
const LAYERS = [
  { lag: 0.95, svg: ridgePath(ridgeLine(5, 430, [{ x: 200, h: 140, w: 140 }, { x: 1200, h: 200, w: 180 }, { x: 1500, h: 120, w: 100 }], 10)) },
  { lag: 0.8, svg: ridgePath(ridgeLine(9, 520, [...lions(620, 1.25), { x: 250, h: 120, w: 140 }, { x: 1250, h: 140, w: 180 }], 14)) },
  { lag: 0.62, svg: ridgePath(shore), lights: LIGHTS.hills, waves: 3 },
  { lag: 0.45, svg: firs(17, 720, { hMin: 30, hMax: 60, gap: 14 }) + skyline(21, 720) + bridge(930, 1190, 690, 74), lights: LIGHTS.city, waves: 4 },
  { lag: 0.22, svg: firs(31, 820, { hMin: 70, hMax: 130, gap: 22 }) },
  { lag: 0, svg: firs(37, 900, { from: -30, to: 260, hMin: 260, hMax: 430, gap: 50 }) + firs(41, 900, { from: 1320, to: 1650, hMin: 260, hMax: 430, gap: 52 }) + `<rect x="-40" y="880" width="${W + 80}" height="40"/>` },
]
const TITLE_AFTER = 1
const LIGHTS_FROM = 0.66, LIGHTS_TO = 0.96

const svgURL = (body, fill = '#000') => `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" fill="${fill}" color="${fill}">${body}</svg>`)}')`

// Lights grouped into a few waves, each its own image, so switching them on is just opacity.
function lightWaves(list, n) {
  const groups = Array.from({ length: n }, () => [])
  for (const l of list) groups[Math.min(n - 1, Math.floor(span(l.at, LIGHTS_FROM, LIGHTS_TO) * n))].push(l)
  return groups.map((g, i) => ({
    at: LIGHTS_FROM + ((LIGHTS_TO - LIGHTS_FROM) * i) / n,
    url: svgURL(g.map((l) => `<rect x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" width="${l.w}" height="${l.h}" fill="${l.c}"/>`).join('')),
  }))
}

// --- Airliner ----------------------------------------------------------------------------------
// Seen from the ground, nose to the right: the near wing and stabiliser rise across the
// fuselage, the far ones drop below the belly. Drawn in a 400 × 140 box.

const PLANE_LEN = 210 // scene units
const PW = 400, PH = 140, ANCHOR = [200, 70]
const FUSE = 'M8 49C30 47 60 46.5 90 46.5L330 46.5C360 46.5 378 50 388 58C393 62 394 67 390 71C384 76 368 77.5 345 77.5L120 77.5C90 77.5 50 66 12 55C8 54 6 51 8 49Z'
const FIN = 'M84 47.5C72 40 52 18 38 4L20 3.5Q16 3.5 15.5 6.5L8 48.5Z'
function cabinWindows() {
  let s = ''
  for (let x = 110; x < 326; x += 7.2) if (x < 196 || x > 222) s += `<rect x="${x.toFixed(1)}" y="55.5" width="3.4" height="4.8" rx="1.6"/>`
  return s
}
const PLANE_SVG = `<svg viewBox="0 0 ${PW} ${PH}" aria-hidden="true">
  <defs>
    <linearGradient id="pl-fuse" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f6f9"/><stop offset=".22" stop-color="#fff"/><stop offset=".55" stop-color="#e3e8ee"/><stop offset=".8" stop-color="#b3bcc7"/><stop offset="1" stop-color="#7f8a97"/>
    </linearGradient>
    <linearGradient id="pl-belly" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3f6e"/><stop offset="1" stop-color="#121d38"/></linearGradient>
    <linearGradient id="pl-fin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c2f5c"/><stop offset=".6" stop-color="#2c4580"/><stop offset="1" stop-color="#16244a"/></linearGradient>
    <linearGradient id="pl-wing" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#cfd6de"/><stop offset=".5" stop-color="#aab3bf"/><stop offset="1" stop-color="#8b95a3"/></linearGradient>
    <linearGradient id="pl-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c8795"/><stop offset="1" stop-color="#5d6775"/></linearGradient>
    <linearGradient id="pl-nacelle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eef1f5"/><stop offset=".35" stop-color="#fff"/><stop offset=".7" stop-color="#c3cad3"/><stop offset="1" stop-color="#6c7784"/>
    </linearGradient>
    <linearGradient id="pl-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a7a9e"/><stop offset=".5" stop-color="#1a2532"/><stop offset="1" stop-color="#0d141c"/></linearGradient>
    <clipPath id="pl-fuse-clip"><path d="${FUSE}"/></clipPath>
    <clipPath id="pl-fin-clip"><path d="${FIN}"/></clipPath>
  </defs>
  <path d="M76 58L46 72H33L44 58Z" fill="url(#pl-far)"/>
  <path d="M238 70L168 101L148 101L172 70Z" fill="url(#pl-far)"/>
  <path d="M168 101L162 110H156L148 101Z" fill="#56606d"/>
  <path d="M214 84L200 82L206 89Z" fill="#6c7683"/>
  <path d="M203 85L234 84Q242 84 242 91Q242 98 234 98L205 97Q199 95 199 91Q199 87 203 85Z" fill="url(#pl-far)"/>
  <path d="M199 87.5L191 89.5V92.5L199 94.5Z" fill="#3c444f"/>
  <path d="${FIN}" fill="url(#pl-fin)"/>
  <g clip-path="url(#pl-fin-clip)" fill="none" stroke-linecap="round">
    <path d="M2 44C30 36 52 22 64 -2" stroke="#f9935b" stroke-width="7"/>
    <path d="M-6 40C24 30 44 16 54 -4" stroke="#ffd796" stroke-width="3"/>
    <path d="M38 4L84 47.5" stroke="#fff" stroke-opacity=".25" stroke-width="1.5"/>
  </g>
  <path d="${FUSE}" fill="url(#pl-fuse)"/>
  <g clip-path="url(#pl-fuse-clip)">
    <path d="M0 69.5H400V90H0Z" fill="url(#pl-belly)"/>
    <path d="M0 67.4H400V69.2H0Z" fill="#f9935b"/>
    <path d="M60 49.5H340" stroke="#fff" stroke-width="1.6" stroke-opacity=".9"/>
    <path d="M100 46V78M128 46V78M150 46V78M256 46V78M300 46V78" stroke="#1b2633" stroke-opacity=".14" stroke-width=".5"/>
    <path d="M150 77.5Q200 84 258 77.5Z" fill="#0f1830"/>
  </g>
  <g fill="#1f2a37">${cabinWindows()}</g>
  <g fill="none" stroke="#8d97a3" stroke-width=".6">
    <rect x="336" y="51.5" width="8.5" height="16" rx="2"/><rect x="200" y="54" width="6" height="10" rx="1.5"/><rect x="211" y="54" width="6" height="10" rx="1.5"/><rect x="96" y="52" width="8" height="15" rx="2"/>
  </g>
  <path d="M352 53L362.5 52.6L362.5 57.8L349.5 58.2Z" fill="url(#pl-glass)"/>
  <path d="M364.5 52.6L372.5 53.5L379 58L364.5 57.8Z" fill="url(#pl-glass)"/>
  <path d="M8 49C7 51 7.5 53 9.5 54.5L4 52.5Z" fill="#59636f"/>
  <path d="M76 58L46 44H34L44 58.5Z" fill="url(#pl-wing)"/>
  <path d="M240 74L168 42L148 42L172 75Z" fill="url(#pl-wing)"/>
  <path d="M240 74L168 42L170 41L242 72.5Z" fill="#e9edf2"/>
  <path d="M168 42L160 30H154L148 42Z" fill="url(#pl-fin)"/>
  <g fill="#7d8794">
    <path d="M186 64Q176 63.5 168 65.5Q176 67 186 66Z"/><path d="M172 53Q162 52.5 155 54.5Q162 56 172 55Z"/><path d="M159 46.5Q151 46 146 47.5Q151 49 159 48.5Z"/>
  </g>
  <path d="M228 66L214 60L202 61L207 67Z" fill="#b9c1cb"/>
  <path d="M201 64.5L238 63.5Q248 63.5 248 72Q248 80.5 238 80.5L203 79.5Q196 76.5 196 72Q196 67.5 201 64.5Z" fill="url(#pl-nacelle)"/>
  <path d="M232 63.8Q235 72 232 80.2" stroke="#f9935b" stroke-width="1.2" fill="none"/>
  <ellipse cx="246.5" cy="72" rx="2.4" ry="8" fill="#dfe4ea" stroke="#9aa3ae" stroke-width=".6"/>
  <path d="M197 67.5L187 70.2V73.8L197 76.5Z" fill="#4d5560"/>
  <path d="M187 70.2L182 71.6V72.4L187 73.8Z" fill="#2f363f"/>
</svg>`
// Lamps sit outside the drawing's filter so they stay bright at dusk. Positions in drawing units.
const LAMPS = [
  ['beacon', 232, 46, '#ff3b30'], ['beacon', 214, 80.5, '#ff3b30'],
  ['nav', 158, 31, '#3cff7a'], ['strobe', 155, 30, '#ffffff'], ['strobe', 6, 51, '#ffffff'],
  ['landing', 247, 74, '#fff6e0'],
]
// Contrails from both engines: long soft wedges that grow from where the plane came in.
const TRAILS = [[183, 72], [190, 91]]
const TRAIL_LEN = 760 // scene units
// Flight path in scene x; its height is set from the title in measure() so it always passes just below it.
const PATH = { x0: -260, x1: 1880, climb: 44 }
const FIN_TOP = 67 // drawing units from the anchor up to the fin tip

export function initScene(root) {
  const stage = root.querySelector('[data-stage]')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const r = rng(99)
  const stars = Array.from({ length: 140 }, () => `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 520).toFixed(0)}" r="${(r() * 1.4 + 0.3).toFixed(2)}" fill="#fff" opacity="${(r() * 0.8 + 0.2).toFixed(2)}"/>`).join('')

  let html = `<div class="layer" data-lag="1">
    ${KEYS.map((k, j) => `<div class="fill sky" data-key="${j}" style="background:linear-gradient(${k.skyTop} 45%, ${k.skyBot})"></div>`).join('')}
    <div class="fill art" data-stars style="background-image:${svgURL(stars)}"></div>
    <div class="glow" data-glow>${KEYS.map((k, j) => `<div class="fill" data-key="${j}" data-cross style="background:radial-gradient(closest-side, ${k.glow}8c, ${k.glow}00)"></div>`).join('')}</div>
    <div class="sun" data-sun></div>
  </div>`
  // In front of the far ridges and behind the title.
  const planeLayer = `<div class="layer" data-lag="0.75">
    <div class="plane" data-plane>
      ${TRAILS.map(() => '<div class="trail" data-trail></div>').join('')}
      <div class="craft" data-craft>${PLANE_SVG}
        ${LAMPS.map(([kind, x, y, c]) => `<i class="lamp ${kind}" style="left:${((x / PW) * 100).toFixed(2)}%;top:${((y / PH) * 100).toFixed(2)}%;--c:${c}"></i>`).join('')}
      </div>
    </div>
  </div>`
  const waves = []
  LAYERS.forEach((l, i) => {
    const lw = l.lights ? lightWaves(l.lights, l.waves) : []
    waves.push(...lw)
    const m = Math.pow(i / (LAYERS.length - 1), 1.15)
    const tones = RGB.map((c) => svgURL(l.svg, rgb(c.far, c.near, m)))
    html += `<div class="layer" data-lag="${l.lag}">${tones.map((url, j) => `<div class="fill art" data-key="${j}" style="background-image:${url}"></div>`).join('')}
      ${lw.map((g) => `<div class="fill art" data-light style="background-image:${g.url}"></div>`).join('')}</div>`
    if (i === TITLE_AFTER) html += planeLayer + `<div class="title" data-lag="${(l.lag + LAYERS[i + 1].lag) / 2}">
      <div class="title-shade" data-shade aria-hidden="true"><b>Jason Meng</b><p>Vancouver, BC</p></div>
      <h1>Jason Meng</h1><p>Vancouver, BC</p></div>`
  })
  stage.innerHTML = html

  const $ = (s) => [...stage.querySelectorAll(s)]
  const keyed = $('[data-key]').map((el) => [el, Number(el.dataset.key), el.hasAttribute('data-cross')]), lights = $('[data-light]'), trails = $('[data-trail]'), lamps = $('.lamp')
  const movers = $('[data-lag]'), lags = movers.map((m) => Number(m.dataset.lag))
  const [sun] = $('[data-sun]'), [glow] = $('[data-glow]'), [starsEl] = $('[data-stars]'), [shade] = $('[data-shade]')
  const [plane] = $('[data-plane]'), [craft] = $('[data-craft]'), planeArt = craft.querySelector('svg'), [subtitle] = $('.title > p')

  // Layout is read only here (on resize), never inside the frame loop.
  let top = 0, travel = 1, k = 1, ox = 0, oy = 0, painted = -1, y0 = 0, y1 = 0, angle = 0
  function measure() {
    top = root.getBoundingClientRect().top + scrollY
    travel = Math.max(1, root.offsetHeight - innerHeight)
    const w = stage.clientWidth, h = stage.clientHeight
    k = Math.max(w / W, h / H)
    ox = (w - W * k) / 2; oy = h - H * k
    const u = (PLANE_LEN / PW) * Math.min(k, w / 640) // smaller on phones, where the scene is cropped
    Object.assign(craft.style, { width: `${PW * u}px`, height: `${PH * u}px`, left: `${-ANCHOR[0] * u}px`, top: `${-ANCHOR[1] * u}px` })
    trails.forEach((tr, i) => {
      const [tx, ty] = TRAILS[i], th = (8 + i * 4) * k
      Object.assign(tr.style, { width: `${TRAIL_LEN * k}px`, height: `${th}px`, left: `${(tx - ANCHOR[0]) * u - TRAIL_LEN * k}px`, top: `${(ty - ANCHOR[1]) * u - th / 2}px` })
    })
    // Fin tip clears the subtitle at the end of the climb; the plane starts a little lower.
    const below = subtitle.offsetParent.offsetTop + subtitle.offsetTop + subtitle.offsetHeight
    y1 = below + 14 + FIN_TOP * u; y0 = y1 + PATH.climb * k
    angle = (Math.atan2(y1 - y0, (PATH.x1 - PATH.x0) * k) * 180) / Math.PI
    glow.style.width = glow.style.height = `${440 * k}px`
    painted = -1
  }

  const target = () => (reduced ? 0.6 : clamp((scrollY - top) / travel))
  let p = target()
  // Colours, sun and lights; runs only when progress has moved.
  function paint() {
    const [i, t] = segment(p), a = RGB[i], b = RGB[i + 1], A = KEYS[i], B = KEYS[i + 1]
    const n = (key) => lerp(A[key], B[key], t)
    // Copy i is fully on and copy i + 1 fades in over it: an exact colour blend, done by the compositor.
    // Translucent glows fade out as the next fades in, so they don't stack up brighter.
    for (const [el, j, cross] of keyed) el.style.opacity = j === i ? (cross ? 1 - t : 1).toFixed(3) : j === i + 1 ? t.toFixed(3) : 0
    const sx = ox + n('sunX') * k, sy = oy + n('sunY') * k
    // The disc is resized rather than scaled, so it is always drawn crisp at its real size.
    const sr = n('sunR') * k
    sun.style.width = sun.style.height = `${(sr * 2).toFixed(1)}px`
    sun.style.transform = `translate3d(${(sx - sr).toFixed(1)}px, ${(sy - sr).toFixed(1)}px, 0)`
    sun.style.backgroundColor = rgb(a.sun, b.sun, t)
    glow.style.transform = `translate3d(${(sx - 220 * k).toFixed(1)}px, ${(sy - 220 * k).toFixed(1)}px, 0)`
    starsEl.style.opacity = n('stars').toFixed(3)
    shade.style.opacity = (1 - p * 0.68).toFixed(3)
    lights.forEach((el, j) => (el.style.opacity = span(p, waves[j].at, waves[j].at + 0.035).toFixed(3)))
    planeArt.style.filter = `brightness(${lerp(A.plane[0], B.plane[0], t).toFixed(3)}) sepia(${lerp(A.plane[1], B.plane[1], t).toFixed(3)})`
    const glowing = (0.3 + span(p, 0.45, 0.9) * 0.7).toFixed(3)
    lamps.forEach((l) => (l.style.opacity = glowing))
    for (const tr of trails) {
      tr.style.setProperty('--c', rgb(a.trail, b.trail, t))
      tr.style.opacity = n('trailA').toFixed(3)
    }
  }
  // Scroll sets where the plane is along its climb; time adds a slight bob and pitch.
  function fly(now) {
    const q = reduced ? 0.45 : span(p, 0.03, 0.97)
    const x = lerp(PATH.x0, PATH.x1, q), t = now / 1000
    plane.style.transform = `translate3d(${(ox + x * k).toFixed(1)}px, ${lerp(y0, y1, q).toFixed(1)}px, 0) rotate(${angle.toFixed(2)}deg)`
    plane.style.visibility = q > 0 && q < 1 ? 'visible' : 'hidden'
    if (!reduced) craft.style.transform = `translate3d(0, ${(Math.sin(t * 0.9) * 1.6 * k).toFixed(2)}px, 0) rotate(${(Math.sin(t * 0.6 + 1) * 0.5).toFixed(2)}deg)`
    const grown = clamp(((x - PATH.x0) * 0.9) / TRAIL_LEN)
    for (const tr of trails) tr.style.transform = `scaleX(${grown.toFixed(4)})`
    return q > 0 && q < 1
  }

  let running = false, visible = true, last = 0, lastExit = -1
  function tick(now) {
    const dt = Math.min(64, now - (last || now)); last = now
    const goal = target()
    // Ease the displayed progress toward the scroll position so wheel steps glide instead of jump.
    p = reduced || Math.abs(goal - p) < 0.0005 ? goal : p + (goal - p) * (1 - Math.exp(-dt / 110))
    if (p !== painted) { paint(); painted = p }
    const exit = reduced ? 0 : Math.max(0, scrollY - top - travel)
    if (exit !== lastExit) {
      movers.forEach((m, j) => (m.style.transform = `translate3d(0, ${(exit * lags[j]).toFixed(1)}px, 0)`))
      lastExit = exit
    }
    const flying = fly(now)
    running = visible && (p !== goal || (flying && !reduced))
    if (running) requestAnimationFrame(tick)
    else last = 0
  }
  const wake = () => { if (!running && visible) { running = true; requestAnimationFrame(tick) } }

  measure()
  new ResizeObserver(() => { measure(); wake() }).observe(root)
  addEventListener('resize', () => { measure(); wake() })
  addEventListener('scroll', wake, { passive: true })
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake() }).observe(stage)
  wake()
}
