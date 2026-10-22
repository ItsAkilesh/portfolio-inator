# Media and icons

## Images

Images live in `public/images` and are referenced by file name. Every image field has a searchable list with previews and an **Upload** button.

Uploads are optimised in your browser first: they are scaled down to a maximum width and saved as WebP when that makes the file smaller. Change or turn this off under **Media**. GIFs are uploaded as they are.

The **Media** page lists every image with its size, dimensions and how often the content uses it. Filter for unused or large images. **Rename** updates every reference in the content (save or revert your changes first). **Remove** works only for unused images and moves the file to `.admin-history/trash`, so it can be recovered.

## Icons

Icon fields search the icons in your library, and as you type they also search all of [simple-icons](https://simpleicons.org) (over 3,400 brands). Picking one that is not in the library adds it; the console reloads once and keeps your edits.

For anything else, **Import SVG** turns an SVG file into an icon. Only the shapes are kept (paths, rectangles, circles, ellipses, lines, polygons), so scripts or styles in the file cannot reach the site. Flatten transforms in your editor before exporting.

The **Icons** page shows the whole library with usage counts, adds icons in bulk, imports SVGs and removes unused icons. Icons the site itself needs are protected.

The library is `src/icons/library.json`; `src/icons/simpleIcons.generated.ts` is regenerated from it and imports only the icons you use.
