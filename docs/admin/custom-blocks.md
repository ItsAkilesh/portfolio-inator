# Custom blocks

Add your own block type without touching the rest of the code.

## Steps

1. Copy `src/blocks/custom/callout` to a new folder, for example `src/blocks/custom/quote`. The folder name becomes the block type: lowercase first letter, letters and digits only.
2. In `schema.ts`, export `schema`: a zod object whose `type` is `z.literal("quote")`, built with the field helpers from `src/content/schema/fields.ts` (`text`, `markdown`, `image`, `link`, `flag`, `date`, `list`, ...). Give it `.meta({ title, description })`.
3. In `Block.tsx`, default-export a component that takes `{ block }` typed as `BlockOf<"quote">`.
4. Run `pnpm dev`. The dev server finds the folder and regenerates `schemas.generated.ts` and `components.generated.ts`.

The new type appears in the admin block palette with a generated form, is validated like every other block, and renders on the site, code-split so it loads only on pages that use it.

## Rules

- Use only theme variables (`var(--ink)`, `var(--accent)`, ...) in styles so palettes and dark mode work.
- Keep the block's fields in its own schema; site-wide data belongs in `site`.
- The generated files are committed; a test fails if they are out of date.
