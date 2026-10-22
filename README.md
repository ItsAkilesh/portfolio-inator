<!--
  File: README.md
  Purpose: Setup, content editing and architecture guide for the portfolio.
  Author: Akilesh
  Date: 2026-10-20 (updated 2026-10-22)
-->

# Klein Portfolio

Personal portfolio of Akilesh Srinivasa Kumar, built so anyone can fork it and make it theirs without
touching component code. Vite, React 19 and TypeScript, no UI framework. Everything the site shows
lives in one content file, which you can edit by hand or through a local admin console.

## Run it

```bash
pnpm install
pnpm dev          # dev server; the admin console is at http://localhost:5173/admin
pnpm test         # unit, integration and admin API tests (Vitest)
pnpm test:e2e     # end-to-end and accessibility tests in Chromium (Playwright + axe)
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

Run `pnpm dev` and open `/admin`. Every editor is generated from the schema. Guides for each part
live in [`docs/admin`](docs/admin) and are readable inside the console under **Guides**.

| Area       | What you can do                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Editing    | Undo/redo with a history menu, review every change before saving, unsaved edits kept in the browser, search everything with Ctrl/Cmd+K |
| Pages      | Page templates, block palette with pictures, insert between blocks, drag to reorder, duplicate pages and items                         |
| Preview    | Phone, tablet and desktop widths, light and dark, follows the block you edit, click a block to open its fields                         |
| Dates      | Year, optional month and day, "Present" and "expected" ends, a prefix such as "Filed"                                                  |
| Media      | Uploads optimised to WebP in the browser, sizes and usage, rename with references updated, safe removal to a trash folder              |
| Icons      | Search all of simple-icons from any icon field and add with one pick, import SVGs (geometry only), remove unused icons                 |
| Data       | Export/import the content as JSON, import publications from BibTeX and a JSON Resume, local history of every save                      |
| Look       | Theme studio with live palette preview and WCAG contrast scores, SEO panel with search and link-preview previews                       |
| Publishing | Health check (images, empty sections, contrast, SEO, external links), run the build, commit content and push                           |
| Forks      | A setup wizard for name, links, colours and clearing the sample content                                                                |

The console does not exist outside the dev server: its API is a Vite plugin that only runs under
`pnpm dev`, its route and the preview bridge are removed from production bundles, and `pnpm build`
fails if any admin code reaches `./build` (`scripts/check-build.mjs`).

Because a dev server on your machine can receive requests from any web page you have open, the admin
API only accepts requests with a `localhost` Host header, a token that is created each time the dev
server starts and given only to the admin page, and (for changes) an Origin matching the dev server.
Saves are refused if the file changed since you loaded it, so hand edits are never overwritten.
Uploads accept PNG, JPEG, WebP, GIF and AVIF up to 5 MB, checked by their contents; SVG icons keep
only their shapes. Build, git and the GitHub fetcher run fixed commands without a shell, and the link
checker only contacts public internet addresses on standard ports.

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
| `text`         | Heading and Markdown text                                                       |
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

Icons are referenced by key (`"icon": "linkedin"`). The library is `src/icons/library.json`:
simple-icons by slug ([simpleicons.org](https://simpleicons.org)) and custom path icons. Pick any
simple-icons icon in the admin and it is added for you; `src/icons/simpleIcons.generated.ts` is
regenerated from the library so the site bundles only the icons in use.

Images live in `public/images/` and are referenced by file name (`"logo_path": "cmu.webp"`). A test
fails if a referenced image is missing.

### Adding a block type

Copy `src/blocks/custom/callout` to a new folder, change its `schema.ts` and `Block.tsx`, and run
`pnpm dev`: the block is discovered, added to the schema, the admin palette and the renderer. See
[docs/admin/custom-blocks.md](docs/admin/custom-blocks.md).

## Structure

```
src/
  content/      portfolio.json, its schema, and the generated portfolio.schema.json
  portfolio.ts  typed entry point to the content (palettes, navigation, home page, projects)
  blocks/       page renderer and one renderer per block type
  sections/     the section components blocks use (HomeHero, TimelineList, PublicationList, ...)
  components/   layout (Header, Footer, PageBand, Splash) and ui primitives
  admin/        dev-only admin console: form generator, draft and history, tools, panels, preview
  previewBridge/ dev-only messages between the admin and the site in its preview frame
  theme/        palette generator and ThemeProvider
  icons/        icon registry
  lib/          pure helpers
  hooks/        reduced motion, dot field, route effects
tools/vite/     Vite plugins: generated modules, content validation, SEO tags, dev-only admin API
e2e/            Playwright end-to-end and accessibility tests
docs/admin/     guides for the admin console
scripts/        build output check
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `./build`
to `ItsAkilesh/itsakilesh.github.io`. `public/404.html` plus the script in `index.html` keep deep
links working on GitHub Pages.
