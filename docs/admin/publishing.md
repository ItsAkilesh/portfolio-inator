# Building and publishing

## Health check

**Health check** looks for problems beyond validation: images that are missing or large, images without a description, empty sections, colour pairs with too little contrast, and search and sharing advice. **Check external links** asks every http(s) link in the content whether it still answers. For safety the dev server only contacts public internet addresses on standard ports.

## Build

**Build & publish** runs `pnpm build` (type check, content validation, production build, and a check that no admin code reached `build/`) and shows its output.

## Commit and push

The same page lists the content files git reports as changed: the content, its JSON Schema, the icon library and images. **Commit content** commits only those files, with a [Conventional Commits](https://www.conventionalcommits.org) message such as `docs(content): update experience`. Other changes in your working copy are left alone. **Push** pushes the current branch; pushing to `main` runs the deploy workflow, linked from the page.
