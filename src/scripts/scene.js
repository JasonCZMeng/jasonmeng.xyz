// North Shore parallax scene. Scrolling moves the sun from midday through sunset to dusk,
// then the layers drift apart at different speeds as the scene leaves the screen.

const W = 1600, H = 900, BOTTOM = 4000

// Keyframes for the time of day, sampled by scroll progress (0 → 1).
const KEYS = [
  { at: 0, skyTop: '#5fb3e8', skyBot: '#d5ecf5', far: '#9fc3d3', near: '#173a2e', sun: '#fffdf2', glow: '#ffffff', title: '#ffffff', sunX: 1400, sunY: 130, sunR: 54, stars: 0 },
  { at: 0.3, skyTop: '#8fc4e6', skyBot: '#fbe1a8', far: '#d7b08a', near: '#2e2a1f', sun: '#fff6d8', glow: '#ffe7a8', title: '#fffaf0', sunX: 1330, sunY: 215, sunR: 62, stars: 0 },
  { at: 0.6, skyTop: '#ffd796', skyBot: '#f9935b', far: '#f2794f', near: '#2b0d1e', sun: '#fff3cf', glow: '#ffd59a', title: '#fff4e6', sunX: 1010, sunY: 300, sunR: 72, stars: 0 },
  { at: 1, skyTop: '#2e2f66', skyBot: '#f0958a', far: '#a8708f', near: '#140c26', sun: '#ffe0bd', glow: '#f0958a', title: '#fff1ec', sunX: 960, sunY: 420, sunR: 76, stars: 0.9 },
]
const COLOR_KEYS = ['skyTop', 'skyBot', 'far', 'near', 'sun', 'glow', 'title']

const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)

function sample(p) {
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++
  const a = KEYS[i], b = KEYS[i + 1]
  const t = smooth(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))))
  const out = {}
  for (const k of COLOR_KEYS) out[k] = mix(a[k], b[k], t)
  for (const k of ['sunX', 'sunY', 'sunR', 'stars']) out[k] = lerp(a[k], b[k], t)
  return out
}

function ridge(seed, base, peaks, rough = 14, step = 8) {
  const r = rng(seed)
  let n = 0, d = ''
  for (let x = -40; x <= W + 40; x += step) {
    n += (r() - 0.5) * rough * 0.6; n *= 0.9
    let y = base + n
    for (const p of peaks) y -= p.h * Math.exp(-((x - p.x) ** 2) / (2 * p.w ** 2))
    d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
  }
  return `<path d="${d} L${W + 40} ${BOTTOM} L-40 ${BOTTOM}Z"/>`
}
function fir(x, y, h) {
  const w = h * 0.36, tiers = 4
  let d = `M${x} ${y - h}`
  for (let i = 1; i <= tiers; i++) {
    const ty = y - h + (h * i) / tiers, tw = (w * i) / tiers
    d += `L${x + tw} ${ty}L${x + tw * 0.45} ${ty}`
  }
  d += `L${x + w * 0.1} ${y}L${x - w * 0.1} ${y}`
  for (let i = tiers; i >= 1; i--) {
    const ty = y - h + (h * i) / tiers, tw = (w * i) / tiers
    d += `L${x - tw * 0.45} ${ty}L${x - tw} ${ty}`
  }
  return `<path d="${d}Z"/>`
}
function firs(seed, base, { from = -20, to = W + 20, hMin = 40, hMax = 90, gap = 18 } = {}) {
  const r = rng(seed)
  let s = `<rect x="-40" y="${base}" width="${W + 80}" height="${BOTTOM}"/>`
  for (let x = from; x < to; x += gap * (0.6 + r() * 0.8)) s += fir(x, base + 4, hMin + r() * (hMax - hMin))
  return s
}
function tower(x, base, w, h, kind) {
  const t = base - h
  if (kind === 'harbour') {
    const cx = x + w / 2
    return `<rect x="${x}" y="${t}" width="${w}" height="${h + 10}"/>
      <path d="M${cx - w * 1.4} ${t - 4}Q${cx} ${t - 26} ${cx + w * 1.4} ${t - 4}L${cx + w * 1.1} ${t + 6}H${cx - w * 1.1}Z"/>
      <rect x="${cx - 1.5}" y="${t - 62}" width="3" height="40"/>`
  }
  if (kind === 'shangri') return `<path d="M${x} ${base + 10}V${t + 30}L${x + w * 0.3} ${t + 18}V${t}H${x + w * 0.55}V${t + 12}L${x + w} ${t + 26}V${base + 10}Z"/>`
  if (kind === 'slant') return `<path d="M${x} ${base + 10}V${t + 12}L${x + w} ${t}V${base + 10}Z"/>`
  return `<rect x="${x}" y="${t}" width="${w}" height="${h + 10}"/>`
}
// Lit windows, collected while drawing the towers; each switches on at its own point in dusk.
const LIGHTS = []
function windows(seed, x, base, w, h) {
  const r = rng(seed)
  for (let wy = base - h + 8; wy < base - 4; wy += 7)
    for (let wx = x + 3; wx < x + w - 3; wx += 5)
      if (r() < 0.38) LIGHTS.push({ x: wx, y: wy, w: 2, h: 3, at: 0.72 + r() * 0.24 })
}
function skyline(seed, base) {
  const r = rng(seed)
  let s = ''
  for (let x = 640; x < 900; ) {
    const w = 18 + r() * 24, h = 30 + r() * 70
    s += tower(x, base, w, h, r() < 0.3 ? 'slant' : 'box')
    windows(Math.round(x * 13), x, base, w, h)
    x += w + r() * 4
  }
  windows(701, 700, base, 22, 120)
  windows(791, 790, base, 26, 150)
  return s + tower(700, base, 22, 120, 'harbour') + tower(790, base, 26, 160, 'shangri')
}
// Lions Gate Bridge necklace lights and scattered North Shore homes.
function bridgeLights(x1, x2, deck) {
  for (let x = x1; x <= x2; x += 14) LIGHTS.push({ x, y: deck - 3, w: 2, h: 2, at: 0.7 + ((x - x1) / (x2 - x1)) * 0.12 })
}
function hillLights(seed, n, x1, x2, y1, y2) {
  const r = rng(seed)
  for (let i = 0; i < n; i++) LIGHTS.push({ x: x1 + r() * (x2 - x1), y: y1 + r() * (y2 - y1), w: 2, h: 2, at: 0.75 + r() * 0.22 })
}
bridgeLights(960, 1340, 690)
hillLights(77, 40, 120, 1500, 600, 660)
function bridge(x1, x2, deck, towerH) {
  const t1 = x1 + (x2 - x1) * 0.22, t2 = x1 + (x2 - x1) * 0.78, top = deck - towerH
  return `<path fill="none" stroke="currentColor" stroke-width="3" d="M${x1} ${deck - 30}Q${(x1 + t1) / 2} ${deck - 20} ${t1} ${top}Q${(t1 + t2) / 2} ${deck - towerH * 0.25 + 30} ${t2} ${top}Q${(t2 + x2) / 2} ${deck - 20} ${x2} ${deck - 30}"/>
    <rect x="${x1 - 10}" y="${deck}" width="${x2 - x1 + 20}" height="8"/>
    <rect x="${t1 - 6}" y="${top}" width="12" height="${towerH + 40}"/><rect x="${t2 - 6}" y="${top}" width="12" height="${towerH + 40}"/>`
}
// The Lions: twin rounded granite peaks on a shared shoulder.
const lions = (x, s = 1) => [{ x: x + 45 * s, h: 70 * s, w: 70 * s }, { x, h: 120 * s, w: 18 * s }, { x: x + 95 * s, h: 108 * s, w: 16 * s }]

// Far → near. `lag` is how much a layer trails the page as the scene scrolls away (1 = stays put).
const LAYERS = [
  { lag: 0.95, svg: ridge(5, 430, [{ x: 200, h: 140, w: 140 }, { x: 1200, h: 200, w: 180 }, { x: 1500, h: 120, w: 100 }], 10) },
  { lag: 0.8, svg: ridge(9, 520, [...lions(620, 1.25), { x: 250, h: 120, w: 140 }, { x: 1250, h: 140, w: 180 }], 14) },
  { lag: 0.62, svg: ridge(13, 620, [{ x: 400, h: 120, w: 240 }, { x: 1100, h: 100, w: 260 }], 18) },
  { lag: 0.45, svg: firs(17, 720, { hMin: 30, hMax: 60, gap: 14 }) + skyline(21, 720) + bridge(960, 1340, 690, 90) },
  { lag: 0.22, svg: firs(31, 820, { hMin: 70, hMax: 130, gap: 22 }) },
  { lag: 0, svg: firs(37, 900, { from: -30, to: 260, hMin: 260, hMax: 420, gap: 50 }) + firs(41, 900, { from: 1320, to: 1650, hMin: 260, hMax: 430, gap: 52 }) + `<rect x="-40" y="880" width="${W + 80}" height="${BOTTOM}"/>` },
]
const TITLE_AFTER = 1

// A small flock crossing during midday → golden hour, and a plane crossing during sunset → dusk.
// Formation offsets; each bird also gets its own size, flap speed and drift phase.
const BIRDS = [[0, 0], [-34, 14], [-30, -16], [-66, 26], [-60, -30], [-98, 6], [-120, -18]].map(([x, y], i) => ({
  x: x * 1.8, y: y * 1.8, s: 1.9 + ((i * 7) % 5) * 0.12, flap: (0.42 + ((i * 3) % 5) * 0.07).toFixed(2), phase: i * 1.37,
}))
const bird = (b, i) =>
  `<g data-bird="${i}"><path class="bird" style="animation-duration:${b.flap}s;animation-delay:-${(b.phase % 1).toFixed(2)}s" d="M-9 0Q-4 -6 0 0Q4 -6 9 0Q4 -3 0 2Q-4 -3 -9 0Z"/></g>`
// Airliner facing left (nose at x 0, tail fin at the right). The trail streams out behind the tail.
const PLANE = `<g data-plane>
  <path data-trail d="M92 1H92" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <g data-body><path d="M0 0q2-4 10-4h60l12-9h7l-6 11v4h-80q-3 0-3-2z"/><path d="M26 -1h18l-12-16h-6z"/><path d="M30 3h16l-10 11h-6z"/>
  <circle class="beacon" cx="86" cy="-10" r="2.4" fill="#ff5a4e"/><circle class="strobe" cx="36" cy="13" r="1.8" fill="#ffffff"/></g></g>`
const span = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)))

export function initScene(root) {
  const stage = root.querySelector('[data-stage]')
  const svgOpen = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">`
  const stars = (() => {
    const r = rng(99)
    return Array.from({ length: 140 }, () => `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 520).toFixed(0)}" r="${(r() * 1.4 + 0.3).toFixed(2)}" opacity="${(r() * 0.8 + 0.2).toFixed(2)}"/>`).join('')
  })()

  let html = `<div class="layer" data-lag="1">${svgOpen}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" data-c="skyTop"/><stop offset="1" data-c="skyBot"/></linearGradient>
      <radialGradient id="glow"><stop offset="0" data-c="glow" stop-opacity=".55"/><stop offset="1" data-c="glow" stop-opacity="0"/></radialGradient>
    </defs>
    <rect x="-40" y="-400" width="${W + 80}" height="${H + 800}" fill="url(#sky)"/>
    <g data-stars fill="#fff">${stars}</g>
    <circle data-glow r="220" fill="url(#glow)"/>
    <circle data-sun/>
  </svg></div>`
  html += `<div class="layer" data-lag="0.9">${svgOpen}
    <g data-birds>${BIRDS.map(bird).join('')}</g>
    ${PLANE}
  </svg></div>`
  LAYERS.forEach((l, i) => {
    if (i === 3) {
      l.svg += `<g data-lights fill="#ffd27a">${LIGHTS.map((w) => `<rect x="${w.x.toFixed(1)}" y="${w.y.toFixed(1)}" width="${w.w}" height="${w.h}" opacity="0" data-at="${w.at.toFixed(3)}"/>`).join('')}</g>`
    }
    html += `<div class="layer" data-lag="${l.lag}">${svgOpen}<g data-layer="${i}">${l.svg}</g></svg></div>`
    if (i === TITLE_AFTER) html += `<div class="title" data-lag="${(l.lag + LAYERS[i + 1].lag) / 2}"><h1>Jason Meng</h1><p>Vancouver, BC</p></div>`
  })
  stage.innerHTML = html

  const stops = [...stage.querySelectorAll('[data-c]')]
  const groups = [...stage.querySelectorAll('[data-layer]')]
  const sun = stage.querySelector('[data-sun]')
  const glow = stage.querySelector('[data-glow]')
  const starG = stage.querySelector('[data-stars]')
  const movers = [...stage.querySelectorAll('[data-lag]')]
  const birds = stage.querySelector('[data-birds]')
  const birdEls = [...stage.querySelectorAll('[data-bird]')]
  const plane = stage.querySelector('[data-plane]')
  const planeBody = stage.querySelector('[data-body]')
  const trail = stage.querySelector('[data-trail]')
  let progress = 0
  const lights = [...stage.querySelectorAll('[data-at]')].map((el) => [el, Number(el.dataset.at)])
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  let last = -1
  function frame() {
    const travel = root.offsetHeight - innerHeight // scroll distance while the stage is pinned
    const y = scrollY - root.offsetTop
    const p = reduced ? 0.6 : Math.min(1, Math.max(0, y / travel))
    const exit = Math.max(0, y - travel)
    if (p === last && exit > innerHeight * 1.2) return
    last = p
    const s = sample(p)
    for (const st of stops) st.setAttribute('stop-color', s[st.dataset.c])
    groups.forEach((g, i) => {
      const c = mix(s.far, s.near, Math.pow(i / (groups.length - 1), 1.15))
      g.setAttribute('fill', c)
      g.style.color = c
    })
    sun.setAttribute('cy', s.sunY); sun.setAttribute('r', s.sunR); sun.setAttribute('fill', s.sun)
    glow.setAttribute('cy', s.sunY); glow.setAttribute('cx', s.sunX); sun.setAttribute('cx', s.sunX)
    starG.setAttribute('opacity', s.stars)
    // Birds: left → right with a gentle rise, p 0.05–0.5
    progress = p
    birds.setAttribute('fill', mix(s.near, s.far, 0.25))
    plane.setAttribute('fill', mix(s.near, s.far, 0.35))
    plane.style.color = s.skyBot
    if (reduced) animate(0)
    // Lights switch on one by one through dusk
    for (const [el, at] of lights) el.setAttribute('opacity', Math.min(1, Math.max(0, (p - at) / 0.03)).toFixed(2))
    root.style.setProperty('--title', s.title)
    root.style.setProperty('--shade', (0.38 - p * 0.26).toFixed(3))
    root.style.setProperty('--near', s.near)
    if (!reduced) for (const m of movers) m.style.transform = `translate3d(0, ${(exit * Number(m.dataset.lag)).toFixed(1)}px, 0)`
  }
  // Birds and plane: scroll sets where they are along their path; time keeps them moving in place.
  function animate(now) {
    const t = now / 1000
    const p = progress
    // Flock crosses left → right during midday → golden hour, and creeps forward on its own
    const b = span(p, 0.05, 0.5)
    const fx = -150 + b * 1900 + (reduced ? 0 : Math.sin(t * 0.25) * 30)
    const fy = 400 - b * 90 + Math.sin(b * 9) * 14
    const spread = 1 + Math.sin(t * 0.6) * 0.12
    birds.style.opacity = b > 0 && b < 1 ? 1 : 0
    BIRDS.forEach((bd, i) => {
      const bob = reduced ? 0 : Math.sin(t * 1.6 + bd.phase) * 6
      const sway = reduced ? 0 : Math.sin(t * 0.9 + bd.phase * 0.7) * 8
      const tilt = reduced ? 0 : Math.cos(t * 1.6 + bd.phase) * 9
      birdEls[i].setAttribute('transform', `translate(${(fx + bd.x * spread + sway).toFixed(1)} ${(fy + bd.y * spread + bob).toFixed(1)}) rotate(${tilt.toFixed(1)}) scale(${bd.s})`)
    })
    // Plane crosses right → left, nose first, during sunset → dusk; gentle bob and bank, growing trail
    const pl = span(p, 0.45, 0.98)
    const px = 1750 - pl * 2100
    const py = 70 - pl * 30 + (reduced ? 0 : Math.sin(t * 0.8) * 4)
    const bank = reduced ? 0 : Math.sin(t * 0.5) * 2.5
    plane.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(1.4)`)
    planeBody.setAttribute('transform', `rotate(${bank.toFixed(2)} 45 0)`)
    const len = 40 + pl * 320
    const wob = reduced ? 0 : Math.sin(t * 1.3) * 3
    trail.setAttribute('d', `M92 1C${(92 + len * 0.35).toFixed(1)} ${(1 + wob).toFixed(1)} ${(92 + len * 0.7).toFixed(1)} ${(-wob).toFixed(1)} ${(92 + len).toFixed(1)} ${(2 + wob).toFixed(1)}`)
    trail.style.opacity = 0.35
    plane.style.opacity = pl > 0 && pl < 1 ? 1 : 0
  }
  let running = false
  const loop = (now) => {
    animate(now)
    if (running) requestAnimationFrame(loop)
  }
  if (!reduced)
    new IntersectionObserver(([e]) => {
      const was = running
      running = e.isIntersecting
      if (running && !was) requestAnimationFrame(loop)
    }).observe(stage)

  addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true })
  addEventListener('resize', frame)
  frame()
}
