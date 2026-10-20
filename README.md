<!--
  File: README.md
  Purpose: Setup and customization guide for the portfolio.
  Author: Akilesh
  Date: 2026-10-20
-->

# masterPortfolio

Personal portfolio of Akilesh Srinivasa Kumar. Vite, React 19 and TypeScript, with no UI framework:
a small set of reusable components driven entirely by one config folder.

## Run it

```bash
pnpm install
pnpm dev          # local dev server
pnpm test         # unit + integration tests
pnpm build        # type-check and build to ./build
pnpm fetch-data   # refresh GitHub projects (needs GITHUB_TOKEN and GITHUB_USERNAME in .env)
```

Node 22.12 or newer is required.

## Customize everything from `src/portfolio.ts`

Like the old `src/portfolio.js`, one file holds everything the site shows, and every component reads
from it. It is grouped into banner-marked sections, in this order:

| Section | What it controls |
| --- | --- |
| Site | Splash and dot-field switches, SEO, greeting, social links, navigation, interface copy, analytics IDs |
| Theme | Color palettes, active palette, default light/dark mode, fonts |
| Skills | "What I do" groups and their tools |
| Experience | Experience header and sections (each section becomes a tab) |
| Education | Education header and degrees |
| Research | Research header, citation stats, patents and publications |
| Projects | Projects header and the language-to-icon map |
| Links | Links page and Contact page |

Everything is typed (`src/types/`), so a typo in a field name or icon key fails the build.

### Colors

Pick a palette in the Theme section:

```ts
activePalette: "ink", // or "klein", "forest", "oxblood", "graphite"
```

Make a new one from a single hue (OKLCH, 0 to 360):

```ts
palettes: {
  ocean: makePalette({ hue: 220, chroma: 0.16, lightness: 0.4 }),
}
```

Or write all eleven tokens by hand for light and dark, as the `graphite` example does.
The tokens become CSS custom properties (`--bg`, `--accent`, `--ink`, ...) on `<html>`,
and every stylesheet uses only those variables.

### Icons

Icons are referenced by key (`icon: "linkedin"`). The registry in `src/icons/registry.ts` imports
only the brand icons in use from [simple-icons](https://simpleicons.org); add one by importing it
there and giving it a key. Icons that simple-icons does not ship live in `src/icons/customPaths.ts`.

### Images

Put logos and photos in `public/images/` and reference them by file name (`logo_path: "cmu.webp"`).
A test fails if a referenced image is missing.

### Adding a page

1. Create `src/pages/MyPage.tsx` using `PageBand` and any section components.
2. Add a lazy route in `src/App.tsx`.
3. Add it to `navigation` in `src/portfolio.ts`.

## Structure

```
src/
  portfolio.ts  content and theme config (edit this)
  components/   layout (Header, Footer, PageBand, Splash) and ui primitives
  sections/     page sections built from config (SkillsShowcase, TimelineList, PublicationList, ...)
  pages/        one file per route, code-split
  theme/        palette generator and ThemeProvider
  icons/        icon registry
  lib/          pure helpers (tested)
  hooks/        reduced motion, dot field, route effects
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `./build`
to `ItsAkilesh/itsakilesh.github.io`. `public/404.html` plus the script in `index.html` keep deep links
working on GitHub Pages.
