<!--
  File: README.md
  Purpose: Setup, content editing and architecture guide for the portfolio.
  Author: Akilesh
  Date: 2026-10-20 (updated 2026-10-21)
-->

# masterPortfolio

Personal portfolio of Akilesh Srinivasa Kumar, built so anyone can fork it and make it theirs without
touching component code. Vite, React 19 and TypeScript, no UI framework. Everything the site shows
lives in one content file, which you can edit by hand or through a local admin console.

## Run it

```bash
pnpm install
pnpm dev          # dev server; the admin console is at http://localhost:5173/admin
pnpm test         # unit, integration and admin API tests
pnpm build        # type-check, validate content, build to ./build, check no admin code shipped
pnpm fetch-data   # refresh GitHub projects (needs GITHUB_TOKEN and GITHUB_USERNAME in .env)
```

Node 22.12 or newer is required.

## Content

All content is in `src/content/portfolio.json`:

| Key      | What it holds                                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `site`   | Profile, social links, SEO, analytics IDs, settings, footer, interface copy, research profile numbers, project options, portrait |
| `theme`  | Palettes, active palette, default light/dark mode, fonts                                                                         |
| `skills` | "What I do" groups and their tools (they also feed the hero's icon cloud)                                                        |
| `pages`  | Every page, in navigation order. The first page is the home page                                                                 |

The file is described by a schema in `src/content/schema`. The same schema:

- gives the TypeScript types (`src/types/portfolio.ts`), so components cannot read a field that does not exist;
- validates the file when `pnpm dev` or `pnpm build` starts; a build with invalid content fails and lists every problem;
- generates the admin console's forms;
- produces `src/content/portfolio.schema.json`, so VS Code and other editors autocomplete and
  explain every field while you edit the JSON by hand.

### The admin console (dev only)

Run `pnpm dev` and open `/admin`. Every editor is generated from the schema: pick a section, edit,
and press **Save** (or Ctrl/Cmd+S). Saving validates the content, writes `portfolio.json` and the
preview beside the editor updates. Problems are shown on the field that has them, and Save stays
disabled until they are fixed. Images can be uploaded straight into `public/images`.

The console does not exist outside the dev server: its API is a Vite plugin that only runs under
`pnpm dev`, its route is removed from production bundles, and `pnpm build` fails if any admin code
reaches `./build` (`scripts/check-build.mjs`).

Because a dev server on your machine can receive requests from any web page you have open, the admin
API only accepts requests with a `localhost` Host header, a token that is created each time the dev
server starts and given only to the admin page, and (for saves and uploads) an Origin matching the
dev server. Saves are refused if the file changed since you loaded it, so hand edits are never
overwritten. Uploads accept PNG, JPEG, WebP, GIF and AVIF up to 5 MB, checked by their contents.

### Pages and blocks

A page is a path, a navigation label, a "show in navigation" switch and an ordered list of blocks.
Each block type renders an existing section:

| Block          | Renders                                                                         |
| -------------- | ------------------------------------------------------------------------------- |
| `hero`         | Name, summary, buttons, social links, skill-icon cloud, optional research cards |
| `skills`       | "What I do", from `skills`                                                      |
| `header`       | Accent title band, with optional portrait and research cards                    |
| `timeline`     | Jobs or roles with logos and dates; more than one group shows tabs              |
| `degrees`      | Education entries                                                               |
| `featured`     | Large cards, e.g. patents                                                       |
| `publications` | Filterable publication list (the entry's location is the venue)                 |
| `projects`     | GitHub repositories from `src/shared/opensource/projects.json`                  |
| `contact`      | Email, phone and the social links grid                                          |
| `linkGrid`     | A grid of links                                                                 |
| `text`         | Heading and paragraphs                                                          |
| `image`        | One image with an optional caption                                              |

To add a page, add it under **Pages** in the admin (or append it to `pages` in the JSON). Routes and
navigation are generated from the list. `/`, `/admin` and `/splash` are reserved.

### Colours

Each palette is generated from one hue or written token by token:

```json
"palettes": {
  "ocean": { "kind": "generated", "hue": 220, "chroma": 0.16, "lightness": 0.4 },
  "graphite": { "kind": "custom", "light": { "bg": "oklch(0.98 0.002 250)", "...": "..." }, "dark": { "...": "..." } }
}
```

Set `theme.activePalette` to its name. The tokens become CSS custom properties (`--bg`, `--accent`,
`--ink`, ...) on `<html>`, and every stylesheet uses only those variables.

### SEO and analytics

`site.seo` sets the title, description, keywords, canonical URL, favicon, theme colour, link-preview
(Open Graph and Twitter) tags, search-console verification tokens and schema.org Person data. They
are written into `index.html` when the page is served or built, so crawlers and link previews see
them without running JavaScript. `site.analytics` holds the Google Analytics 4 and Microsoft Clarity
IDs; both load only in production builds, and an empty ID turns one off.

### Icons and images

Icons are referenced by key (`"icon": "linkedin"`). `src/icons/registry.ts` imports only the brand
icons in use from [simple-icons](https://simpleicons.org); add one by importing it there and giving it
a key, and it becomes available everywhere, including the admin's icon picker. Icons that
simple-icons does not ship live in `src/icons/customPaths.ts`.

Images live in `public/images/` and are referenced by file name (`"logo_path": "cmu.webp"`). A test
fails if a referenced image is missing.

### Adding a block type

1. Add its schema to `src/content/schema/blocks.ts` and to `blockSchema`.
2. Add a `case` to `src/blocks/BlockView.tsx`. The switch is exhaustive, so type-checking fails until
   the new type has a renderer.

The admin form for it appears automatically.

## Structure

```
src/
  content/      portfolio.json, its schema, and the generated portfolio.schema.json
  portfolio.ts  typed entry point to the content (palettes, navigation, home page, projects)
  blocks/       page renderer and one renderer per block type
  sections/     the section components blocks use (HomeHero, TimelineList, PublicationList, ...)
  components/   layout (Header, Footer, PageBand, Splash) and ui primitives
  admin/        dev-only admin console: schema-driven form generator, draft state, API client
  theme/        palette generator and ThemeProvider
  icons/        icon registry
  lib/          pure helpers
  hooks/        reduced motion, dot field, route effects
tools/vite/     Vite plugins: content validation, SEO tags, dev-only admin API
scripts/        build output check
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `./build`
to `ItsAkilesh/itsakilesh.github.io`. `public/404.html` plus the script in `index.html` keep deep
links working on GitHub Pages.
