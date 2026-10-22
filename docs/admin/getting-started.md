# Getting started

The admin console edits `src/content/portfolio.json`, the one file that holds everything the site shows. It exists only while `pnpm dev` runs and is never part of a build.

## First run

1. Run `pnpm install`, then `pnpm dev`.
2. Open `http://localhost:5173/admin`.
3. If you forked this repository, open **Setup wizard** under Help. It walks through your name, links, search text, colours, and clearing the sample content.

## How editing works

- Every form is generated from the content schema, so fields, help text and validation always match what the site expects.
- Edits go into a **draft**. The preview on the right shows the **saved** file until you press **Save** (or Ctrl/Cmd+S).
- Problems are shown on the field that has them, counted in the navigation, and listed in the save bar. Save stays disabled until they are fixed.
- **Undo** and **Redo** (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z) cover every change, including imports. **History** in the save bar jumps back several steps at once.
- **Review changes** lists every difference from the saved file, with a jump to each field and a per-change undo.
- Unsaved edits are kept in this browser, so a crash or a closed tab does not lose them. You are offered to restore them next time.

## Finding things

Press **Ctrl/Cmd+K** to search sections, tools and every piece of text in the content. Choosing a result opens the right section and the list items on the way to the field.

## Saving and safety

Saving validates the content again on the dev server and writes the file atomically. If the file changed on disk since you loaded it (for example you edited it by hand), the save is refused instead of overwriting your edit; use **Reload file**. A copy of the previous file is kept before every save; see **History** under Data.
