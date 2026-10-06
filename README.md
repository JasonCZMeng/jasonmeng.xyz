# jasonmeng.xyz

Personal site of Jason Meng, built with [Astro](https://astro.build) and deployed on Vercel.

A single page: a Firewatch-style parallax of the North Shore mountains over Vancouver. Scrolling moves the sky from midday through sunset to dusk while an airliner climbs across, then the layers drift apart and reveal a list of work and writing.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static build to dist/
```

- Scene, colours and sun path: `src/scripts/scene.js` (`KEYS` holds the time-of-day keyframes, `LAYERS` the silhouettes, `PLANE_SVG` the airliner)
- Each layer is pre-drawn once per keyframe colour and crossfaded, so scrolling only animates `transform` and `opacity`; avoid per-frame colour or SVG attribute changes
- Work and writing links: `src/pages/index.astro`
- Styles: `src/styles/global.css`

Vercel: framework preset **Astro**, build command `npm run build`, output directory `dist`.
