# tsebolai.com

Personal site built with [Astro](https://astro.build), Tailwind CSS v4, GSAP (ScrollTrigger + SplitText) and Lenis.

## Editing content

All copy (experience, stats, skills, interests, links) lives in `src/data/site.ts`.
Colors are the CSS variables at the top of `src/styles/global.css`.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run check    # type-check
```

## Deploying

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.
In the repo's Settings → Pages, set **Source** to **GitHub Actions** (one-time).
